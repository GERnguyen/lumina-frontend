import type {
  CertificateRequestResponse,
  ArticleLessonResponse,
  AssignmentLessonResponse,
  QuizLessonResponse,
  VideoLessonResponse,
} from "@/types";

export type LearningLessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";

export type LearningLesson = {
  id: string;
  title: string;
  duration?: number;
  type: LearningLessonType;
  isCompleted: boolean;
  isCurrent: boolean;
  isPassed?: boolean;
  score?: number;
};

export type LearningSection = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  completedCount: number;
  lessons: LearningLesson[];
};

export type LearningLessonContent =
  | { type: "VIDEO"; video?: VideoLessonResponse; resumePosition?: number }
  | { type: "ARTICLE"; article?: ArticleLessonResponse }
  | { type: "QUIZ"; quiz?: QuizLessonResponse }
  | { type: "ASSIGNMENT"; assignment?: AssignmentLessonResponse; submission?: unknown };

export type LearningPageData = {
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  coverUrl?: string;
  instructorName?: string;
  hasCertificate?: boolean;
  certificateTitle?: string;
  certificate?: CertificateRequestResponse;
  isCourseCompleted?: boolean;
  isCoursePassed?: boolean;
  progressPercent: number;
  completedItems: number;
  totalItems: number;
  currentLesson: LearningLesson;
  previousLessonId?: string;
  nextLessonId?: string;
  sections: LearningSection[];
  content: LearningLessonContent;
};
