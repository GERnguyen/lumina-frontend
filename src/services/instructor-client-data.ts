"use client";

import { CourseService, CourseStatisticsService } from "@/services/courseService";
import { StatisticsService } from "@/services/enrollmentService";
import { UserService } from "@/services/userService";
import { getProfileAvatar } from "@/lib/format";
import type {
  CourseResponse,
  InstructorCourseStatisticsOverviewResponse,
  InstructorStatisticsResponse,
  UserDto,
} from "@/types";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";
import type { InstructorEarningData } from "@/services/instructor-earning-service";

export type InstructorRange = "7d" | "30d" | "12m";

function compact(value?: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function money(value?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function latestLabels(length = 7) {
  return Array.from({ length }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (length - 1 - index));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });
}

function rangeParams(range: InstructorRange) {
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

function rangeLabel(range: InstructorRange) {
  if (range === "7d") return "Last 7 days";
  if (range === "12m") return "Last 12 months";
  return "Last 30 days";
}

function labelFromTime(value?: string, range: InstructorRange = "30d") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (range === "12m") return date.toLocaleDateString("en-US", { month: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function normalizeRevenueSeries(stats?: InstructorStatisticsResponse): InstructorDashboardData["revenueSeries"] {
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
): InstructorDashboardData["courseSeries"] {
  const created = courseStats?.createdCoursesByTime?.slice(-7) || [];
  const enrollments = enrollmentStats?.enrollmentsByTime?.slice(-7) || [];
  const labels = created.length
    ? created.map((item) => item.label || "Day")
    : enrollments.length
      ? enrollments.map((item) => item.label || "Day")
      : latestLabels();

  return labels.map((label, index) => ({
    label: label.includes("-") ? new Date(label).toLocaleDateString("en-US", { weekday: "short" }) : label,
    created: created[index]?.value || 0,
    enrollments: enrollments[index]?.enrollmentCount || 0,
  }));
}

function profileCompletion(user?: UserDto) {
  const checks = [Boolean(user?.name), Boolean(user?.email), Boolean(user?.avatarUrl), Boolean(user?.bio)];
  const completedSteps = checks.filter(Boolean).length;
  return {
    completedSteps,
    totalSteps: checks.length,
    percent: Math.round((completedSteps / checks.length) * 100),
  };
}

function courseMap(courses: CourseResponse[]) {
  return new Map(courses.map((course) => [course.id, course]));
}

function estimateCourseRevenue(course?: CourseResponse, enrollments = 0) {
  const price = course?.discountedPrice ?? course?.price ?? 0;
  return price * enrollments;
}

export async function getInstructorDashboardClientData(): Promise<InstructorDashboardData> {
  const [userRes, instructorStatsRes, courseStatsRes, coursesRes] = await Promise.all([
    UserService.getCurrentUser(),
    StatisticsService.getInstructorOverview({ groupBy: "DAY" }),
    CourseStatisticsService.getInstructorOverview({ groupBy: "DAY" }),
    CourseService.getMyCourses({
      page: 1,
      size: 6,
      sort: '{"createdAt":"DESC"}',
    }),
  ]);

  const user = userRes.data;
  const instructorStats = instructorStatsRes.data;
  const courseStats = courseStatsRes.data;
  const courses = coursesRes.data || [];
  const publishedCount = courseStats?.currentPublishedCourseCount || courses.filter((course) => course.status === "PUBLISHED").length;
  const totalCourses = courseStats?.currentCourseCount || coursesRes.meta?.totalElements || courses.length;
  const enrollments = courseStats?.currentEnrollmentSnapshot || instructorStats?.enrollmentsInRange || 0;
  const totalRevenue = instructorStats?.totalNetRevenue || instructorStats?.totalGrossRevenue || 0;
  const sold = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

  return {
    user: {
      name: user?.name || "Lumina Instructor",
      email: user?.email,
      avatar: getProfileAvatar(user, "Lumina Instructor"),
      role: user?.role,
      isVerified: user?.isInstructorVerified,
    },
    stats: [
      { label: "Active Courses", value: compact(publishedCount), tone: "purple", icon: "check" },
      { label: "Total Courses", value: compact(totalCourses), tone: "green", icon: "notepad" },
      { label: "Students", value: compact(instructorStats?.distinctLearnersInRange || sold), tone: "red", icon: "student" },
      { label: "Total Earning", value: money(totalRevenue), tone: "gray", icon: "card" },
    ],
    profile: profileCompletion(user),
    revenueSeries: normalizeRevenueSeries(instructorStats),
    courseSeries: normalizeCourseSeries(courseStats, instructorStats),
    topCourses: courses.slice(0, 5).map((course) => ({
      id: course.id || course.title || "course",
      title: course.title || "Untitled Course",
      status: course.status,
      enrollments: course.enrollmentCount || 0,
      revenue: (course.discountedPrice ?? course.price ?? 0) * (course.enrollmentCount || 0),
    })),
  };
}

export async function getInstructorEarningClientData(range: InstructorRange): Promise<InstructorEarningData> {
  const today = isoDate(new Date());
  const params = rangeParams(range);

  const [userRes, statsRes, todayStatsRes, courseStatsRes, coursesRes] = await Promise.all([
    UserService.getCurrentUser(),
    StatisticsService.getInstructorOverview(params),
    StatisticsService.getInstructorOverview({ groupBy: "DAY", startDate: today, endDate: today }),
    CourseStatisticsService.getInstructorOverview(params),
    CourseService.getMyCourses({
      page: 1,
      size: 50,
      sort: '{"enrollmentCount":"DESC"}',
    }),
  ]);

  const user = userRes.data;
  const stats = statsRes.data;
  const todayStats = todayStatsRes.data;
  const courseStats = courseStatsRes.data;
  const courses = coursesRes.data || [];
  const coursesById = courseMap(courses);
  const netRevenue = stats?.totalNetRevenue || 0;
  const grossRevenue = stats?.totalGrossRevenue || 0;
  const paidEnrollments = stats?.enrollmentsInRange || courseStats?.currentEnrollmentSnapshot || 0;
  const learners = stats?.distinctLearnersInRange || 0;

  return {
    user: {
      name: user?.name || "Lumina Instructor",
      email: user?.email,
      avatar: getProfileAvatar(user, "Lumina Instructor"),
      role: user?.role,
    },
    activeRange: range,
    summary: [
      { label: "Net Revenue", value: money(netRevenue), helper: `${rangeLabel(range)} after platform fee`, tone: "purple", icon: "revenue" },
      { label: "Gross Revenue", value: money(grossRevenue), helper: `${rangeLabel(range)} before deductions`, tone: "green", icon: "gross" },
      { label: "Paid Enrollments", value: compact(paidEnrollments), helper: "Orders converted to course access", tone: "orange", icon: "enrollments" },
      { label: "Learners", value: compact(learners), helper: "Distinct learners in range", tone: "blue", icon: "learners" },
    ],
    todayNetRevenue: money(todayStats?.totalNetRevenue || 0),
    revenueSeries: (stats?.revenueByTime || []).map((item) => ({
      label: labelFromTime(item.timeLabel, range),
      grossRevenue: item.grossRevenue || 0,
      netRevenue: item.netRevenue || 0,
    })),
    enrollmentSeries: (stats?.enrollmentsByTime || []).map((item) => ({
      label: labelFromTime(item.label, range),
      enrollments: item.enrollmentCount || 0,
    })),
    topRevenueCourses: (stats?.topCoursesByRevenue || []).slice(0, 6).map((course) => {
      const fullCourse = coursesById.get(course.courseId);
      const enrollments = course.enrollmentCount || fullCourse?.enrollmentCount || 0;
      return {
        id: course.courseId || fullCourse?.id || course.title || "course",
        title: course.title || fullCourse?.title || "Untitled course",
        enrollments,
        revenue: estimateCourseRevenue(fullCourse, enrollments),
      };
    }),
    topEnrollmentCourses: (stats?.topCoursesByEnrollment || []).slice(0, 6).map((course) => ({
      id: course.courseId || course.title || "course",
      title: course.title || "Untitled course",
      enrollments: course.enrollmentCount || 0,
    })),
  };
}
