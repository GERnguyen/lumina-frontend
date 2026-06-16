import type {
  CourseResponse,
  InstructorCourseStatisticsOverviewResponse,
  InstructorStatisticsResponse,
  PaginatedMetadata,
  UserDto,
} from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

type ApiPayload<T> = {
  data?: T;
  meta?: PaginatedMetadata;
};

export type InstructorDashboardData = {
  user: {
    name: string;
    email?: string;
    avatar: string;
    role: UserDto["role"];
    isVerified?: boolean;
  };
  stats: Array<{
    label: string;
    value: string;
    tone: "purple" | "orange" | "green" | "red" | "blue" | "gray";
    icon: "play" | "check" | "users" | "trophy" | "student" | "notepad" | "card" | "stack";
  }>;
  profile: {
    completedSteps: number;
    totalSteps: number;
    percent: number;
  };
  activities: Array<{
    id: string;
    type: "comment" | "rating" | "purchase" | "course";
    title: string;
    time: string;
  }>;
  revenueSeries: Array<{ label: string; value: number }>;
  courseSeries: Array<{ label: string; created: number; enrollments: number }>;
  rating: {
    average: number;
    breakdown: Array<{ stars: number; percent: number }>;
  };
  profileViews: {
    value: string;
    bars: number[];
  };
  topCourses: Array<{
    id: string;
    title: string;
    status?: string;
    enrollments: number;
    revenue: number;
  }>;
};

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

function compact(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function money(value?: number) {
  if (!value) return "0 VND";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
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

function latestLabels(length = 7) {
  return Array.from({ length }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (length - 1 - index));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });
}

function normalizeRevenueSeries(stats?: InstructorStatisticsResponse) {
  const source = stats?.revenueByTime?.slice(-7) || [];
  if (!source.length) {
    return latestLabels().map((label) => ({ label, value: 0 }));
  }

  return source.map((item) => ({
    label: item.timeLabel
      ? new Date(item.timeLabel).toLocaleDateString("en-US", { weekday: "short" })
      : "Day",
    value: item.netRevenue || item.grossRevenue || 0,
  }));
}

function normalizeCourseSeries(
  courseStats?: InstructorCourseStatisticsOverviewResponse,
  enrollmentStats?: InstructorStatisticsResponse,
) {
  const created = courseStats?.createdCoursesByTime?.slice(-7) || [];
  const enrollments = enrollmentStats?.enrollmentsByTime?.slice(-7) || [];
  const labels = created.length
    ? created.map((item) => item.label || "Day")
    : enrollments.length
      ? enrollments.map((item) => item.label || "Day")
      : latestLabels();

  return labels.map((label, index) => ({
    label: label.includes("-")
      ? new Date(label).toLocaleDateString("en-US", { weekday: "short" })
      : label,
    created: created[index]?.value || 0,
    enrollments: enrollments[index]?.enrollmentCount || 0,
  }));
}

function ratingBreakdown(average?: number) {
  if (!average) {
    return [
      { stars: 5, percent: 0 },
      { stars: 4, percent: 0 },
      { stars: 3, percent: 0 },
      { stars: 2, percent: 0 },
      { stars: 1, percent: 0 },
    ];
  }

  const rounded = Math.max(1, Math.min(5, Math.round(average)));
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percent: stars === rounded ? 68 : Math.max(0, 16 - Math.abs(stars - rounded) * 7),
  }));
}

function profileCompletion(user?: UserDto) {
  const checks = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.avatarUrl),
    Boolean(user?.bio),
  ];
  const completedSteps = checks.filter(Boolean).length;
  return {
    completedSteps,
    totalSteps: checks.length,
    percent: Math.round((completedSteps / checks.length) * 100),
  };
}

function mockActivities(courses: CourseResponse[]) {
  const first = courses[0]?.title || "your latest course";
  const second = courses[1]?.title || "a course draft";

  return [
    {
      id: "course-created",
      type: "course" as const,
      title: `You updated "${first}".`,
      time: "Today",
    },
    {
      id: "course-progress",
      type: "rating" as const,
      title: `Review your publishing progress for "${second}".`,
      time: "This week",
    },
    {
      id: "course-sales",
      type: "purchase" as const,
      title: "Course sales will appear here after learners purchase your courses.",
      time: "Live",
    },
    {
      id: "course-comments",
      type: "comment" as const,
      title: "Learner questions and comments will be listed here.",
      time: "Live",
    },
  ];
}

export async function getInstructorDashboardData(): Promise<InstructorDashboardData> {
  const [userPayload, instructorStatsPayload, courseStatsPayload, coursesPayload] = await Promise.all([
    fetchJson<ApiPayload<UserDto>>("/api/v1/users/me"),
    fetchJson<ApiPayload<InstructorStatisticsResponse>>("/api/v1/statistics/instructor/overview", { groupBy: "DAY" }),
    fetchJson<ApiPayload<InstructorCourseStatisticsOverviewResponse>>("/api/v1/courses/mine/statistics/overview", { groupBy: "DAY" }),
    fetchJson<ApiPayload<CourseResponse[]>>("/api/v1/courses/mine", {
      page: 1,
      size: 6,
      sort: '{"createdAt":"DESC"}',
    }),
  ]);

  const user = userPayload?.data;
  const instructorStats = instructorStatsPayload?.data;
  const courseStats = courseStatsPayload?.data;
  const courses = coursesPayload?.data || [];
  const publishedCount = courseStats?.currentPublishedCourseCount || courses.filter((course) => course.status === "PUBLISHED").length;
  const totalCourses = courseStats?.currentCourseCount || coursesPayload?.meta?.totalElements || courses.length;
  const enrollments = courseStats?.currentEnrollmentSnapshot || instructorStats?.enrollmentsInRange || 0;
  const totalRevenue = instructorStats?.totalNetRevenue || instructorStats?.totalGrossRevenue || 0;
  const avgRating = courseStats?.averageRating || 0;
  const sold = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

  return {
    user: {
      name: user?.name || "Lumina Instructor",
      email: user?.email,
      avatar: avatarFor(user),
      role: user?.role,
      isVerified: user?.isInstructorVerified,
    },
    stats: [
      { label: "Enrolled Courses", value: compact(enrollments), tone: "orange", icon: "play" },
      { label: "Active Courses", value: compact(publishedCount), tone: "purple", icon: "check" },
      { label: "Course Instructors", value: "1", tone: "orange", icon: "users" },
      { label: "Completed Courses", value: compact(Math.max(0, publishedCount - 1)), tone: "green", icon: "trophy" },
      { label: "Students", value: compact(instructorStats?.distinctLearnersInRange || sold), tone: "red", icon: "student" },
      { label: "Online Courses", value: compact(totalCourses), tone: "green", icon: "notepad" },
      { label: "Total Earning", value: money(totalRevenue), tone: "gray", icon: "card" },
      { label: "Course Sold", value: compact(sold), tone: "purple", icon: "stack" },
    ],
    profile: profileCompletion(user),
    activities: mockActivities(courses),
    revenueSeries: normalizeRevenueSeries(instructorStats),
    courseSeries: normalizeCourseSeries(courseStats, instructorStats),
    rating: {
      average: avgRating,
      breakdown: ratingBreakdown(avgRating),
    },
    profileViews: {
      value: money(totalRevenue),
      bars: [42, 76, 95, 30, 82, 24, 45, 20, 38, 58],
    },
    topCourses: courses.slice(0, 5).map((course) => ({
      id: course.id || course.title || "course",
      title: course.title || "Untitled Course",
      status: course.status,
      enrollments: course.enrollmentCount || 0,
      revenue: (course.discountedPrice ?? course.price ?? 0) * (course.enrollmentCount || 0),
    })),
  };
}
