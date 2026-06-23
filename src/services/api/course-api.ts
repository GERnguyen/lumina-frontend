import { apiClient, type FetchOptions } from "@/lib/api-client";
import { cache } from "react";
import type {
  ApiResponse,
  PaginatedApiResponse,
  ArticleLessonResponse,
  AssignmentLessonResponse,
  CategoryResponse,
  CourseCurriculumResponse,
  CourseResponse,
  CreateArticleLessonRequest,
  CreateAssignmentLessonRequest,
  CreateCategoryRequest,
  CreateCourseImageRequest,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateQuizLessonRequest,
  CreateQuizQuestionRequest,
  CreateSectionRequest,
  CreateSubtitleTrackRequest,
  CreateVideoLessonRequest,
  CreateVideoQuestionRequest,
  GenerateDefaultSubtitleJobRequest,
  InstructorCourseStatisticsOverviewResponse,
  LessonPositionResponse,
  LessonResponse,
  MoveLessonRequest,
  MoveSectionRequest,
  PresignedUrlResponse,
  QuizLessonResponse,
  QuizQuestionResponse,
  SectionPositionResponse,
  SectionResponse,
  SubtitleContentResponse,
  SubtitleJobResponse,
  SubtitleTrackResponse,
  SubtitleWordConfidenceResponse,
  SyncQuizRequest,
  TranslateSubtitleJobRequest,
  UpdateArticleLessonRequest,
  UpdateAssignmentLessonRequest,
  UpdateCategoryRequest,
  UpdateCourseImageRequest,
  UpdateCourseRequest,
  UpdateLessonRequest,
  UpdateQuizLessonRequest,
  UpdateQuizQuestionRequest,
  UpdateSectionRequest,
  UpdateSubtitleContentRequest,
  UpdateSubtitleTrackRequest,
  UpdateVideoLessonRequest,
  UpdateVideoQuestionRequest,
  VideoLessonResponse,
  VideoQuestionResponse,
} from "@/types";

// ── CourseApi ──────────────────────────────────────────────
export const CourseApi = {
  getReadableCourseById: cache(async (id: string): Promise<ApiResponse<CourseResponse>> => {
    return apiClient.get(`/api/v1/courses/${id}`, { auth: false });
  }),

  async updateCourse(id: string, body: UpdateCourseRequest): Promise<ApiResponse<CourseResponse>> {
    return apiClient.put(`/api/v1/courses/${id}`, body);
  },

  async getAllCourses(params: {
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
    rating?: number;
    priceFrom?: number;
    priceTo?: number;
    categoryId?: string;
    instructorId?: string;
  }): Promise<PaginatedApiResponse<CourseResponse>> {
    return apiClient.get("/api/v1/courses", { params, auth: false });
  },

  async createCourse(body: CreateCourseRequest): Promise<ApiResponse<CourseResponse>> {
    return apiClient.post("/api/v1/courses", body);
  },

  async unarchiveCourse(id: string): Promise<ApiResponse<CourseResponse>> {
    return apiClient.post(`/api/v1/courses/${id}/unarchive`);
  },

  async submitCourse(id: string): Promise<ApiResponse<CourseResponse>> {
    return apiClient.post(`/api/v1/courses/${id}/submit`);
  },

  async archiveCourse(id: string): Promise<ApiResponse<CourseResponse>> {
    return apiClient.post(`/api/v1/courses/${id}/archive`);
  },

  async moveSection(id: string, sectionId: string, body: MoveSectionRequest): Promise<ApiResponse<SectionPositionResponse>> {
    return apiClient.patch(`/api/v1/courses/${id}/curriculum/sections/${sectionId}/position`, body);
  },

  async moveLesson(id: string, lessonId: string, body: MoveLessonRequest): Promise<ApiResponse<LessonPositionResponse>> {
    return apiClient.patch(`/api/v1/courses/${id}/curriculum/lessons/${lessonId}/position`, body);
  },

  async getRejectReason(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get(`/api/v1/courses/${id}/reject-reason`);
  },

  async getEditableCourseDraft(id: string): Promise<ApiResponse<CourseResponse>> {
    return apiClient.get(`/api/v1/courses/${id}/draft`);
  },

  async getEditableDraftCurriculum(id: string): Promise<ApiResponse<CourseCurriculumResponse>> {
    return apiClient.get(`/api/v1/courses/${id}/draft/curriculum`);
  },

  getReadableCurriculum: cache(async (id: string): Promise<ApiResponse<CourseCurriculumResponse>> => {
    return apiClient.get(`/api/v1/courses/${id}/curriculum`, { auth: false });
  }),

  async getMyCourses(params: {
    page?: number;
    size?: number;
    query?: string;
    sort?: string;
    rating?: number;
    priceFrom?: number;
    priceTo?: number;
    status?: string;
    publishStatus?: string;
    categoryId?: string;
  }): Promise<PaginatedApiResponse<CourseResponse>> {
    return apiClient.get("/api/v1/courses/mine", { params });
  },

  async getCoursesByIds(ids: string): Promise<ApiResponse<CourseResponse[]>> {
    return apiClient.get("/api/v1/courses/ids", { params: { ids } });
  },
};

// ── SectionApi ──────────────────────────────────────────────
export const SectionApi = {
  async updateSection(courseId: string, sectionId: string, body: UpdateSectionRequest): Promise<ApiResponse<SectionResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/sections/${sectionId}`, body);
  },

  async deleteSection(courseId: string, sectionId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/sections/${sectionId}`);
  },

  async createSection(courseId: string, body: CreateSectionRequest): Promise<ApiResponse<SectionResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/sections`, body);
  },
};

// ── LessonApi ──────────────────────────────────────────────
export const LessonApi = {
  async updateLesson(courseId: string, sectionId: string, lessonId: string, body: UpdateLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, body);
  },

  async deleteLesson(courseId: string, sectionId: string, lessonId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
  },

  async createLesson(courseId: string, sectionId: string, body: CreateLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/sections/${sectionId}/lessons`, body);
  },
};

// ── VideoLessonApi ──────────────────────────────────────────────
export const VideoLessonApi = {
  async getVideoByLessonId(courseId: string, lessonId: string, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<VideoLessonResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos`, options);
  },

  async updateVideoLesson(courseId: string, lessonId: string, body: UpdateVideoLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos`, body);
  },

  async createVideoLesson(courseId: string, lessonId: string, body: CreateVideoLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos`, body);
  },
};

// ── SubtitleTrackApi ──────────────────────────────────────────────
export const SubtitleTrackApi = {
  async updateSubtitle(courseId: string, lessonId: string, subtitleId: string, body: UpdateSubtitleTrackRequest): Promise<ApiResponse<SubtitleTrackResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/${subtitleId}`, body);
  },

  async deleteSubtitle(courseId: string, lessonId: string, subtitleId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/${subtitleId}`);
  },

  async getSubtitleContent(courseId: string, lessonId: string, subtitleId: string): Promise<ApiResponse<SubtitleContentResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/${subtitleId}/content`);
  },

  async updateSubtitleContent(courseId: string, lessonId: string, subtitleId: string, body: UpdateSubtitleContentRequest): Promise<ApiResponse<SubtitleTrackResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/${subtitleId}/content`, body);
  },

  async getSubtitles(courseId: string, lessonId: string): Promise<ApiResponse<SubtitleTrackResponse[]>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles`);
  },

  async createSubtitle(courseId: string, lessonId: string, body: CreateSubtitleTrackRequest): Promise<ApiResponse<SubtitleTrackResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles`, body);
  },

  async createTranslationJobs(courseId: string, lessonId: string, body: TranslateSubtitleJobRequest): Promise<ApiResponse<SubtitleJobResponse[]>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/ai/translations`, body);
  },

  async createDefaultSubtitleJob(courseId: string, lessonId: string, body: GenerateDefaultSubtitleJobRequest): Promise<ApiResponse<SubtitleJobResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/ai/default`, body);
  },

  async getSubtitleWordConfidence(courseId: string, lessonId: string, subtitleId: string): Promise<ApiResponse<SubtitleWordConfidenceResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/${subtitleId}/word-confidence`);
  },

  async getSubtitlePresignedUrl(courseId: string, lessonId: string, params: { fileName: string; contentType: string; languageCode: string }): Promise<ApiResponse<PresignedUrlResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/presigned-url`, { params });
  },

  async getSubtitleJobs(courseId: string, lessonId: string): Promise<ApiResponse<SubtitleJobResponse[]>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/jobs`);
  },

  async getSubtitleJob(courseId: string, lessonId: string, jobId: string): Promise<ApiResponse<SubtitleJobResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/subtitles/jobs/${jobId}`);
  },
};

// ── VideoQuestionApi ──────────────────────────────────────────────
export const VideoQuestionApi = {
  async getQuestionById(courseId: string, lessonId: string, id: string): Promise<ApiResponse<VideoQuestionResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions/${id}`);
  },

  async updateQuestion(courseId: string, lessonId: string, id: string, body: UpdateVideoQuestionRequest): Promise<ApiResponse<VideoQuestionResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions/${id}`, body);
  },

  async deleteQuestion(courseId: string, lessonId: string, id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions/${id}`);
  },

  async getQuestionsByLessonId(courseId: string, lessonId: string): Promise<ApiResponse<VideoQuestionResponse[]>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions`);
  },

  async createQuestion(courseId: string, lessonId: string, body: CreateVideoQuestionRequest): Promise<ApiResponse<VideoQuestionResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/videos/questions`, body);
  },
};

// ── QuizLessonApi ──────────────────────────────────────────────
export const QuizLessonApi = {
  async getQuizByLessonId(courseId: string, lessonId: string): Promise<ApiResponse<QuizLessonResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes`);
  },

  async updateQuizSettings(courseId: string, lessonId: string, body: UpdateQuizLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes`, body);
  },

  async createQuizLesson(courseId: string, lessonId: string, body: CreateQuizLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes`, body);
  },

  async syncQuiz(courseId: string, lessonId: string, body: SyncQuizRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes/sync`, body);
  },
};

// ── QuizQuestionApi ──────────────────────────────────────────────
export const QuizQuestionApi = {
  async updateQuestion(courseId: string, lessonId: string, questionId: string, body: UpdateQuizQuestionRequest): Promise<ApiResponse<QuizQuestionResponse>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes/questions/${questionId}`, body);
  },

  async deleteQuestion(courseId: string, lessonId: string, questionId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes/questions/${questionId}`);
  },

  async getQuestions(courseId: string, lessonId: string): Promise<ApiResponse<QuizQuestionResponse[]>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes/questions`);
  },

  async addQuestion(courseId: string, lessonId: string, body: CreateQuizQuestionRequest): Promise<ApiResponse<QuizQuestionResponse>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/quizzes/questions`, body);
  },
};

// ── AssignmentLessonApi ──────────────────────────────────────────────
export const AssignmentLessonApi = {
  async getAssigmentByLessonId(courseId: string, lessonId: string): Promise<ApiResponse<AssignmentLessonResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/assignments`);
  },

  async updateAssignmentLesson(courseId: string, lessonId: string, body: UpdateAssignmentLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/assignments`, body);
  },

  async createAssignmentLesson(courseId: string, lessonId: string, body: CreateAssignmentLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/assignments`, body);
  },
};

// ── ArticleLessonApi ──────────────────────────────────────────────
export const ArticleLessonApi = {
  async getArticleByLessonId(courseId: string, lessonId: string, options?: Omit<FetchOptions, "method" | "body">): Promise<ApiResponse<ArticleLessonResponse>> {
    return apiClient.get(`/api/v1/courses/${courseId}/lessons/${lessonId}/articles`, options);
  },

  async updateArticleLesson(courseId: string, lessonId: string, body: UpdateArticleLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/courses/${courseId}/lessons/${lessonId}/articles`, body);
  },

  async createArticleLesson(courseId: string, lessonId: string, body: CreateArticleLessonRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/lessons/${lessonId}/articles`, body);
  },
};

// ── CourseImageApi ──────────────────────────────────────────────
export const CourseImageApi = {
  async updateCourseImage(courseId: string, imageId: string, body: UpdateCourseImageRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/courses/${courseId}/images/${imageId}`, body);
  },

  async deleteCourseImage(courseId: string, imageId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/courses/${courseId}/images/${imageId}`);
  },

  async uploadCourseImages(courseId: string, body: CreateCourseImageRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post(`/api/v1/courses/${courseId}/images`, body);
  },
};

// ── CategoryApi ──────────────────────────────────────────────
export const CategoryApi = {
  async updateCategory(id: string, body: UpdateCategoryRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.put(`/api/v1/categories/${id}`, body);
  },

  async getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get("/api/v1/categories", { auth: false });
  },

  async createCategory(body: CreateCategoryRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/categories", body);
  },
};

// ── CourseStatisticsApi ──────────────────────────────────────────────
export const CourseStatisticsApi = {
  async getInstructorOverview(params: {
    groupBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<InstructorCourseStatisticsOverviewResponse>> {
    return apiClient.get("/api/v1/courses/mine/statistics/overview", { params });
  },
};

// ── CoursePresignedUrlApi ──────────────────────────────────────────────
export const CoursePresignedUrlApi = {
  async getPresignedUrl(params: { fileName: string; contentType: string }): Promise<ApiResponse<PresignedUrlResponse>> {
    return apiClient.get("/api/v1/courses/upload/presigned-url", { params });
  },
};

