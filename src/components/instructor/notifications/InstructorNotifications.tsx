"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Bell, Check, Trash2, MailOpen, X } from "lucide-react";
import { NotificationApi } from "@/services/api/notification-api";
import type { UserNotificationResponse } from "@/types";
import { Client } from "@stomp/stompjs";
import { readClientAuthSession } from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api-base";
import { mapNotificationUrl, getNotificationHelper } from "@/lib/notifications";
import { formatShortDate } from "@/lib/format";

interface InstructorNotificationsProps {
  emptyDescription?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

export function InstructorNotifications({
  emptyDescription = "Chưa có thông báo nào.",
  buttonClassName = "",
  iconClassName = "",
}: InstructorNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [routerPending, startRouterTransition] = useTransition();

  // Realtime Toast State
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string }[]>([]);

  const showToast = (title: string, message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        NotificationApi.getNotifications({ page: 1, size: 10 }),
        NotificationApi.countUnreadNotifications(),
      ]);
      if (listRes?.data) setNotifications(listRes.data);
      if (countRes?.data !== undefined) setUnreadCount(countRes.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  // Fetch initial notifications
  useEffect(() => {
    loadNotifications();
    // Refresh notifications fallback every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, id, isRead, notification, count } = customEvent.detail || {};

      if (action === "mark-all-read") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else if (action === "mark-all-unread") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })));
        if (count !== undefined) setUnreadCount(count);
      } else if (action === "toggle-read") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead } : n))
        );
        setUnreadCount((prev) => (isRead ? Math.max(0, prev - 1) : prev + 1));
      } else if (action === "delete") {
        setNotifications((prev) => {
          const target = prev.find((n) => n.id === id);
          if (target && !target.isRead) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
          return prev.filter((n) => n.id !== id);
        });
      } else if (action === "new-notification") {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev].slice(0, 10);
        });
        setUnreadCount((prev) => prev + 1);
      } else if (action === "refresh") {
        loadNotifications();
      }
    };

    window.addEventListener("cinx:notifications-changed", handleSync);
    return () => {
      window.removeEventListener("cinx:notifications-changed", handleSync);
    };
  }, []);

  // WebSocket Connection
  useEffect(() => {
    let stompClient: Client | null = null;

    async function setupWebSocket() {
      try {
        const session = await readClientAuthSession();
        const token = session?.accessToken;
        if (!token) return;

        // Resolve absolute URL protocol
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let wsUrl = API_BASE_URL;
        if (wsUrl.startsWith("/")) {
          wsUrl = `${window.location.origin}${wsUrl}`;
        }
        const parsedUrl = new URL(wsUrl);
        parsedUrl.protocol = wsProtocol;
        parsedUrl.pathname = "/ws/notifications";
        parsedUrl.searchParams.set("token", token);

        stompClient = new Client({
          brokerURL: parsedUrl.toString(),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("WebSocket connected to notifications");
            stompClient?.subscribe("/user/queue/notifications", (message) => {
              try {
                const payload = JSON.parse(message.body);
                console.log("Received realtime notification:", payload);

                // Add to local state
                const newNotification: any = {
                  id: payload.id || payload.referenceId || String(Date.now()),
                  title: payload.title,
                  message: payload.message,
                  type: payload.type,
                  referenceId: payload.referenceId,
                  actionUrl: payload.actionUrl,
                  metadata: payload.metadata,
                  isRead: false,
                };

                window.dispatchEvent(
                  new CustomEvent("cinx:notifications-changed", {
                    detail: {
                      action: "new-notification",
                      notification: newNotification,
                    },
                  })
                );

                // Resolve display content for toast
                const { displayTitle, displayMessage } = getNotificationHelper(newNotification);
                showToast(displayTitle, displayMessage);
              } catch (e) {
                console.error("Failed to parse websocket notification message:", e);
              }
            });
          },
          onStompError: (frame) => {
            console.error("STOMP error occurred:", frame.headers["message"], frame.body);
          },
          onDisconnect: () => {
            console.log("WebSocket disconnected from notifications");
          }
        });

        stompClient.activate();
      } catch (err) {
        console.error("Failed to initialize websocket notifications:", err);
      }
    }

    setupWebSocket();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const handleToggleRead = async (id: string) => {
    try {
      await NotificationApi.toggleRead(id);
      const target = notifications.find((n) => n.id === id);
      if (target) {
        window.dispatchEvent(
          new CustomEvent("cinx:notifications-changed", {
            detail: {
              action: "toggle-read",
              id,
              isRead: !target.isRead,
            },
          })
        );
      }
    } catch (err) {
      console.error("Failed to toggle read state:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await NotificationApi.deleteNotification(id);
      window.dispatchEvent(
        new CustomEvent("cinx:notifications-changed", {
          detail: {
            action: "delete",
            id,
          },
        })
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      window.dispatchEvent(
        new CustomEvent("cinx:notifications-changed", {
          detail: {
            action: "mark-all-read",
          },
        })
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkAllAsUnread = async () => {
    try {
      await NotificationApi.markAllAsUnread();
      const countRes = await NotificationApi.countUnreadNotifications();
      window.dispatchEvent(
        new CustomEvent("cinx:notifications-changed", {
          detail: {
            action: "mark-all-unread",
            count: countRes?.data ?? 0,
          },
        })
      );
    } catch (err) {
      console.error("Failed to mark all as unread:", err);
    }
  };

  const handleNotificationClick = async (n: UserNotificationResponse) => {
    if (!n.id) return;
    try {
      if (!n.isRead) {
        await handleToggleRead(n.id);
      }
      setIsOpen(false);
      const url = mapNotificationUrl(n);
      if (url && url !== "#") {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition cursor-pointer ${buttonClassName}`}
        aria-label="Toggle notifications"
      >
        <Bell className={iconClassName || "size-5"} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 animate-bounce items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-200 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-50 overflow-hidden text-left animate-note-pop">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Thông báo</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-primary-600 hover:underline cursor-pointer"
                  >
                    Đọc tất cả
                  </button>
                ) : notifications.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllAsUnread}
                    className="text-[10px] font-bold text-gray-500 hover:underline cursor-pointer"
                  >
                    Chưa đọc tất cả
                  </button>
                ) : null}
                {unreadCount > 0 && (
                  <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[9px] font-bold text-primary-600">
                    {unreadCount} mới
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 space-y-1 select-none">
                  <MailOpen className="size-8 mx-auto opacity-30 mb-1" />
                  <p className="text-[11px] font-medium text-gray-500 leading-normal">
                    {emptyDescription}
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: TypeIcon, color: typeColor, displayTitle, displayMessage } = getNotificationHelper(n);

                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start justify-between gap-2.5 transition ${!n.isRead ? "bg-primary-50/35" : "hover:bg-gray-50"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className="flex-1 flex items-start gap-2.5 text-left min-w-0 group/item cursor-pointer"
                      >
                        <div className={`size-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${typeColor}`}>
                          <TypeIcon className="size-3.5" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className={`text-xs text-gray-900 leading-normal group-hover/item:text-primary-600 transition-colors flex items-center justify-between gap-2 ${!n.isRead ? "font-bold" : "font-medium"}`}>
                            <span>{displayTitle}</span>
                            {n.sentAt && (
                              <span className="text-[9px] font-normal text-gray-400 shrink-0 whitespace-nowrap">
                                {formatShortDate(n.sentAt)}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-400 leading-normal text-wrap">
                            {displayMessage}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => n.id && handleToggleRead(n.id)}
                          className={`p-1 rounded-md transition cursor-pointer ${!n.isRead
                              ? "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              : "text-emerald-600 hover:bg-gray-100"
                            }`}
                          title={n.isRead ? "Đánh dấu là chưa đọc" : "Đánh dấu là đã đọc"}
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => n.id && handleDelete(n.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Floating Toast Area */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 bg-white border border-gray-100 rounded-lg shadow-2xl flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-4 duration-300 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-600" />
            <div className="size-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <Bell className="size-4 text-primary-600" />
            </div>
            <div className="space-y-1 min-w-0 pr-6">
              <p className="text-xs font-bold text-gray-900 leading-normal">{toast.title}</p>
              <p className="text-[10px] text-gray-400 leading-normal">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
