import { apiClient } from "@/lib/api-client";
import { cache } from "react";
import type {
  ApiResponse,
  PaginatedApiResponse,
  AddToWishlistRequest,
  AdminReportResponse,
  AnswerDto,
  CourseQnAStatisticsResponse,
  CreateAnswerRequest,
  CreateQnAReportRequest,
  CreateQuestionRequest,
  CreateReportReviewRequest,
  CreateReviewReactionRequest,
  CreateReviewReplyRequest,
  CreateReviewRequest,
  QuestionDto,
  ReviewResponse,
  ReviewStatisticsResponse,
  UpdateAnswerRequest,
  UpdateQuestionRequest,
  UpdateReviewReplyRequest,
  UpdateReviewRequest,
  WishlistItemResponse,
} from "@/types";

// ── ReviewApi ──────────────────────────────────────────────
export const ReviewApi = {
  async updateReview(reviewId: string, body: UpdateReviewRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/reviews/${reviewId}`, body);
  },

  async deleteReview(reviewId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/reviews/${reviewId}`);
  },

  async updateReviewReply(replyId: string, body: UpdateReviewReplyRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/reviews/replies/${replyId}`, body);
  },

  async deleteReviewReply(replyId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/reviews/replies/${replyId}`);
  },

  async getReviewsByCourseId(params: {
    courseId: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedApiResponse<ReviewResponse>> {
    return apiClient.get("/api/v1/reviews", { params, auth: false });
  },

  async createReview(body: CreateReviewRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/reviews", body);
  },

  async reportReview(reviewId: string, body: CreateReportReviewRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/reviews/${reviewId}/report`, body);
  },

  async createReviewReply(reviewId: string, body: CreateReviewReplyRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/reviews/${reviewId}/replies`, body);
  },

  async reactReview(reviewId: string, body: CreateReviewReactionRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/reviews/${reviewId}/react`, body);
  },
};

// ── CourseQnAApi ──────────────────────────────────────────────
export const CourseQnAApi = {
  async getQuestionById(questionId: string): Promise<ApiResponse<QuestionDto>> {
    return apiClient.get(`/api/v1/course-qna/questions/${questionId}`);
  },

  async updateQuestion(questionId: string, body: UpdateQuestionRequest): Promise<ApiResponse<QuestionDto>> {
    return apiClient.put(`/api/v1/course-qna/questions/${questionId}`, body);
  },

  async deleteQuestion(questionId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/course-qna/questions/${questionId}`);
  },

  async updateAnswer(answerId: string, body: UpdateAnswerRequest): Promise<ApiResponse<AnswerDto>> {
    return apiClient.put(`/api/v1/course-qna/answers/${answerId}`, body);
  },

  async deleteAnswer(answerId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/course-qna/answers/${answerId}`);
  },

  async getQuestions(params: {
    courseId: string;
    lessonId?: string;
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<QuestionDto>> {
    return apiClient.get("/api/v1/course-qna/questions", { params });
  },

  async createQuestion(body: CreateQuestionRequest): Promise<ApiResponse<QuestionDto>> {
    return apiClient.post("/api/v1/course-qna/questions", body);
  },

  async upvoteQuestion(questionId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/course-qna/questions/${questionId}/upvote`);
  },

  async reportQuestion(questionId: string, body: CreateQnAReportRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/course-qna/questions/${questionId}/report`, body);
  },

  async createAnswer(body: CreateAnswerRequest): Promise<ApiResponse<AnswerDto>> {
    return apiClient.post("/api/v1/course-qna/answers", body);
  },

  async upvoteAnswer(answerId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/course-qna/answers/${answerId}/upvote`);
  },

  async reportAnswer(answerId: string, body: CreateQnAReportRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/course-qna/answers/${answerId}/report`, body);
  },

  async getAnswersForQuestion(
    questionId: string,
    params: {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<AnswerDto>> {
    return apiClient.get(`/api/v1/course-qna/questions/${questionId}/answers`, { params });
  },

  async getReplies(
    answerId: string,
    params: {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<AnswerDto>> {
    return apiClient.get(`/api/v1/course-qna/answers/${answerId}/replies`, { params });
  },
};

// ── WishlistApi ──────────────────────────────────────────────
export const WishlistApi = {
  getWishlist: cache(async (): Promise<ApiResponse<WishlistItemResponse[]>> => {
    return apiClient.get("/api/v1/wishlist");
  }),

  async addToWishlist(body: AddToWishlistRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/wishlist", body);
  },

  async removeFromWishlist(courseId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete("/api/v1/wishlist", { params: { courseId } });
  },
};

// ── SocialStatisticsApi ──────────────────────────────────────────────
export const SocialStatisticsApi = {
  async getReviewStatistics(courseId: string): Promise<ApiResponse<ReviewStatisticsResponse>> {
    return apiClient.get(`/api/v1/reviews/statistics/courses/${courseId}`, { auth: false });
  },

  async getCourseQnAStatistics(
    courseId: string,
    params: {
      groupBy?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<CourseQnAStatisticsResponse>> {
    return apiClient.get(`/api/v1/course-qna/statistics/courses/${courseId}`, { params });
  },
};

// ── AdminReportApi ──────────────────────────────────────────────
export const AdminReportApi = {
  async getReports(params: {
    type?: string;
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<AdminReportResponse>> {
    return apiClient.get("/api/v1/reports", { params });
  },

  async dismissReport(reportId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/reports/${reportId}/dismiss`);
  },

  async deleteReportedContent(reportId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/reports/${reportId}/content`);
  },
};
