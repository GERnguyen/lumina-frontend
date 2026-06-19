import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentHomePage } from "@/components/home/StudentHomePage";
import { InstructorDashboardPage } from "@/components/instructor/InstructorDashboardPage";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { DailyGoalApi, StreakApi } from "@/services/api/learning-api";
import { NotificationApi } from "@/services/api/notification-api";
import { UserApi } from "@/services/api/user-api";
import { getInstructorDashboardData } from "@/services/instructor-dashboard-service";

export const metadata: Metadata = {
  title: "My Learning - Lumina",
  description: "Continue your Lumina courses, goals, calendar, recommendations, and learning updates.",
  alternates: {
    canonical: "/my-learning",
  },
};

export default async function MyLearningPage() {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const currentUserRes = await UserApi.getCurrentUser().catch(() => ({ data: undefined }));
  if (currentUserRes.data?.role === "INSTRUCTOR") {
    const data = await getInstructorDashboardData();
    return <InstructorDashboardPage data={data} />;
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
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 6 }).catch(() => ({ data: [] })),
    DailyGoalApi.getDailyGoals({ date: today }).catch(() => ({ data: [] })),
    DailyGoalApi.getDailyGoalsInMonth({ year, month }).catch(() => ({ data: [] })),
    StreakApi.getMyStreak().catch(() => ({ data: undefined })),
    NotificationApi.getNotifications({ page: 1, size: 5, sort: '{"createdAt":"DESC"}' }).catch(() => ({ data: [] })),
    NotificationApi.countUnreadNotifications().catch(() => ({ data: 0 })),
    CourseApi.getAllCourses({ page: 1, size: 6, sort: '{"rating":"DESC"}' }).catch(() => ({ data: [] })),
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
}
