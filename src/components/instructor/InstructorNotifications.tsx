"use client";

import { Bell, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api-base";
import { readClientAuthSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { NotificationService } from "@/services/notificationService";
import { useAuthStore } from "@/stores/auth-store";
import type { UserNotificationResponse } from "@/types";

type SocketStatus = "connecting" | "connected" | "offline";

type StompFrame = {
  command: string;
  body: string;
};

function notificationsSocketUrl() {
  const url = new URL(API_BASE_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/notifications";
  url.search = "";
  return url.toString();
}

function encodeFrame(command: string, headers: Record<string, string>, body = "") {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${headerLines.join("\n")}\n\n${body}\0`;
}

function parseFrames(raw: string): StompFrame[] {
  return raw
    .split("\0")
    .map((frame) => frame.trim())
    .filter(Boolean)
    .map((frame) => {
      const separatorIndex = frame.indexOf("\n\n");
      const head = separatorIndex >= 0 ? frame.slice(0, separatorIndex) : frame;
      const body = separatorIndex >= 0 ? frame.slice(separatorIndex + 2) : "";
      const [command] = head.split("\n");
      return { command, body };
    });
}

function realtimeNotification(payload: unknown): UserNotificationResponse | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const item = payload as { title?: unknown; message?: unknown };
  return {
    id: `realtime-${Date.now()}`,
    title: typeof item.title === "string" ? item.title : "New notification",
    message: typeof item.message === "string" ? item.message : "",
    isRead: false,
  };
}

function countUnreadFromItems(items: UserNotificationResponse[]) {
  return items.filter((item) => item.isRead === false).length;
}

function mergeNotifications(current: UserNotificationResponse[], incoming: UserNotificationResponse[]) {
  const merged = new Map<string, UserNotificationResponse>();

  [...current, ...incoming].forEach((item) => {
    const title = item.title || "";
    const message = item.message || "";
    const compositeKey = `${title}:${message}`;
    const existing = merged.get(compositeKey);

    if (!existing) {
      merged.set(compositeKey, item);
    } else {
      const isExistingRealtime = String(existing.id).startsWith("realtime-");
      const isNewRealtime = String(item.id).startsWith("realtime-");

      const mergedItem = { ...existing, ...item };
      if (isExistingRealtime && !isNewRealtime) {
        mergedItem.id = item.id;
      } else if (!isExistingRealtime) {
        mergedItem.id = existing.id;
      }

      // If one is database and the other is realtime, trust the database item's status.
      // Otherwise, if both are database items, trust the incoming item (which is from the server).
      if (isExistingRealtime && !isNewRealtime) {
        mergedItem.isRead = item.isRead;
      } else if (!isExistingRealtime && isNewRealtime) {
        mergedItem.isRead = existing.isRead;
      } else {
        mergedItem.isRead = item.isRead;
      }

      merged.set(compositeKey, mergedItem);
    }
  });

  return [...merged.values()].slice(0, 80);
}

export function InstructorNotifications({
  emptyDescription = "Course reviews and approval updates will appear here.",
  buttonClassName,
  iconClassName,
}: {
  emptyDescription?: string;
  buttonClassName?: string;
  iconClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<UserNotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  const [loadError, setLoadError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | undefined>(undefined);

  const badgeText = useMemo(() => (unreadCount > 99 ? "99+" : String(unreadCount)), [unreadCount]);
  const visibleItems = useMemo(() => (isShowingAll ? items : items.slice(0, 8)), [isShowingAll, items]);

  // Hydrate from localStorage after mount (cannot do in useState initializer — causes SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumina:notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setUnreadCount(countUnreadFromItems(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lumina:notifications", JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);


  async function loadNotifications(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setLoadError("");
    const countPayload = await NotificationService.countUnreadNotifications().catch(() => undefined);
    const serverUnreadCount = typeof countPayload?.data === "number" ? countPayload.data : undefined;
    const notifications = await NotificationService.getNotifications({
      page: 1,
      size: 50,
    }).catch(() => undefined);
    const nextItems = notifications?.data || [];
    if (!notifications?.success && serverUnreadCount && !nextItems.length) {
      setLoadError("Could not load notification history. Please try again.");
    }
    if (notifications?.success || nextItems.length) {
      setItems((current) => mergeNotifications(current, nextItems));
    }
    setUnreadCount(serverUnreadCount ?? countUnreadFromItems(nextItems));
    setIsLoading(false);
  }

  async function getAccessToken() {
    const storeToken = useAuthStore.getState().accessToken;
    if (storeToken) return storeToken;
    const session = await readClientAuthSession().catch(() => undefined);
    if (session?.accessToken) {
      useAuthStore.getState().setAccessToken(session.accessToken);
      return session.accessToken;
    }
    return undefined;
  }

  useEffect(() => {
    loadNotifications({ silent: items.length > 0 });
  }, []);

  useEffect(() => {
    let disposed = false;
    let retryCount = 0;

    async function connect() {
      const token = await getAccessToken();
      if (disposed || !token) {
        setSocketStatus("offline");
        return;
      }

      setSocketStatus("connecting");
      const socket = new WebSocket(notificationsSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        retryCount = 0;
        socket.send(encodeFrame("CONNECT", {
          "accept-version": "1.2",
          "heart-beat": "10000,10000",
          Authorization: `Bearer ${token}`,
        }));
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== "string" || event.data === "\n") return;
        parseFrames(event.data).forEach((frame) => {
          if (frame.command === "CONNECTED") {
            setSocketStatus("connected");
            socket.send(encodeFrame("SUBSCRIBE", {
              id: "instructor-notifications",
              destination: "/user/queue/notifications",
              ack: "auto",
            }));
            return;
          }

          if (frame.command !== "MESSAGE") return;
          let payload: unknown;
          try {
            payload = JSON.parse(frame.body || "{}") as unknown;
          } catch {
            return;
          }
          const notification = realtimeNotification(payload);
          if (!notification) return;
          setItems((current) => mergeNotifications([notification], current).slice(0, 50));
          setUnreadCount((current) => current + 1);
        });
      };

      socket.onclose = () => {
        if (disposed) return;
        setSocketStatus("offline");

        const delay = Math.min(30000, Math.pow(2, retryCount) * 2000);
        retryCount++;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setSocketStatus("offline");
        socket.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  async function openNotifications() {
    setIsOpen((value) => !value);
    if (!isOpen && !items.length) {
      await loadNotifications({ silent: true });
    }
  }

  async function showAllNotifications() {
    setIsShowingAll(true);
    await loadNotifications({ silent: true });
  }

  async function markAsRead(notification: UserNotificationResponse) {
    if (!notification.id || notification.isRead) return;

    setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
    setUnreadCount((current) => Math.max(0, current - 1));

    if (notification.id.startsWith("realtime-")) return;
    await NotificationService.toggleRead({ notificationId: notification.id }).catch(() => loadNotifications({ silent: true }));
  }

  async function markAllAsRead() {
    const unreadDbItems = items.filter((item) => !item.isRead && item.id && !item.id.startsWith("realtime-"));

    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    if (unreadDbItems.length === 0) return;

    try {
      await Promise.all(
        unreadDbItems.map((item) =>
          NotificationService.toggleRead({ notificationId: item.id! }).catch((e) => {
            console.error("Failed to mark notification as read:", item.id, e);
          })
        )
      );
    } catch (e) {
      console.error("Error in markAllAsRead:", e);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={openNotifications}
        className={cn(
          "relative flex size-12 items-center justify-center rounded-[18px] bg-[#F5F7FA] text-[#4E5566] transition hover:bg-[#EBEBFF] hover:text-[#564FFD] active:scale-[0.96]",
          buttonClassName,
        )}
      >
        <Bell className={cn("size-5", iconClassName)} />
        {/* suppressHydrationWarning: badge count is client-only (localStorage) and will always be 0 on SSR */}
        <span suppressHydrationWarning className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#564FFD] px-1.5 text-[10px] font-bold leading-5 text-white" style={{ display: unreadCount > 0 ? undefined : "none" }}>
          {badgeText}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[360px] overflow-hidden rounded-[18px] bg-white shadow-[0_18px_48px_rgba(29,32,38,0.18)] ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-[#E9EAF0] px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-[#1D2026]">Notifications</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-[#8C94A3]">{unreadCount} unread update{unreadCount === 1 ? "" : "s"}</p>
                {unreadCount > 0 && (
                  <>
                    <span className="text-[10px] text-[#E9EAF0]">•</span>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-[#564FFD] hover:underline"
                    >
                      Mark all as read
                    </button>
                  </>
                )}
              </div>
            </div>
            <span className={cn("size-2.5 rounded-full", socketStatus === "connected" ? "bg-[#23BD33]" : "bg-[#CED1D9]")} aria-label={socketStatus === "connected" ? "Realtime connected" : "Realtime offline"} />
          </div>

          <div className="max-h-[390px] overflow-y-auto p-2">
            {isLoading && !items.length ? (
              <div className="flex h-32 items-center justify-center text-[#564FFD]">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : loadError && !visibleItems.length ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-bold text-[#1D2026]">Could not load notifications</p>
                <p className="mt-1 text-xs leading-5 text-[#8C94A3]">{loadError}</p>
                <button
                  type="button"
                  onClick={() => loadNotifications({ silent: true })}
                  className="mt-4 rounded-full bg-[#EBEBFF] px-4 py-2 text-xs font-bold text-[#564FFD] transition hover:bg-[#DEDFFF]"
                >
                  Retry
                </button>
              </div>
            ) : visibleItems.length ? (
              visibleItems.map((item) => (
                <button
                  key={item.id || `${item.title}-${item.message}`}
                  type="button"
                  onClick={() => markAsRead(item)}
                  className={cn(
                    "flex w-full gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-[#F8F8FF]",
                    item.isRead ? "opacity-70" : "bg-[#F8F8FF]",
                  )}
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", item.isRead ? "bg-[#CED1D9]" : "bg-[#564FFD]")} />
                  <span className="min-w-0">
                    <span className={cn("line-clamp-1 text-sm font-bold", item.isRead ? "text-[#6E7485]" : "text-[#1D2026]")}>{item.title || "Notification"}</span>
                    <span className={cn("mt-1 line-clamp-2 text-xs leading-5", item.isRead ? "text-[#A1A5B3]" : "text-[#6E7485]")}>{item.message || "You have a new update."}</span>
                  </span>
                </button>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-bold text-[#1D2026]">No notifications yet</p>
                <p className="mt-1 text-xs leading-5 text-[#8C94A3]">{emptyDescription}</p>
              </div>
            )}
          </div>
          {items.length > visibleItems.length ? (
            <div className="border-t border-[#E9EAF0] p-3">
              <button
                type="button"
                onClick={showAllNotifications}
                className="flex h-10 w-full items-center justify-center rounded-[14px] bg-[#F5F7FA] text-sm font-bold text-[#564FFD] transition hover:bg-[#EBEBFF] active:scale-[0.98]"
              >
                View all notifications
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
