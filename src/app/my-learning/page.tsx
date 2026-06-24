import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { StudentHomePage } from "@/components/home/StudentHomePage";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { DailyGoalApi, StreakApi } from "@/services/api/learning-api";
import { NotificationApi } from "@/services/api/notification-api";
import { UserApi } from "@/services/api/user-api";

export const metadata: Metadata = {
  title: "My Learning - Lumina",
  description: "Continue your Lumina courses, goals, calendar, recommendations, and learning updates.",
  alternates: {
    canonical: "/my-learning",
  },
};

function throwOn401(error: any) {
  const status = error?.response?.status || error?.status;
  if (status === 401) {
    throw error;
  }
}

export default async function MyLearningPage() {
  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect("/login?returnUrl=%2Fmy-learning");
    }

    const currentUserRes = await UserApi.getCurrentUser().catch((err) => {
      throwOn401(err);
      return { data: undefined };
    });

    if (currentUserRes.data?.role === "INSTRUCTOR") {
      redirect("/instructor/dashboard");
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [
      enrolledRes,
      goalsRes,
      monthGoalsRes,
      streakRes,
      notificationsRes,
      unreadNotificationsRes,
      catalogRes,
    ] = await Promise.all([
      EnrollmentApi.getEnrolledCourses({ page: 1, size: 6 }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
      DailyGoalApi.getDailyGoals({ date: today }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
      DailyGoalApi.getDailyGoalsInMonth({ year, month }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
      StreakApi.getMyStreak().catch((err) => {
        throwOn401(err);
        return { data: undefined };
      }),
      NotificationApi.getNotifications({ page: 1, size: 5, sort: '{"createdAt":"DESC"}' }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
      NotificationApi.countUnreadNotifications().catch((err) => {
        throwOn401(err);
        return { data: 0 };
      }),
      CourseApi.getAllCourses({ page: 1, size: 6, sort: '{"rating":"DESC"}' }).catch((err) => {
        throwOn401(err);
        return { data: [] };
      }),
    ]);

    return (
      <StudentHomePage
        user={currentUserRes.data}
        streak={streakRes.data}
        enrolledCourses={enrolledRes.data || []}
        recommendations={catalogRes.data || []}
        goals={goalsRes.data || []}
        monthGoals={monthGoalsRes.data || []}
        notifications={notificationsRes.data || []}
        unreadNotificationsCount={unreadNotificationsRes.data || 0}
        header={<CoursesTopNav />}
        footer={<CoursesFooter />}
      />
    );
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    const status = error?.response?.status || error?.status;
    if (status === 401) {
      redirect("/login?returnUrl=%2Fmy-learning&error=session_expired");
    }
    throw error;
  }
}
