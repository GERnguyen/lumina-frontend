import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/api-base";
import { useAuthStore } from "@/stores/auth-store";
import { readClientAuthSession } from "@/lib/auth-session";
import { CourseApi } from "./course-api";
import type {
  ApiResponse,
  CourseResponse,
  AgentEnvelope,
  LearningPathProposalResponse,
  ProposalOperation,
  LearningPathResponse,
} from "@/types";

export async function sendAgentMessage(params: {
  sessionId?: string | null;
  message: string;
  mode?: string | null;
  onEvent: (eventName: string, payload: AgentEnvelope) => void;
}) {
  const res = await fetch(`/api/recommendations/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      sessionId: params.sessionId ?? null,
      message: params.message,
      mode: params.mode ?? null,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Agent request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let currentEventName = "";
  let currentData = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "") {
          // Empty line indicates event boundary
          if (currentEventName && currentData) {
            try {
              const payload = JSON.parse(currentData);
              params.onEvent(currentEventName, payload);
            } catch (e) {
              console.error("Failed to parse event JSON data:", currentData, e);
            }
          }
          currentEventName = "";
          currentData = "";
        } else if (trimmed.startsWith("event: ")) {
          currentEventName = trimmed.replace("event: ", "").trim();
        } else if (trimmed.startsWith("data: ")) {
          currentData = trimmed.replace("data: ", "").trim();
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const RecommendationApi = {
  /**
   * Lấy active proposal trong session
   */
  async getProposal(sessionId: string): Promise<LearningPathProposalResponse> {
    return apiClient.get(`/api/v1/recommendations/agent/sessions/${sessionId}/proposal`);
  },

  /**
   * Sửa proposal
   */
  async patchProposal(sessionId: string, body: ProposalOperation): Promise<LearningPathProposalResponse> {
    return apiClient.patch(`/api/v1/recommendations/agent/sessions/${sessionId}/proposal`, body);
  },

  /**
   * Tạo learning path từ proposal
   */
  async createLearningPathFromProposal(
    sessionId: string,
    body: { proposalId: string; version: number; confirmed: boolean }
  ): Promise<ApiResponse<LearningPathResponse> | any> {
    return apiClient.post(`/api/v1/recommendations/agent/sessions/${sessionId}/proposal/create`, body);
  },

  /**
   * Gợi ý khóa học cho user (danh sách IDs)
   */
  async getRecommendedCourseIds(
    userId: string,
    params: { top_k?: number } = { top_k: 10 }
  ): Promise<{ userId: string; recommendations: { courseId: string }[] }> {
    return apiClient.get(`/api/v1/recommendations/users/${userId}`, { params });
  },

  /**
   * Aggregated flow: Fetch recommended IDs and then query full course details
   */
  async getRecommendedCourses(userId: string, topK: number = 10): Promise<CourseResponse[]> {
    try {
      const res = await this.getRecommendedCourseIds(userId, { top_k: topK });
      const ids = (res.recommendations ?? [])
        .map((item) => item.courseId)
        .filter(Boolean);

      if (!ids.length) return [];

      const coursesRes = await CourseApi.getCoursesByIds(ids.join(","));
      return coursesRes.data ?? [];
    } catch (error) {
      console.error("Failed to fetch recommended courses:", error);
      return [];
    }
  }
};
