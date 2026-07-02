"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, MailOpen, Trash2 } from "lucide-react";
import type { PaginatedMetadata, UserNotificationResponse } from "@/types";
import { formatShortDate } from "@/lib/format";
import { getNotificationHelper, mapNotificationUrl } from "@/lib/notifications";
import { NotificationApi } from "@/services/api/notification-api";
import { Button, DataTable, DataTableEmptyState, DataTablePagination } from "../../ui/shared";
import { InstructorCard } from "../../ui/shared/InstructorCard";

interface InstructorNotificationsPageProps {
  notifications: UserNotificationResponse[];
  meta: PaginatedMetadata;
  filters: {
    page: number;
    size: number;
  };
}

type NotificationWithTimestamp = UserNotificationResponse & {
  createdAt?: string | null;
};

export function InstructorNotificationsPage({
  notifications: initialNotifications,
  meta,
  filters,
}: InstructorNotificationsPageProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<UserNotificationResponse[]>(initialNotifications);

  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Listen for changes from other components (bell dropdown, ws, etc.)
  React.useEffect(() => {
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
      }
    };

    window.addEventListener("cinx:notifications-changed", handleSync);
    return () => {
      window.removeEventListener("cinx:notifications-changed", handleSync);
    };
  }, []);

  const totalElements = meta.totalElements ?? 0;
  const totalPages = meta.totalPages ?? 1;
  const currentPage = meta.page ?? 1;

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const activeFilters = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(activeFilters.page));
    searchParams.set("size", String(activeFilters.size));
    router.push(`/instructor/notifications?${searchParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters({ page: newPage });
    }
  };

  const handleToggleRead = React.useCallback(async (id: string) => {
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
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle read status:", err);
    }
  }, [notifications, router]);

  const handleDelete = React.useCallback(async (id: string) => {
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
      router.refresh();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, [router]);

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
      router.refresh();
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
      router.refresh();
    } catch (err) {
      console.error("Failed to mark all as unread:", err);
    }
  };

  const handleNotificationClick = React.useCallback(async (notification: UserNotificationResponse) => {
    if (!notification.id) return;

    try {
      if (!notification.isRead) {
        await handleToggleRead(notification.id);
      }
      const url = mapNotificationUrl(notification);
      if (url && url !== "#") {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  }, [handleToggleRead]);

  const columns = useMemo<ColumnDef<UserNotificationResponse>[]>(
    () => [
      {
        id: "content",
        header: "Nội dung thông báo",
        cell: ({ row }) => {
          const notification = row.original;
          const { icon: TypeIcon, color: typeColor, displayTitle, displayMessage } = getNotificationHelper(notification);

          return (
            <button
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className="flex w-full items-start gap-4 text-left"
            >
              <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border ${typeColor}`}>
                <TypeIcon className="size-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p
                  className={`text-xs leading-normal transition-colors group-hover:text-primary-600 ${notification.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"
                    }`}
                >
                  {displayTitle}
                </p>
                <p className="text-[11px] leading-normal text-gray-500">{displayMessage}</p>
              </div>
            </button>
          );
        },
      },
      {
        id: "createdAt",
        header: "Thời gian nhận",
        cell: ({ row }) => {
          const timestamp = row.original.sentAt || (row.original as NotificationWithTimestamp).createdAt;
          return (
            <span className="text-xs font-medium text-gray-500">
              {timestamp ? formatShortDate(timestamp) : "Vừa xong"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const notification = row.original;

          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={notification.isRead ? "text-gray-500" : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"}
                title={notification.isRead ? "Đánh dấu là chưa đọc" : "Đánh dấu là đã đọc"}
                onClick={() => notification.id && handleToggleRead(notification.id)}
              >
                {notification.isRead ? <Eye className="size-3.5" /> : <Check className="size-3.5" />}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                title="Xóa thông báo"
                onClick={() => notification.id && handleDelete(notification.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete, handleNotificationClick, handleToggleRead]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <InstructorCard bodyClassName="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Danh sách thông báo</h2>
          <p className="mt-1 text-xs text-gray-500">
            Xem tất cả các cập nhật hệ thống, tin nhắn và cảnh báo hoạt động của bạn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-primary-600 border-primary-100 hover:bg-primary-50 cursor-pointer"
              >
                Đọc tất cả
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsUnread}
                className="text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Chưa đọc tất cả
              </Button>
            </>
          )}
        </div>
      </InstructorCard>

      <InstructorCard
        bodyClassName="p-0"
        footer={
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="thông báo"
            onPageChange={handlePageChange}
          />
        }
      >
        {notifications.length === 0 ? (
          <DataTableEmptyState
            icon={MailOpen}
            title="Không có thông báo nào"
            description="Tài khoản của bạn hiện tại chưa có thông báo mới nào từ hệ thống."
          />
        ) : (
          <DataTable
            columns={columns}
            data={notifications}
            minWidth={820}
            rowClassName={(notification) =>
              notification.isRead ? undefined : "bg-primary-50/40 hover:bg-primary-50/60"
            }
          />
        )}
      </InstructorCard>
    </div>
  );
}
