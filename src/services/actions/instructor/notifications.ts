"use server";

import { NotificationApi } from "@/services/api/notification-api";

export async function getInstructorNotificationsAction(params: {
  page?: number;
  size?: number;
}) {
  try {
    return await NotificationApi.getNotifications(params);
  } catch (err) {
    console.error("Failed to fetch instructor notifications:", err);
    return { data: [], meta: { totalElements: 0, totalPages: 1 } };
  }
}
