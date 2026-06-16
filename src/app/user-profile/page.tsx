import type { Metadata } from "next";
import { UserProfileDashboardPage } from "@/components/user-profile/UserProfileDashboardPage";
import { UserApi } from "@/services/api/user-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { getProfileAvatar } from "@/lib/format";
import { UserProfileTopNav } from "@/components/user-profile/UserProfileTopNav";
import { CoursesFooter } from "@/components/courses/CoursesFooter";

export const metadata: Metadata = {
  title: "Dashboard - Lumina",
  description: "View your Lumina learning dashboard, enrolled courses, progress, and profile overview.",
  alternates: {
    canonical: "/user-profile",
  },
};

export default async function Page() {
  const [userRes, enrolledRes] = await Promise.all([
    UserApi.getCurrentUser().catch(() => ({ data: undefined })),
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 4 }).catch(() => ({ data: [], meta: { totalElements: 0 } })),
  ]);

  const user = userRes.data;
  const enrolledCourses = enrolledRes.data || [];
  const totalEnrolled = enrolledRes.meta?.totalElements || enrolledCourses.length;
  const avatar = getProfileAvatar(user);

  return (
    <UserProfileDashboardPage
      user={user}
      enrolledCourses={enrolledCourses}
      totalEnrolled={totalEnrolled}
      header={<UserProfileTopNav avatar={avatar} />}
      footer={<CoursesFooter />}
    />
  );
}
