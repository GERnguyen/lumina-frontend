import "server-only";

import type {
  CourseCurriculumResponse,
  CourseQnAStatisticsResponse,
  CourseResponse,
  CourseStatisticsResponse,
  ReviewStatisticsResponse,
  UserDto,
} from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

type ApiPayload<T> = {
  data?: T;
};

export type InstructorCourseDetailData = {
  user: {
    name: string;
    email?: string;
    avatar: string;
    role: UserDto["role"];
  };
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    price: number;
    originalPrice?: number;
    revenue: number;
    rating: number;
    reviewCount: number;
    students: number;
    duration: number;
    createdAt?: string;
    updatedAt?: string;
    instructorName: string;
    status?: CourseResponse["status"];
    publishStatus?: CourseResponse["publishStatus"];
  };
  facts: Array<{
    label: string;
    value: string;
    helper?: string;
    icon: "play" | "users" | "notepad" | "level" | "language" | "file" | "clock" | "views";
    tone: "purple" | "green" | "gray";
  }>;
  ratingBreakdown: Array<{ stars: number; percent: number; count: number }>;
  revenueSeries: Array<{ label: string; value: number }>;
  overviewSeries: {
    comments: Array<{ label: string; value: number }>;
    views: Array<{ label: string; value: number }>;
  };
};

const fallbackImages = [
  "/courses/course-01.png",
  "/courses/course-02.png",
  "/courses/course-03.png",
  "/courses/course-04.png",
];

function apiUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function fetchJson<T>(path: string, params?: Record<string, string | number | undefined>) {
  try {
    const response = await fetch(apiUrl(path, params), {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function avatarFor(user?: UserDto) {
  const avatar = user?.avatarUrl?.trim();
  if (avatar) {
    if (/^(https?:|data:|blob:)/.test(avatar) || avatar.startsWith("/")) return avatar;
    return new URL(avatar, API_BASE_URL).toString();
  }

  const params = new URLSearchParams({
    name: user?.name || "Lumina Instructor",
    background: "EBEBFF",
    color: "564FFD",
    bold: "true",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

function imageFor(course?: CourseResponse) {
  const image = course?.images?.[0]?.imageUrl?.trim();
  if (image) {
    if (/^(https?:|data:|blob:)/.test(image) || image.startsWith("/")) return image;
    return new URL(image, API_BASE_URL).toString();
  }
  const index = course?.id ? course.id.charCodeAt(0) % fallbackImages.length : 0;
  return fallbackImages[index];
}

function money(value?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function compact(value?: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatDuration(minutes?: number) {
  if (!minutes) return "Not set";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function lessonCount(curriculum?: CourseCurriculumResponse) {
  return (curriculum?.sections || []).reduce((sum, section) => sum + (section.lessons?.length || 0), 0);
}

function sectionCount(curriculum?: CourseCurriculumResponse) {
  return curriculum?.sections?.length || 0;
}

function normalizeRevenueSeries(stats?: CourseStatisticsResponse) {
  const source = stats?.revenueByTime?.slice(-8) || [];
  if (source.length) {
    return source.map((item) => ({
      label: item.timeLabel ? new Date(item.timeLabel).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "Day",
      value: item.netRevenue || item.grossRevenue || 0,
    }));
  }

  return Array.from({ length: 8 }, (_, index) => ({
    label: index === 0 ? "Start" : `Day ${index + 1}`,
    value: 0,
  }));
}

function normalizeQuestionsSeries(stats?: CourseQnAStatisticsResponse) {
  const source = stats?.questionsByTime?.slice(-7) || [];
  if (source.length) {
    return source.map((item) => ({
      label: item.label ? new Date(item.label).toLocaleDateString("en-US", { weekday: "short" }) : "Day",
      value: item.value || 0,
    }));
  }

  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => ({ label, value: 0 }));
}

function ratingBreakdown(stats?: ReviewStatisticsResponse, fallbackAverage = 0) {
  const distribution = stats?.ratingDistribution || {};
  const total = stats?.reviewCount || Object.values(distribution).reduce((sum, value) => sum + value, 0);

  if (!total) {
    const rounded = Math.max(0, Math.round(fallbackAverage));
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percent: rounded && stars === rounded ? 100 : 0,
      count: 0,
    }));
  }

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = distribution[String(stars)] || 0;
    return {
      stars,
      count,
      percent: Math.round((count / total) * 100),
    };
  });
}

export async function getInstructorCourseDetailData(courseId: string): Promise<InstructorCourseDetailData | undefined> {
  const [
    userPayload,
    draftPayload,
    publishedPayload,
    coursePayload,
    draftCurriculumPayload,
    publishedCurriculumPayload,
    curriculumPayload,
    courseStatsPayload,
    reviewStatsPayload,
    qnaStatsPayload,
  ] = await Promise.all([
    fetchJson<ApiPayload<UserDto>>("/api/v1/users/me"),
    fetchJson<ApiPayload<CourseResponse>>(`/api/v1/courses/${courseId}/draft`),
    fetchJson<ApiPayload<CourseResponse>>(`/api/v1/courses/${courseId}/published`),
    fetchJson<ApiPayload<CourseResponse>>(`/api/v1/courses/${courseId}`),
    fetchJson<ApiPayload<CourseCurriculumResponse>>(`/api/v1/courses/${courseId}/draft/curriculum`),
    fetchJson<ApiPayload<CourseCurriculumResponse>>(`/api/v1/courses/${courseId}/published/curriculum`),
    fetchJson<ApiPayload<CourseCurriculumResponse>>(`/api/v1/courses/${courseId}/curriculum`),
    fetchJson<ApiPayload<CourseStatisticsResponse>>(`/api/v1/statistics/instructor/courses/${courseId}/overview`, { groupBy: "DAY" }),
    fetchJson<ApiPayload<ReviewStatisticsResponse>>(`/api/v1/reviews/statistics/courses/${courseId}`),
    fetchJson<ApiPayload<CourseQnAStatisticsResponse>>(`/api/v1/course-qna/statistics/courses/${courseId}`, { groupBy: "DAY" }),
  ]);

  const user = userPayload?.data;
  const course = draftPayload?.data || publishedPayload?.data || coursePayload?.data;
  if (!course) return undefined;

  const curriculum = draftCurriculumPayload?.data || publishedCurriculumPayload?.data || curriculumPayload?.data;
  const courseStats = courseStatsPayload?.data;
  const reviewStats = reviewStatsPayload?.data;
  const qnaStats = qnaStatsPayload?.data;
  const lessons = lessonCount(curriculum);
  const sections = sectionCount(curriculum);
  const rating = reviewStats?.averageRating || course.rating || 0;
  const reviewCount = reviewStats?.reviewCount || 0;
  const questions = qnaStats?.questionsInRange || 0;
  const answers = qnaStats?.answersInRange || 0;
  const revenue = courseStats?.totalNetRevenue || courseStats?.totalGrossRevenue || 0;
  const discountedPrice = course.discountedPrice ?? course.price ?? 0;

  return {
    user: {
      name: user?.name || "Lumina Instructor",
      email: user?.email,
      avatar: avatarFor(user),
      role: user?.role,
    },
    course: {
      id: course.id || courseId,
      title: course.title || "Untitled Course",
      description: course.description || "No description provided yet.",
      category: course.category?.name || "Course",
      image: imageFor(course),
      price: discountedPrice,
      originalPrice: course.discountedPrice !== undefined && course.price !== undefined && course.discountedPrice < course.price ? course.price : undefined,
      revenue,
      rating,
      reviewCount,
      students: course.enrollmentCount || 0,
      duration: course.duration || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      instructorName: course.instructor?.name || user?.name || "Lumina Instructor",
      status: course.status,
      publishStatus: course.publishStatus,
    },
    facts: [
      { label: "Lectures", value: compact(lessons), helper: sections ? `${sections} sections` : "No curriculum yet", icon: "play", tone: "purple" },
      { label: "Total comments", value: compact(questions + answers), helper: `${compact(qnaStats?.unansweredQuestionCount)} unanswered`, icon: "notepad", tone: "purple" },
      { label: "Students enrolled", value: compact(course.enrollmentCount), icon: "users", tone: "purple" },
      { label: "Course level", value: "All levels", icon: "level", tone: "green" },
      { label: "Course language", value: "English", icon: "language", tone: "gray" },
      { label: "Attach files", value: "0", helper: "No file data", icon: "file", tone: "purple" },
      { label: "Hours", value: formatDuration(course.duration), icon: "clock", tone: "purple" },
      { label: "Students viewed", value: compact(course.enrollmentCount), helper: "Enrollment proxy", icon: "views", tone: "gray" },
    ],
    ratingBreakdown: ratingBreakdown(reviewStats, rating),
    revenueSeries: normalizeRevenueSeries(courseStats),
    overviewSeries: {
      comments: normalizeQuestionsSeries(qnaStats),
      views: normalizeQuestionsSeries(qnaStats).map((item, index) => ({
        label: item.label,
        value: Math.max(0, item.value - index),
      })),
    },
  };
}

export { money };
