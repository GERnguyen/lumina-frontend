import "server-only";

import { cache } from "react";
import {
  ArticleLessonApi,
  AssignmentLessonApi,
  CourseApi,
  QuizLessonApi,
  VideoLessonApi,
} from "@/services/api/course-api";
import {
  AssignmentApi,
  CertificateApi,
  LearningProgressApi,
  VideoTrackingApi,
} from "@/services/api/learning-api";
import type {
  CourseCurriculumResponse,
  CurriculumSectionResponse,
  LessonResponse,
  LearningItemProgressResponse,
} from "@/types";
import type {
  LearningLesson,
  LearningLessonContent,
  LearningLessonType,
  LearningPageData,
  LearningSection,
} from "@/types/learning-page";
import { getCourseImage, getCourseInstructorName } from "@/lib/format";

function orderByIndex<T extends { orderIndex?: number }>(items?: T[]) {
  return [...(items || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

function normalizeType(type?: LessonResponse["lessonType"]): LearningLessonType {
  return type || "VIDEO";
}

function flattenLessons(curriculum?: CourseCurriculumResponse) {
  return orderByIndex(curriculum?.sections).flatMap((section) => orderByIndex(section.lessons));
}

function pickCurrentLesson(curriculum?: CourseCurriculumResponse, lessonId?: string) {
  const lessons = flattenLessons(curriculum);
  if (!lessons.length) return undefined;
  return lessonId ? lessons.find((lesson) => lesson.id === lessonId) || lessons[0] : lessons[0];
}

function mapSections(
  curriculum: CourseCurriculumResponse | undefined,
  currentLessonId: string,
  progressMap: Map<string, LearningItemProgressResponse>
): LearningSection[] {
  return orderByIndex<CurriculumSectionResponse>(curriculum?.sections).map((section, index) => {
    const lessons = orderByIndex(section.lessons)
      .filter((lesson): lesson is LessonResponse & { id: string } => Boolean(lesson.id))
      .map<LearningLesson>((lesson) => {
        const itemProgress = progressMap.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title || "Untitled lesson",
          duration: lesson.duration,
          type: normalizeType(lesson.lessonType),
          isCompleted: Boolean(itemProgress?.isCompleted),
          isCurrent: lesson.id === currentLessonId,
          isPassed: itemProgress?.isPassed,
          score: itemProgress?.score,
        };
      });

    return {
      id: section.id || `section-${index}`,
      title: section.title || `Section ${index + 1}`,
      description: section.description,
      duration: section.duration,
      completedCount: lessons.filter((lesson) => lesson.isCompleted).length,
      lessons,
    };
  });
}

async function getLessonContent(
  courseId: string,
  lesson: LessonResponse & { id: string }
): Promise<LearningLessonContent> {
  const type = normalizeType(lesson.lessonType);

  try {
    if (type === "ARTICLE") {
      const article = await ArticleLessonApi.getArticleByLessonId(courseId, lesson.id);
      return { type, article: article.data };
    }

    if (type === "QUIZ") {
      const quiz = await QuizLessonApi.getQuizByLessonId(courseId, lesson.id);
      return { type, quiz: quiz.data };
    }

    if (type === "ASSIGNMENT") {
      const assignment = await AssignmentLessonApi.getAssigmentByLessonId(courseId, lesson.id);
      let submission: unknown;
      try {
        const submissionPayload = await AssignmentApi.getAssignmentSubmission({ assignmentId: lesson.id });
        submission = submissionPayload.data;
      } catch {
        submission = undefined;
      }
      return { type, assignment: assignment.data, submission };
    }

    const [video, history] = await Promise.allSettled([
      VideoLessonApi.getVideoByLessonId(courseId, lesson.id),
      VideoTrackingApi.getVideoLessonTrackingHistory(courseId, lesson.id),
    ]);

    return {
      type,
      video: video.status === "fulfilled" ? video.value.data : undefined,
      resumePosition:
        history.status === "fulfilled" ? history.value.data?.currentPosition : undefined,
    };
  } catch {
    if (type === "ARTICLE") return { type };
    if (type === "QUIZ") return { type };
    if (type === "ASSIGNMENT") return { type };
    return { type: "VIDEO" };
  }
}

export const getLearningPageData = cache(async (courseId: string, lessonId?: string): Promise<LearningPageData> => {
  const [coursePayload, curriculumPayload, progressPayload, itemProgressPayload] = await Promise.all([
    CourseApi.getReadableCourseById(courseId),
    CourseApi.getReadableCurriculum(courseId),
    LearningProgressApi.getMyCourseProgress(courseId),
    LearningProgressApi.getLearningItemProgressByCourseId(courseId),
  ]);

  const course = coursePayload.data;
  const curriculum = curriculumPayload.data;
  const currentLessonPayload = pickCurrentLesson(curriculum, lessonId);

  if (!course || !currentLessonPayload?.id) {
    throw new Error("Course has no playable lessons");
  }

  const lessons = flattenLessons(curriculum).filter((lesson): lesson is LessonResponse & { id: string } => Boolean(lesson.id));
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLessonPayload.id);
  const completedIds = new Set(
    (itemProgressPayload.data || [])
      .filter((item) => item.itemId && item.isCompleted)
      .map((item) => item.itemId as string)
  );

  const totalItems = progressPayload.data?.totalItems || lessons.length;
  const completedItems = progressPayload.data?.completedItems || completedIds.size;
  const progressPercent = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const content = await getLessonContent(courseId, currentLessonPayload as LessonResponse & { id: string });
  const certificatePayload = course.hasCertificate
    ? await CertificateApi.getMyCertificate(courseId).catch(() => undefined)
    : undefined;

  const progressMap = new Map<string, LearningItemProgressResponse>(
    (itemProgressPayload.data || []).map((item) => [item.itemId || "", item])
  );

  const currentItemProgress = progressMap.get(currentLessonPayload.id);

  return {
    courseId,
    courseTitle: course.title || "Untitled course",
    courseDescription: course.description,
    coverUrl: getCourseImage(course),
    instructorName: getCourseInstructorName(course),
    hasCertificate: Boolean(course.hasCertificate),
    certificateTitle: course.certificateTitle,
    certificate: certificatePayload?.data,
    isCourseCompleted: Boolean(progressPayload.data?.isCompleted),
    isCoursePassed: Boolean(progressPayload.data?.isPassed),
    progressPercent,
    completedItems,
    totalItems,
    currentLesson: {
      id: currentLessonPayload.id,
      title: currentLessonPayload.title || "Untitled lesson",
      duration: currentLessonPayload.duration,
      type: normalizeType(currentLessonPayload.lessonType),
      isCompleted: completedIds.has(currentLessonPayload.id),
      isCurrent: true,
      isPassed: currentItemProgress?.isPassed,
      score: currentItemProgress?.score,
    },
    previousLessonId: currentIndex > 0 ? lessons[currentIndex - 1]?.id : undefined,
    nextLessonId: currentIndex >= 0 ? lessons[currentIndex + 1]?.id : undefined,
    sections: mapSections(curriculum, currentLessonPayload.id, progressMap),
    content,
  };
});
