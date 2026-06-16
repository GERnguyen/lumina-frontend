import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { StudentHomePage } from "@/components/home/StudentHomePage";
import { getServerAccessToken } from "@/lib/server-auth";
import { UserApi } from "@/services/api/user-api";
import { StreakApi } from "@/services/api/learning-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { CourseApi } from "@/services/api/course-api";
import { DailyGoalApi } from "@/services/api/learning-api";
import { NotificationApi } from "@/services/api/notification-api";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CoursesFooter } from "@/components/courses/CoursesFooter";

export const metadata: Metadata = {
  title: "Lumina - Career-focused online learning",
  description:
    "Lumina helps learners discover courses, build skills, create career roadmaps, and showcase projects for IT career growth.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lumina - Career-focused online learning",
    description:
      "Discover practical courses, AI career roadmaps, portfolio showcase tools, and instructor-led learning on Lumina.",
    url: "/",
    siteName: "Lumina",
    type: "website",
  },
};

export default async function Home() {
  const token = await getServerAccessToken();
  if (!token) {
    return <LandingPage />;
  }

  // Fetch all raw data on the server
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [
    userRes,
    enrolledRes,
    goalsRes,
    monthGoalsRes,
    streakRes,
    notificationsRes,
    unreadNotificationsRes,
    catalogRes,
  ] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 6 }).catch(() => ({ data: [] })),
    DailyGoalApi.getDailyGoals({ date: today }).catch(() => ({ data: [] })),
    DailyGoalApi.getDailyGoalsInMonth({ year, month }).catch(() => ({ data: [] })),
    StreakApi.getMyStreak().catch(() => ({ data: undefined })),
    NotificationApi.getNotifications({ page: 1, size: 5, sort: '{"createdAt":"DESC"}' }).catch(() => ({ data: [] })),
    NotificationApi.countUnreadNotifications().catch(() => ({ data: 0 })),
    CourseApi.getAllCourses({ page: 1, size: 6, sort: '{"rating":"DESC"}' }).catch(() => ({ data: [] })),
  ]);

  const enrolled = enrolledRes.data || [];

  return (
    <StudentHomePage
      user={userRes.data}
      streak={streakRes.data}
      enrolledCourses={enrolled}
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
