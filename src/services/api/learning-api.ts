import { apiClient } from "@/lib/api-client";
import { cache } from "react";
import type {
  ApiResponse,
  PaginatedApiResponse,
  AssignmentSubmissionResponse,
  CertificateRequestResponse,
  ChooseQuizAnswerRequest,
  CourseEngagementOverviewResponse,
  CourseProgressResponse,
  CreateAssignmentSubmissionRequest,
  CreateVideoNoteRequest,
  DailyGoalResponse,
  GradeEssayRequest,
  InVideoAssessmentSubmissionResponse,
  LearningItemProgressResponse,
  LearningPathRequest,
  LearningPathResponse,
  QuizQuestionAnalyticsResponse,
  QuizSessionQuestionResponse,
  QuizSessionResponse,
  SetDailyGoalRequest,
  SubmitQuizSessionRequest,
  SubmitVideoQuestionRequest,
  TrackingVideoLessonRequest,
  UpdateVideoNoteRequest,
  UserStreakResponse,
  VideoLessonTrackingHistoryResponse,
  VideoNoteDto,
} from "@/types";

// ── VideoNoteApi ──────────────────────────────────────────────
export const VideoNoteApi = {
  async updateNote(noteId: string, body: UpdateVideoNoteRequest): Promise<ApiResponse<VideoNoteDto>> {
    return apiClient.put(`/api/v1/learning/video-notes/${noteId}`, body);
  },

  async deleteNote(noteId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/learning/video-notes/${noteId}`);
  },

  async getNotesByLesson(courseId: string, lessonId: string): Promise<ApiResponse<VideoNoteDto[]>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-notes`);
  },

  async createNote(courseId: string, lessonId: string, body: CreateVideoNoteRequest): Promise<ApiResponse<VideoNoteDto>> {
    return apiClient.post(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-notes`, body);
  },

  async getNotesByCourse(courseId: string): Promise<ApiResponse<VideoNoteDto[]>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/video-notes`);
  },
};

// ── DailyGoalApi ──────────────────────────────────────────────
export const DailyGoalApi = {
  async getDailyGoals(params: { date?: string }): Promise<ApiResponse<DailyGoalResponse[]>> {
    return apiClient.get("/api/v1/daily-goals", { params });
  },

  async editDailyGoal(body: SetDailyGoalRequest): Promise<ApiResponse<DailyGoalResponse>> {
    return apiClient.put("/api/v1/daily-goals", body);
  },

  async setDailyGoal(body: SetDailyGoalRequest): Promise<ApiResponse<DailyGoalResponse>> {
    return apiClient.post("/api/v1/daily-goals", body);
  },

  async deleteDailyGoal(params: {
    date?: string;
    goalType: string;
    targetItemId?: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete("/api/v1/daily-goals", { params });
  },

  async getDailyGoalsInMonth(params: { year: number; month: number }): Promise<ApiResponse<DailyGoalResponse[]>> {
    return apiClient.get("/api/v1/daily-goals/month", { params });
  },
};

// ── CertificateApi ──────────────────────────────────────────────
export const CertificateApi = {
  async rejectCertificate(requestId: string): Promise<ApiResponse<CertificateRequestResponse>> {
    return apiClient.put(`/api/v1/certificates/requests/${requestId}/reject`);
  },

  async approveCertificate(requestId: string): Promise<ApiResponse<CertificateRequestResponse>> {
    return apiClient.put(`/api/v1/certificates/requests/${requestId}/approve`);
  },

  async applyForCertificate(courseId: string): Promise<ApiResponse<CertificateRequestResponse>> {
    return apiClient.post(`/api/v1/certificates/apply/${courseId}`);
  },

  async getAllRequests(params: {
    status?: string;
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<CertificateRequestResponse>> {
    return apiClient.get("/api/v1/certificates/requests", { params });
  },

  async getRequestsByCourse(
    courseId: string,
    params: {
      status?: string;
      page?: number;
      size?: number;
      query?: string;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<CertificateRequestResponse>> {
    return apiClient.get(`/api/v1/certificates/requests/${courseId}`, { params });
  },

  async getMyCertificates(): Promise<ApiResponse<CertificateRequestResponse[]>> {
    return apiClient.get("/api/v1/certificates/my-certificates");
  },

  async getMyCertificate(courseId: string): Promise<ApiResponse<CertificateRequestResponse>> {
    return apiClient.get(`/api/v1/certificates/my-certificate/${courseId}`);
  },
};

// ── QuizSessionApi ──────────────────────────────────────────────
export const QuizSessionApi = {
  async gradeEssay(sessionId: string, body: GradeEssayRequest): Promise<ApiResponse<QuizSessionResponse>> {
    return apiClient.post(`/api/v1/learning/quiz-sessions/${sessionId}/grade-essay`, body);
  },

  async submitQuizSession(quizSessionId: string, body: SubmitQuizSessionRequest): Promise<ApiResponse<QuizSessionResponse>> {
    return apiClient.post(`/api/v1/learning/quiz-sessions/${quizSessionId}/submit`, body);
  },

  async chooseQuizSessionQuestion(quizSessionId: string, body: ChooseQuizAnswerRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/learning/quiz-sessions/${quizSessionId}/choose`, body);
  },

  async createQuizSession(courseId: string, lessonId: string): Promise<ApiResponse<QuizSessionResponse>> {
    return apiClient.post(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/quiz-sessions`);
  },

  async getQuizSession(quizSessionId: string): Promise<ApiResponse<QuizSessionResponse>> {
    return apiClient.get(`/api/v1/learning/quiz-sessions/${quizSessionId}`);
  },

  async getQuizSessionQuestions(
    quizSessionId: string,
    params: {
      page?: number;
      size?: number;
      query?: string;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<QuizSessionQuestionResponse>> {
    return apiClient.get(`/api/v1/learning/quiz-sessions/${quizSessionId}/questions`, { params });
  },

  async getQuizSessions(
    lessonId: string,
    params: {
      userId?: string;
      page?: number;
      size?: number;
      query?: string;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<QuizSessionResponse>> {
    return apiClient.get(`/api/v1/learning/lessons/${lessonId}/quiz-sessions`, { params });
  },

  async getQuizAnalytics(courseId: string, lessonId: string): Promise<ApiResponse<QuizQuestionAnalyticsResponse[]>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/quiz-sessions/analytics`);
  },
};

// ── VideoTrackingApi ──────────────────────────────────────────────
export const VideoTrackingApi = {
  async getVideoLessonTrackingHistories(
    courseId: string,
    lessonId: string,
    params: {
      page?: number;
      size?: number;
      query?: string;
      sort?: string;
    }
  ): Promise<PaginatedApiResponse<VideoLessonTrackingHistoryResponse>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking`, { params });
  },

  async trackVideoProgress(courseId: string, lessonId: string, body: TrackingVideoLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking`, body);
  },

  async submitVideoQuestionAnswer(courseId: string, lessonId: string, body: SubmitVideoQuestionRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking/questions/submit`, body);
  },

  async getVideoQuestionSubmissions(courseId: string, lessonId: string): Promise<ApiResponse<InVideoAssessmentSubmissionResponse[]>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking/submissions`);
  },

  async getVideoLessonTrackingHistory(courseId: string, lessonId: string): Promise<ApiResponse<VideoLessonTrackingHistoryResponse>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/lessons/${lessonId}/video-tracking/history`);
  },
};

// ── LearningProgressApi ──────────────────────────────────────────────
export const LearningProgressApi = {
  async markItemAsComplete(itemId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/learning/course-progress/items/${itemId}/complete`);
  },

  async getCourseProgressByCourseIds(courseIds: string): Promise<ApiResponse<CourseProgressResponse[]>> {
    return apiClient.get("/api/v1/learning/course-progress", { params: { courseIds } });
  },

  getMyCourseProgress: cache(async (courseId: string): Promise<ApiResponse<CourseProgressResponse>> => {
    return apiClient.get(`/api/v1/learning/course-progress/${courseId}`);
  }),

  getLearningItemProgressByCourseId: cache(async (courseId: string): Promise<ApiResponse<LearningItemProgressResponse[]>> => {
    return apiClient.get(`/api/v1/learning/course-progress/${courseId}/items`);
  }),

  async getStudentProgress(courseId: string, studentId: string): Promise<ApiResponse<LearningItemProgressResponse[]>> {
    return apiClient.get(`/api/v1/learning/course-progress/courses/${courseId}/students/${studentId}/progress`);
  },

  async getCourseProgress(courseId: string): Promise<ApiResponse<CourseProgressResponse[]>> {
    return apiClient.get(`/api/v1/learning/course-progress/courses/${courseId}/progress`);
  },
};

// ── AssignmentApi ──────────────────────────────────────────────
export const AssignmentApi = {
  async getAssignmentSubmission(params: { assignmentId: string }): Promise<ApiResponse<AssignmentSubmissionResponse>> {
    return apiClient.get("/api/v1/learning/assignment-submissions", { params });
  },

  async submitAssignment(assignmentId: string, body: CreateAssignmentSubmissionRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/learning/assignment-submissions", body, { params: { assignmentId } });
  },

  async scoreAssignmentSubmission(submissionId: string, score: number): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/learning/assignment-submissions/${submissionId}/score`, undefined, { params: { score } });
  },

  async getAssignmentSubmissions(params: {
    assignmentId: string;
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
  }): Promise<PaginatedApiResponse<AssignmentSubmissionResponse>> {
    return apiClient.get("/api/v1/learning/assignment-submissions/list", { params });
  },

  async deleteAssignmentSubmission(submissionId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/learning/assignment-submissions/${submissionId}`);
  },
};

// ── LearningActivityApi ──────────────────────────────────────────────
export const LearningActivityApi = {
  async recordActivity(body: { activityType: string; durationSeconds: number; courseId?: string; lessonId?: string }): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/learning/activity", body);
  },
};

// ── LearningPathApi ──────────────────────────────────────────────
export const LearningPathApi = {
  async getLearningPaths(): Promise<ApiResponse<LearningPathResponse[]>> {
    return apiClient.get("/api/v1/learning-paths");
  },

  async createLearningPath(body: LearningPathRequest): Promise<ApiResponse<LearningPathResponse>> {
    return apiClient.post("/api/v1/learning-paths", body);
  },

  async getLearningPath(id: string): Promise<ApiResponse<LearningPathResponse>> {
    return apiClient.get(`/api/v1/learning-paths/${id}`);
  },

  async getActiveLearningPath(): Promise<ApiResponse<LearningPathResponse>> {
    return apiClient.get("/api/v1/learning-paths/active");
  },

  async dropActiveLearningPath(): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete("/api/v1/learning-paths/active");
  },
};

// ── StreakApi ──────────────────────────────────────────────
export const StreakApi = {
  async getMyStreak(): Promise<ApiResponse<UserStreakResponse>> {
    return apiClient.get("/api/v1/streaks/me");
  },
};

// ── LearningEngagementStatisticsApi ──────────────────────────────────────────────
export const LearningEngagementStatisticsApi = {
  async getInstructorCourseEngagement(
    courseId: string,
    params: {
      groupBy?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<CourseEngagementOverviewResponse>> {
    return apiClient.get(`/api/v1/learning/courses/${courseId}/engagement/overview`, { params });
  },
};
