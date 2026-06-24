import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PolicySummaryResponse, PolicyDetailResponse } from "@/types";

export const PolicyApi = {
  async getPublishedPolicies(): Promise<ApiResponse<PolicySummaryResponse[]>> {
    return apiClient.get("/api/v1/policies", { auth: false });
  },

  async getPublishedPolicyBySlug(slug: string): Promise<ApiResponse<PolicyDetailResponse>> {
    return apiClient.get(`/api/v1/policies/${slug}`, { auth: false });
  },
};
