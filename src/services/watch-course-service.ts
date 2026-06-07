import type {
  CourseCurriculumResponse,
  CourseResponse,
  LessonResponse,
  VideoLessonResponse,
} from "@/api/generated/course";
import type { CourseProgressResponse, LearningItemProgressResponse } from "@/api/generated/learning";
import { getWatchCourseData, type WatchCourseData, type WatchLecture, type WatchSection } from "@/data/watch-course";
import { API_BASE_URL } from "@/lib/api-base";

type CoursePayload = {
  data?: CourseResponse;
};

type CurriculumPayload = {
  data?: CourseCurriculumResponse;
};

type VideoPayload = {
  data?: VideoLessonResponse;
};

type ProgressPayload = {
  data?: CourseProgressResponse;
};

type ItemProgressPayload = {
  data?: LearningItemProgressResponse[];
};

export type WatchCourseResult = {
  course: WatchCourseData;
  isFallback: boolean;
};

function apiUrl(path: string) {
  return new URL(path, API_BASE_URL);
}

async function fetchJson<T>(url: URL): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return undefined;
    if (!(response.headers.get("content-type") || "").includes("application/json")) return undefined;

    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function formatDuration(minutes?: number) {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function splitDescription(description?: string) {
  const fallback = getWatchCourseData("fallback").description;
  const text = description?.trim();

  if (!text) return fallback;

  return text
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function countLessons(curriculum?: CourseCurriculumResponse) {
  return (curriculum?.sections || []).reduce((total, section) => total + (section.lessons?.length || 0), 0);
}

function flattenLessons(curriculum?: CourseCurriculumResponse) {
  return (curriculum?.sections || [])
    .flatMap((section) => section.lessons || [])
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

function pickCurrentLesson(curriculum?: CourseCurriculumResponse) {
  const lessons = flattenLessons(curriculum);
  return lessons.find((lesson) => lesson.lessonType === "VIDEO") || lessons[0];
}

function lessonStatus(lesson: LessonResponse, currentLessonId?: string, progress?: LearningItemProgressResponse[]): WatchLecture["status"] {
  if (lesson.id === currentLessonId) return "current";
  if (progress?.some((item) => item.itemId === lesson.id && item.isCompleted)) return "done";
  return "next";
}

function mapSections(curriculum: CourseCurriculumResponse | undefined, currentLessonId: string | undefined, progress?: LearningItemProgressResponse[]): WatchSection[] {
  const sections = [...(curriculum?.sections || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return sections.map((section, index) => {
    const lessons = [...(section.lessons || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const completed = lessons.filter((lesson) => progress?.some((item) => item.itemId === lesson.id && item.isCompleted)).length;
    const duration = section.duration || lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);

    return {
      title: section.title || `Section ${index + 1}`,
      lectures: `${lessons.length} ${lessons.length === 1 ? "lecture" : "lectures"}`,
      duration: formatDuration(duration),
      progress: lessons.length ? `${Math.round((completed / lessons.length) * 100)}% finish (${completed}/${lessons.length})` : undefined,
      expanded: lessons.some((lesson) => lesson.id === currentLessonId) || index === 0,
      lessons: lessons.map((lesson, lessonIndex) => ({
        id: lesson.id,
        title: `${lessonIndex + 1}. ${lesson.title || "Untitled lesson"}`,
        duration: formatDuration(lesson.duration),
        status: lessonStatus(lesson, currentLessonId, progress),
        type: lesson.lessonType,
      })),
    };
  });
}

function mapSubtitles(video?: VideoLessonResponse): WatchCourseData["subtitles"] {
  return video?.subtitles
    ?.filter((track) => track.fileUrl && track.status === "READY")
    .map((track) => ({
      label: track.displayName || track.languageCode || "Subtitle",
      src: track.fileUrl || "",
      srcLang: track.languageCode || "en",
      default: track.isDefault,
    }));
}

function fallbackWatchCourse(courseId: string): WatchCourseResult {
  return {
    course: getWatchCourseData(courseId),
    isFallback: true,
  };
}

export async function getWatchCourse(courseId: string): Promise<WatchCourseResult> {
  const [coursePayload, curriculumPayload, progressPayload, itemProgressPayload] = await Promise.all([
    fetchJson<CoursePayload>(apiUrl(`/api/v1/courses/${courseId}`)),
    fetchJson<CurriculumPayload>(apiUrl(`/api/v1/courses/${courseId}/curriculum`)),
    fetchJson<ProgressPayload>(apiUrl(`/api/v1/learning/course-progress/${courseId}`)),
    fetchJson<ItemProgressPayload>(apiUrl(`/api/v1/learning/course-progress/${courseId}/items`)),
  ]);

  if (!coursePayload?.data) return fallbackWatchCourse(courseId);

  const curriculum = curriculumPayload?.data;
  const currentLesson = pickCurrentLesson(curriculum);
  const videoPayload = currentLesson?.id
    ? await fetchJson<VideoPayload>(apiUrl(`/api/v1/courses/${courseId}/lessons/${currentLesson.id}/videos`))
    : undefined;
  const totalLessons = countLessons(curriculum);
  const progress = progressPayload?.data;
  const progressPercent = progress?.totalItems ? Math.round(((progress.completedItems || 0) / progress.totalItems) * 100) : 0;
  const sections = mapSections(curriculum, currentLesson?.id, itemProgressPayload?.data);

  return {
    course: {
      ...getWatchCourseData(courseId),
      courseId,
      lessonId: currentLesson?.id,
      courseTitle: coursePayload.data.title || "Untitled course",
      currentLesson: currentLesson?.title || "Start learning",
      lastUpdated: coursePayload.data.updatedAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(coursePayload.data.updatedAt)) : "Recently",
      commentsCount: "0",
      poster: coursePayload.data.images?.[0]?.imageUrl || "/watch-course/video-poster.png",
      videoUrl: videoPayload?.data?.videoUrl,
      subtitles: mapSubtitles(videoPayload?.data),
      stats: [
        { label: "Sections", value: String(curriculum?.sections?.length || 0) },
        { label: "Lectures", value: String(totalLessons) },
        { label: "Duration", value: formatDuration(coursePayload.data.duration) },
      ],
      description: splitDescription(coursePayload.data.description),
      notes: [
        "Take notes while watching and revisit them before moving to the next lesson.",
        "Pause the video after each key concept and practice the workflow in your own project.",
      ],
      attachment: {
        name: videoPayload?.data?.fileName || "Course resources",
        size: formatFileSize(videoPayload?.data?.fileSize),
      },
      progress: `${progressPercent}% Completed`,
      progressPercent,
      sections: sections.length ? sections : getWatchCourseData(courseId).sections,
    },
    isFallback: false,
  };
}
