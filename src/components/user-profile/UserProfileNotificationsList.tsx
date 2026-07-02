"use client";

import React, { useState, useEffect } from "react";
import { NotificationApi } from "@/services/api/notification-api";
import type { UserNotificationResponse } from "@/types";
import { getNotificationHelper, mapNotificationUrl } from "@/lib/notifications";
import { Bell, Check, Trash2, MailOpen, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/format";

export function UserProfileNotificationsList() {
  const [notifications, setNotifications] = useState<UserNotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await NotificationApi.getNotifications({ page: 1, size: 20 });
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Listen for changes from other components (bell dropdown, ws, etc.)
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, id, isRead, notification } = customEvent.detail || {};

      if (action === "mark-all-read") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } else if (action === "mark-all-unread") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })));
      } else if (action === "toggle-read") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead } : n))
        );
      } else if (action === "delete") {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else if (action === "new-notification") {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
      } else if (action === "refresh") {
        loadNotifications();
      }
    };

    window.addEventListener("cinx:notifications-changed", handleSync);
    return () => {
      window.removeEventListener("cinx:notifications-changed", handleSync);
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
      console.error("Failed to toggle read status:", err);
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
      const url = mapNotificationUrl(n);
      if (url && url !== "#") {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E9EAF0] pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
            Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({unreadCount} unread)</span>}
          </h2>
          <p className="mt-2 text-sm text-[#6E7485]">
            Manage your latest system announcements, Streaks, Q&A activity, and certificates updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="h-10 px-4 rounded-xl border border-primary-200 bg-primary-50 text-xs font-bold text-[#564FFD] transition hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={handleMarkAllAsUnread}
                disabled={unreadCount === notifications.length}
                className="h-10 px-4 rounded-xl border border-[#E9EAF0] bg-white text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Mark all as unread
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex py-20 flex-col items-center justify-center space-y-2">
          <Loader2 className="size-6 animate-spin text-[#7872FD]" />
          <span className="text-xs text-gray-400 font-bold">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-16 text-center">
          <MailOpen className="size-10 mx-auto text-[#7872FD] opacity-40 mb-3" />
          <p className="text-base font-semibold text-[#1D2026]">No notifications yet.</p>
          <p className="mt-2 text-sm text-[#6E7485]">We will notify you here when you have updates.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E9EAF0] bg-white divide-y divide-[#E9EAF0]">
          {notifications.map((n) => {
            const { icon: TypeIcon, color: typeColor, displayTitle, displayMessage } = getNotificationHelper(n);

            return (
              <div
                key={n.id}
                className={cn(
                  "p-5 flex items-start justify-between gap-4 transition",
                  !n.isRead ? "bg-primary-50/15" : "hover:bg-[#F5F7FA]/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className="flex-1 flex items-start gap-4 text-left min-w-0 group/item cursor-pointer"
                >
                  <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border", typeColor)}>
                    <TypeIcon className="size-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-normal transition-colors group-hover/item:text-primary-600 flex items-center justify-between gap-2",
                        !n.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      )}
                    >
                      <span>{displayTitle}</span>
                      {n.sentAt && (
                        <span className="text-[10px] font-normal text-gray-400 shrink-0 whitespace-nowrap">
                          {formatShortDate(n.sentAt)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 leading-normal">{displayMessage}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => n.id && handleToggleRead(n.id)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border transition cursor-pointer",
                      !n.isRead
                        ? "border-[#E9EAF0] bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                        : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                    title={n.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {n.isRead ? <Eye className="size-4" /> : <Check className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => n.id && handleDelete(n.id)}
                    className="flex size-8 items-center justify-center rounded-lg border border-[#E9EAF0] bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
