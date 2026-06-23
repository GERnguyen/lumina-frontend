import { apiClient } from "@/lib/api-client";
import { cache } from "react";
import type {
  ApiResponse,
  DeviceTokenRequest,
  PresignedUrlResponse,
  UpdatePreferredCategoriesRequest,
  UpdateProfileRequest,
  UserDto,
} from "@/types";

export const UserApi = {
  async getUserById(id: string): Promise<ApiResponse<UserDto>> {
    return apiClient.get(`/api/v1/users/${id}`, { auth: false });
  },

  async updateUser(id: string, body: UpdateProfileRequest): Promise<ApiResponse<UserDto>> {
    return apiClient.put(`/api/v1/users/${id}`, body);
  },

  async updatePreferredCategories(body: UpdatePreferredCategoriesRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put("/api/v1/users/me/preferred-categories", body);
  },

  async saveDeviceToken(body: DeviceTokenRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/users/device-tokens", body);
  },

  getCurrentUser: cache(async (): Promise<ApiResponse<UserDto>> => {
    return apiClient.get("/api/v1/users/me");
  }),
};

export const PresignedUrlApi = {
  async getPresignedUrl(params: { fileName: string; contentType: string }): Promise<ApiResponse<PresignedUrlResponse>> {
    return apiClient.get("/api/v1/users/upload/presigned-url", { params });
  },
};
