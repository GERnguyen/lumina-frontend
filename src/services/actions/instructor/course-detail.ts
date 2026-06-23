import { CourseApi, QuizLessonApi } from "@/services/api/course-api";
import { LearningEngagementStatisticsApi, LearningProgressApi, QuizSessionApi } from "@/services/api/learning-api";
import { SocialStatisticsApi } from "@/services/api/social-api";
import { UserApi } from "@/services/api/user-api";
import { getInstructorCourseStatisticsData } from "./engagement";
import type {
  CourseQnAStatisticsResponse,
  CourseCurriculumResponse,
  CourseEngagementOverviewResponse,
  CourseProgressResponse,
  CourseResponse,
  CourseStatisticsResponse,
  LearningItemProgressResponse,
  QuizQuestionAnalyticsResponse,
  QuizSessionResponse,
  ReviewStatisticsResponse,
  UserDto,
} from "@/types";

export interface InstructorLearnerProgress {
  progress: CourseProgressResponse;
  user?: UserDto | null;
}

export interface InstructorQuizLessonData {
  lessonId: string;
  lessonTitle: string;
  sectionTitle?: string;
  analytics: QuizQuestionAnalyticsResponse[];
  sessions: QuizSessionResponse[];
  questionCount: number;
}

export interface InstructorCourseOverviewData {
  course: CourseResponse | null;
  curriculum: CourseCurriculumResponse | null;
  statistics: CourseStatisticsResponse | null;
  engagement: CourseEngagementOverviewResponse | null;
  reviewStats: ReviewStatisticsResponse | null;
  qnaStats: CourseQnAStatisticsResponse | null;
}

async function settleValue<T>(promise: Promise<T>, fallback: T): Promise<T> {
  const result = await Promise.allSettled([promise]);
  return result[0]?.status === "fulfilled" ? result[0].value : fallback;
}

export async function getInstructorCourseOverviewData(courseId: string): Promise<InstructorCourseOverviewData> {
  let course: CourseResponse | null = null;
  let isDraft = false;

  try {
    const courseRes = await CourseApi.getReadableCourseById(courseId);
    course = courseRes?.data || null;
    isDraft = course?.status === "DRAFT" || !course;
  } catch (err) {
    // If the public/published course doesn't exist or is not found, treat as DRAFT
    isDraft = true;
  }

  try {
    if (isDraft) {
      // For draft courses, call editable/draft endpoints
      const draftRes = await CourseApi.getEditableCourseDraft(courseId);
      const draftCourse = draftRes?.data || null;
      const curriculumRes = await CourseApi.getEditableDraftCurriculum(courseId).catch(() => null);
      return {
        course: draftCourse,
        curriculum: curriculumRes?.data || null,
        statistics: null,
        engagement: null,
        reviewStats: null,
        qnaStats: null,
      };
    } else {
      // For published courses, fetch curriculum and other statistics in parallel
      const [curriculumRes, statisticsRes, engagementRes, reviewStatsRes, qnaStatsRes] = await Promise.allSettled([
        CourseApi.getReadableCurriculum(courseId),
        getInstructorCourseStatisticsData(courseId),
        LearningEngagementStatisticsApi.getInstructorCourseEngagement(courseId, { groupBy: "DAY" }),
        SocialStatisticsApi.getReviewStatistics(courseId),
        SocialStatisticsApi.getCourseQnAStatistics(courseId, { groupBy: "DAY" }),
      ]);

      return {
        course,
        curriculum: curriculumRes.status === "fulfilled" ? curriculumRes.value?.data || null : null,
        statistics: statisticsRes.status === "fulfilled" ? statisticsRes.value || null : null,
        engagement: engagementRes.status === "fulfilled" ? engagementRes.value?.data || null : null,
        reviewStats: reviewStatsRes.status === "fulfilled" ? reviewStatsRes.value?.data || null : null,
        qnaStats: qnaStatsRes.status === "fulfilled" ? qnaStatsRes.value?.data || null : null,
      };
    }
  } catch (err) {
    console.error(`Failed to fetch overview data for course ${courseId}:`, err);
    return {
      course: null,
      curriculum: null,
      statistics: null,
      engagement: null,
      reviewStats: null,
      qnaStats: null,
    };
  }
}

export async function getInstructorLearnersProgressData(courseId: string): Promise<InstructorLearnerProgress[]> {
  try {
    const progressRes = await LearningProgressApi.getCourseProgress(courseId);
    const progressList = progressRes.data || [];

    const learners = await Promise.all(
      progressList.map(async (progress) => {
        if (!progress.userId) return { progress, user: null };
        const user = await settleValue(UserApi.getUserById(progress.userId), { data: undefined });
        return { progress, user: user.data || null };
      })
    );

    return learners;
  } catch (err) {
    console.error(`Failed to fetch learner progress for course ${courseId}:`, err);
    return [];
  }
}

export async function getInstructorStudentProgressData(
  courseId: string,
  studentId: string
): Promise<LearningItemProgressResponse[]> {
  try {
    const res = await LearningProgressApi.getStudentProgress(courseId, studentId);
    return res.data || [];
  } catch (err) {
    console.error(`Failed to fetch student progress for course ${courseId}/${studentId}:`, err);
    return [];
  }
}

export async function getInstructorQuizData(courseId: string): Promise<InstructorQuizLessonData[]> {
  try {
    const curriculumRes = await CourseApi.getReadableCurriculum(courseId);
    const sections = curriculumRes.data?.sections || [];
    const quizLessons = sections.flatMap((section) =>
      (section.lessons || [])
        .filter((lesson) => lesson.lessonType === "QUIZ" && lesson.id)
        .map((lesson) => ({
          lessonId: lesson.id as string,
          lessonTitle: lesson.title || "Untitled quiz",
          sectionTitle: section.title,
        }))
    );

    const quizData = await Promise.all(
      quizLessons.map(async (lesson) => {
        const [quizRes, analyticsRes, sessionsRes] = await Promise.allSettled([
          QuizLessonApi.getQuizByLessonId(courseId, lesson.lessonId),
          QuizSessionApi.getQuizAnalytics(courseId, lesson.lessonId),
          QuizSessionApi.getQuizSessions(lesson.lessonId, { page: 1, size: 50 }),
        ]);

        const quiz = quizRes.status === "fulfilled" ? quizRes.value?.data : undefined;
        const analytics = analyticsRes.status === "fulfilled" ? analyticsRes.value?.data || [] : [];
        const sessions = sessionsRes.status === "fulfilled" ? sessionsRes.value?.data || [] : [];

        return {
          ...lesson,
          analytics,
          sessions,
          questionCount: quiz?.questions?.length || analytics.length || 0,
        };
      })
    );

    return quizData;
  } catch (err) {
    console.error(`Failed to fetch quiz data for course ${courseId}:`, err);
    return [];
  }
}
