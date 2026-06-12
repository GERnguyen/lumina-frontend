import type { Metadata } from "next";
import { WatchCoursePage } from "@/components/watch-course/WatchCoursePage";
import type {
  CourseCurriculumResponse,
  LessonResponse,
  VideoLessonResponse,
  LearningItemProgressResponse,
} from "@/types";
import { CourseService, VideoLessonService } from "@/services/courseService";
import { LearningProgressService } from "@/services/learningService";
import type { WatchCourseData, WatchLecture, WatchSection } from "@/data/watch-course";
import { formatDuration, splitDescription } from "@/lib/format";

type WatchCourseRouteProps = {
  params: Promise<{ courseId: string }>;
};

type WatchCourseResult = {
  course: WatchCourseData;
};

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

async function getWatchCourse(courseId: string): Promise<WatchCourseResult> {
  const [coursePayload, curriculumPayload, progressPayload, itemProgressPayload] = await Promise.all([
    CourseService.getCourseById({ id: courseId }),
    CourseService.getPublishedCurriculum({ id: courseId }),
    LearningProgressService.getMyCourseProgress({ courseId }),
    LearningProgressService.getLearningItemProgressByCourseId({ courseId }),
  ]);

  if (!coursePayload?.data) {
    throw new Error("Course not found");
  }

  const curriculum = curriculumPayload?.data;
  const currentLesson = pickCurrentLesson(curriculum);
  const videoPayload = currentLesson?.id
    ? await VideoLessonService.getVideoByLessonId({ courseId, lessonId: currentLesson.id })
    : undefined;
  const totalLessons = countLessons(curriculum);
  const progress = progressPayload?.data;
  const progressPercent = progress?.totalItems ? Math.round(((progress.completedItems || 0) / progress.totalItems) * 100) : 0;
  const sections = mapSections(curriculum, currentLesson?.id, itemProgressPayload?.data);

  const descParagraphs = splitDescription(coursePayload.data.description);
  const description = descParagraphs.length > 0 ? descParagraphs.slice(0, 3) : [
    "Build practical skills through guided lessons.",
  ];

  return {
    course: {
      courseId,
      lessonId: currentLesson?.id || "",
      courseTitle: coursePayload.data.title || "Untitled course",
      currentLesson: currentLesson?.title || "Start learning",
      lastUpdated: coursePayload.data.updatedAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(coursePayload.data.updatedAt)) : "Recently",
      commentsCount: "0",
      poster: coursePayload.data.images?.[0]?.imageUrl || "/watch-course/video-poster.png",
      videoUrl: videoPayload?.data?.videoUrl,
      subtitles: mapSubtitles(videoPayload?.data) || [],
      stats: [
        { label: "Sections", value: String(curriculum?.sections?.length || 0) },
        { label: "Lectures", value: String(totalLessons) },
        { label: "Duration", value: formatDuration(coursePayload.data.duration) },
      ],
      tabs: [
        { label: "Description" },
        { label: "Lectures Notes" },
        { label: "Attach File" },
        { label: "Comments" },
      ],
      description,
      notes: [
        "Take notes while watching and revisit them before moving to the next lesson.",
        "Pause the video after each key concept and practice the workflow in your own project.",
      ],
      attachment: videoPayload?.data?.fileName ? {
        name: videoPayload.data.fileName,
        size: formatFileSize(videoPayload.data.fileSize),
      } : undefined,
      progress: `${progressPercent}% Completed`,
      progressPercent,
      sections,
      comments: [],
    },
  };
}

export async function generateMetadata({ params }: WatchCourseRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  try {
    const { course } = await getWatchCourse(courseId);
    return {
      title: `${course.currentLesson} - Watch Course`,
      description: `Watch ${course.currentLesson} from ${course.courseTitle}.`,
      alternates: {
        canonical: `/courses/${courseId}/watch`,
      },
    };
  } catch {
    return {
      title: "Watch Course",
      description: "Learn on Lumina.",
    };
  }
}

export default async function Page({ params }: WatchCourseRouteProps) {
  const { courseId } = await params;
  const { course } = await getWatchCourse(courseId);

  return <WatchCoursePage course={course} />;
}
