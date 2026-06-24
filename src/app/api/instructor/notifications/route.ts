import { type NextRequest } from "next/server";
import { NotificationApi } from "@/services/api/notification-api";

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") || 1);
  const size = Number(request.nextUrl.searchParams.get("size") || 50);
  const [countPayload, notifications] = await Promise.all([
    NotificationApi.countUnreadNotifications().catch(() => undefined),
    NotificationApi.getNotifications({ page, size }).catch(() => undefined),
  ]);

  return Response.json({
    unreadCount: typeof countPayload?.data === "number" ? countPayload.data : undefined,
    items: notifications?.data || [],
    success: Boolean(notifications?.success),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const notificationId = String(body.notificationId || "");

  if (!notificationId) {
    return Response.json({ message: "Notification ID is required." }, { status: 400 });
  }

  await NotificationApi.toggleRead(notificationId);
  return Response.json({ success: true });
}
