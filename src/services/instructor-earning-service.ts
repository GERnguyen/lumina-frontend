import type {
  CourseResponse,
  InstructorCourseStatisticsOverviewResponse,
  InstructorStatisticsResponse,
  PaginatedMetadata,
  UserDto,
} from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";
import { getProfileAvatar } from "@/lib/format";

type ApiPayload<T> = {
  data?: T;
  meta?: PaginatedMetadata;
};

export type InstructorEarningFilters = {
  range?: "7d" | "30d" | "12m";
};

export type InstructorEarningData = {
  user: {
    name: string;
    email?: string;
    avatar: string;
    role: UserDto["role"];
  };
  activeRange: NonNullable<InstructorEarningFilters["range"]>;
  summary: Array<{
    label: string;
    value: string;
    helper: string;
    tone: "purple" | "green" | "orange" | "blue";
    icon: "revenue" | "gross" | "enrollments" | "learners";
  }>;
  todayNetRevenue: string;
  revenueSeries: Array<{ label: string; grossRevenue: number; netRevenue: number }>;
  enrollmentSeries: Array<{ label: string; enrollments: number }>;
  topRevenueCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
  }>;
  topEnrollmentCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
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

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeParams(range: NonNullable<InstructorEarningFilters["range"]>) {
  const end = new Date();
  const start = new Date(end);

  if (range === "12m") {
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    return {
      groupBy: "MONTH",
      startDate: isoDate(start),
      endDate: isoDate(end),
    };
  }

  start.setDate(start.getDate() - (range === "7d" ? 6 : 29));
  return {
    groupBy: "DAY",
    startDate: isoDate(start),
    endDate: isoDate(end),
  };
}

function rangeLabel(range: NonNullable<InstructorEarningFilters["range"]>) {
  if (range === "7d") return "Last 7 days";
  if (range === "12m") return "Last 12 months";
  return "Last 30 days";
}

function labelFromTime(value?: string, range: NonNullable<InstructorEarningFilters["range"]> = "30d") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (range === "12m") return date.toLocaleDateString("en-US", { month: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function normalizeRevenueSeries(stats?: InstructorStatisticsResponse, range: NonNullable<InstructorEarningFilters["range"]> = "30d") {
  return (stats?.revenueByTime || []).map((item) => ({
    label: labelFromTime(item.timeLabel, range),
    grossRevenue: item.grossRevenue || 0,
    netRevenue: item.netRevenue || 0,
  }));
}

function normalizeEnrollmentSeries(stats?: InstructorStatisticsResponse, range: NonNullable<InstructorEarningFilters["range"]> = "30d") {
  return (stats?.enrollmentsByTime || []).map((item) => ({
    label: labelFromTime(item.label, range),
    enrollments: item.enrollmentCount || 0,
  }));
}

function estimateCourseRevenue(course?: CourseResponse, enrollments = 0) {
  if (!course) return 0;
  const price = course.discountedPrice ?? course.price ?? 0;
  return price * enrollments;
}

function byCourseId(courses: CourseResponse[]) {
  return new Map(courses.map((course) => [course.id, course]));
}

export async function getInstructorEarningData(filters: InstructorEarningFilters = {}): Promise<InstructorEarningData | undefined> {
  const activeRange = filters.range || "30d";
  const today = isoDate(new Date());
  const params = rangeParams(activeRange);

  const [userPayload, statsPayload, todayStatsPayload, courseStatsPayload, coursesPayload] = await Promise.all([
    fetchJson<ApiPayload<UserDto>>("/api/v1/users/me"),
    fetchJson<ApiPayload<InstructorStatisticsResponse>>("/api/v1/statistics/instructor/overview", params),
    fetchJson<ApiPayload<InstructorStatisticsResponse>>("/api/v1/statistics/instructor/overview", {
      groupBy: "DAY",
      startDate: today,
      endDate: today,
    }),
    fetchJson<ApiPayload<InstructorCourseStatisticsOverviewResponse>>("/api/v1/courses/mine/statistics/overview", params),
    fetchJson<ApiPayload<CourseResponse[]>>("/api/v1/courses/mine", {
      page: 1,
      size: 50,
      sort: '{"enrollmentCount":"DESC"}',
    }),
  ]);

  const user = userPayload?.data;
  if (!user) return undefined;

  const stats = statsPayload?.data;
  const todayStats = todayStatsPayload?.data;
  const courseStats = courseStatsPayload?.data;
  const courses = coursesPayload?.data || [];
  const courseMap = byCourseId(courses);
  const topRevenueCourses = (stats?.topCoursesByRevenue || []).slice(0, 6).map((course) => {
    const fullCourse = courseMap.get(course.courseId);
    const enrollments = course.enrollmentCount || fullCourse?.enrollmentCount || 0;
    return {
      id: course.courseId || fullCourse?.id || course.title || "course",
      title: course.title || fullCourse?.title || "Untitled course",
      enrollments,
      revenue: estimateCourseRevenue(fullCourse, enrollments),
    };
  });

  const topEnrollmentCourses = (stats?.topCoursesByEnrollment || []).slice(0, 6).map((course) => ({
    id: course.courseId || course.title || "course",
    title: course.title || "Untitled course",
    enrollments: course.enrollmentCount || 0,
  }));

  const netRevenue = stats?.totalNetRevenue || 0;
  const grossRevenue = stats?.totalGrossRevenue || 0;
  const paidEnrollments = stats?.enrollmentsInRange || courseStats?.currentEnrollmentSnapshot || 0;
  const learners = stats?.distinctLearnersInRange || 0;

  return {
    user: {
      name: user.name || "Lumina Instructor",
      email: user.email,
      avatar: getProfileAvatar(user, "Lumina Instructor"),
      role: user.role,
    },
    activeRange,
    summary: [
      {
        label: "Net Revenue",
        value: money(netRevenue),
        helper: `${rangeLabel(activeRange)} after platform fee`,
        tone: "purple",
        icon: "revenue",
      },
      {
        label: "Gross Revenue",
        value: money(grossRevenue),
        helper: `${rangeLabel(activeRange)} before deductions`,
        tone: "green",
        icon: "gross",
      },
      {
        label: "Paid Enrollments",
        value: compact(paidEnrollments),
        helper: "Orders converted to course access",
        tone: "orange",
        icon: "enrollments",
      },
      {
        label: "Learners",
        value: compact(learners),
        helper: "Distinct learners in range",
        tone: "blue",
        icon: "learners",
      },
    ],
    todayNetRevenue: money(todayStats?.totalNetRevenue || 0),
    revenueSeries: normalizeRevenueSeries(stats, activeRange),
    enrollmentSeries: normalizeEnrollmentSeries(stats, activeRange),
    topRevenueCourses,
    topEnrollmentCourses,
  };
}
