import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedApiResponse,
  UserNotificationResponse,
} from "@/types";

export const NotificationApi = {
  async toggleRead(notificationId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/notifications/${notificationId}/toggle-read`);
  },

  async testPushNotification(params: { title: string; body: string }): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/notifications/test-push", undefined, { params });
  },

  async testInAppNotification(params: { userId: string; title: string; body: string }): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/notifications/test-in-app", undefined, { params });
  },

  async getNotifications(params: {
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<UserNotificationResponse>> {
    return apiClient.get("/api/v1/notifications", { params });
  },

  async countUnreadNotifications(): Promise<ApiResponse<number>> {
    return apiClient.get("/api/v1/notifications/unread-count");
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/notifications/${notificationId}`);
  },
};
