import type { CourseResponse as CatalogCourseResponse } from "@/api/generated/course";
import type { CourseResponse as EnrolledCourseResponse } from "@/api/generated/enrollment";
import type { CourseProgressResponse, DailyGoalResponse, UserStreakResponse } from "@/api/generated/learning";
import type { UserNotificationResponse } from "@/api/generated/notification";
import type { UserDto } from "@/api/generated/user";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

type ApiPayload<T> = {
  data?: T;
  meta?: {
    totalElements?: number;
  };
};

export type HomeCourse = {
  id: string;
  title: string;
  category: string;
  image: string;
  instructor: string;
  progress: number;
  completedItems: number;
  totalItems: number;
  href: string;
};

export type HomeRecommendation = {
  id: string;
  title: string;
  category: string;
  image: string;
  price: string;
  href: string;
};

export type HomeGoal = {
  id?: string;
  type: DailyGoalResponse["goalType"];
  label: string;
  targetValue: number;
  currentValue: number;
  goalDate?: string;
  isCompleted: boolean;
};

export type HomeNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
};

export type StudentHomeData = {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    xp: number;
  };
  stats: {
    activeCourses: number;
    completedCourses: number;
    currentStreak: number;
    unreadNotifications: number;
  };
  continueCourses: HomeCourse[];
  recommendations: HomeRecommendation[];
  goals: HomeGoal[];
  monthGoals: HomeGoal[];
  notifications: HomeNotification[];
};

async function fetchJson<T>(path: string, options?: { auth?: boolean; query?: URLSearchParams }) {
  const url = new URL(path, API_BASE_URL);
  if (options?.query) {
    options.query.forEach((value, key) => url.searchParams.append(key, value));
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: options?.auth ? await authHeaders({ Accept: "application/json" }) : { Accept: "application/json" },
    });

    if (!response.ok) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function monthParams(date = new Date()) {
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1),
  };
}

function money(value?: number) {
  if (!value) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function goalLabel(type?: DailyGoalResponse["goalType"]) {
  const labels: Record<NonNullable<DailyGoalResponse["goalType"]>, string> = {
    XP: "Earn XP",
    LEARNING_ITEMS_COMPLETED: "Complete learning items",
    VIDEOS_COMPLETED: "Finish videos",
    QUIZZES_PASSED: "Pass quizzes",
    ASSIGNMENTS_SUBMITTED: "Submit assignments",
    SPECIFIC_LESSON_COMPLETED: "Complete a specific lesson",
  };

  return type ? labels[type] : "Learning goal";
}

function mapGoal(goal: DailyGoalResponse): HomeGoal {
  return {
    id: goal.id,
    type: goal.goalType || "XP",
    label: goalLabel(goal.goalType),
    targetValue: goal.targetValue || 0,
    currentValue: goal.currentValue || 0,
    goalDate: goal.goalDate,
    isCompleted: Boolean(goal.isCompleted),
  };
}

function mapCourse(course: EnrolledCourseResponse, progress?: CourseProgressResponse, index = 0): HomeCourse {
  const totalItems = progress?.totalItems || 0;
  const completedItems = progress?.completedItems || 0;
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    id: course.id || `course-${index}`,
    title: course.title || "Untitled course",
    category: course.category?.name || "Course",
    image: course.images?.[0]?.imageUrl || `/courses/course-${String((index % 8) + 1).padStart(2, "0")}.png`,
    instructor: course.instructor?.name || "Lumina Instructor",
    progress: percent,
    completedItems,
    totalItems,
    href: course.id ? `/courses/${course.id}/watch` : "/courses",
  };
}

function mapRecommendation(course: CatalogCourseResponse, index: number): HomeRecommendation {
  return {
    id: course.id || `recommendation-${index}`,
    title: course.title || "Untitled course",
    category: course.category?.name || "Course",
    image: course.images?.[0]?.imageUrl || `/courses/course-${String((index % 8) + 1).padStart(2, "0")}.png`,
    price: money(course.discountedPrice ?? course.price),
    href: course.id ? `/courses/${course.id}` : "/courses",
  };
}

export async function getStudentHomeData(): Promise<StudentHomeData> {
  const today = dateKey();
  const month = monthParams();
  const monthQuery = new URLSearchParams(month);

  const [userPayload, enrolledPayload, goalsPayload, monthGoalsPayload, streakPayload, notificationsPayload, unreadPayload, catalogPayload] =
    await Promise.all([
      fetchJson<ApiPayload<UserDto>>("/api/v1/users/me", { auth: true }),
      fetchJson<ApiPayload<EnrolledCourseResponse[]>>("/api/v1/enrollments", {
        auth: true,
        query: new URLSearchParams({ page: "1", size: "6" }),
      }),
      fetchJson<ApiPayload<DailyGoalResponse[]>>("/api/v1/daily-goals", {
        auth: true,
        query: new URLSearchParams({ date: today }),
      }),
      fetchJson<ApiPayload<DailyGoalResponse[]>>("/api/v1/daily-goals/month", {
        auth: true,
        query: monthQuery,
      }),
      fetchJson<ApiPayload<UserStreakResponse>>("/api/v1/streaks/me", { auth: true }),
      fetchJson<ApiPayload<UserNotificationResponse[]>>("/api/v1/notifications", {
        auth: true,
        query: new URLSearchParams({ page: "1", size: "5", sort: '{"createdAt":"DESC"}' }),
      }),
      fetchJson<ApiPayload<number>>("/api/v1/notifications/unread-count", { auth: true }),
      fetchJson<ApiPayload<CatalogCourseResponse[]>>("/api/v1/courses", {
        query: new URLSearchParams({ page: "1", size: "6", sort: '{"rating":"DESC"}' }),
      }),
    ]);

  const enrolled = enrolledPayload?.data || [];
  const progressQuery = new URLSearchParams();
  enrolled.map((course) => course.id).filter(Boolean).forEach((id) => progressQuery.append("courseIds", id as string));
  const progressPayload = enrolled.length
    ? await fetchJson<ApiPayload<CourseProgressResponse[]>>("/api/v1/learning/course-progress", { auth: true, query: progressQuery })
    : undefined;
  const progressByCourse = new Map((progressPayload?.data || []).map((item) => [item.courseId, item]));
  const continueCourses = enrolled.map((course, index) => mapCourse(course, progressByCourse.get(course.id), index));
  const completedCourses = continueCourses.filter((course) => course.progress >= 100).length;

  return {
    user: {
      name: userPayload?.data?.name || "Lumina Learner",
      email: userPayload?.data?.email,
      avatar: userPayload?.data?.avatarUrl,
      xp: userPayload?.data?.xp || 0,
    },
    stats: {
      activeCourses: Math.max(0, continueCourses.length - completedCourses),
      completedCourses,
      currentStreak: streakPayload?.data?.currentStreak || 0,
      unreadNotifications: unreadPayload?.data || 0,
    },
    continueCourses,
    recommendations: (catalogPayload?.data || []).map(mapRecommendation),
    goals: (goalsPayload?.data || []).map(mapGoal),
    monthGoals: (monthGoalsPayload?.data || []).map(mapGoal),
    notifications: (notificationsPayload?.data || []).map((item, index) => ({
      id: item.id || `notification-${index}`,
      title: item.title || "Notification",
      message: item.message || "You have a new update on Lumina.",
      isRead: Boolean(item.isRead),
    })),
  };
}
