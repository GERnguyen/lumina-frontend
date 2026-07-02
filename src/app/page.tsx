import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeMarketplacePage } from "@/components/home/HomeMarketplacePage";
import { LandingPage } from "@/components/landing/LandingPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { CategoryApi, CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { LearningProgressApi } from "@/services/api/learning-api";
import { UserApi } from "@/services/api/user-api";

export const metadata: Metadata = {
  title: "Cinx - Career-focused online learning",
  description:
    "Cinx helps learners discover practical IT courses, explore categories, and build job-ready technology skills.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cinx - Career-focused online learning",
    description:
      "Discover practical courses, career pathways, categories, and instructor-led learning on Cinx.",
    url: "/",
    siteName: "Cinx",
    type: "website",
  },
};

export default async function Home() {
  const token = await getServerAccessToken();

  if (!token) {
    return <LandingPage />;
  }

  const currentUserRes = await UserApi.getCurrentUser().catch(() => ({ data: undefined }));
  const currentUser = currentUserRes.data;

  if (!currentUser) {
    return <LandingPage />;
  }

  if (currentUser.role === "INSTRUCTOR") {
    redirect("/instructor/courses");
  }

  const [featuredRes, popularRes, categoriesRes, enrolledRes] = await Promise.all([
    CourseApi.getAllCourses({ page: 1, size: 8, sort: '{"rating":"DESC"}' }).catch(() => ({ data: [] })),
    CourseApi.getAllCourses({ page: 1, size: 8, sort: '{"enrollmentCount":"DESC"}' }).catch(() => ({ data: [] })),
    CategoryApi.getAllCategories().catch(() => ({ data: [] })),
    EnrollmentApi.getEnrolledCourses({ page: 1, size: 8 }).catch(() => ({ data: [] })),
  ]);
  const enrolledCourses = enrolledRes.data || [];
  const enrolledIds = enrolledCourses.map((item) => item.course?.id).filter(Boolean) as string[];
  const progressRes = enrolledIds.length
    ? await LearningProgressApi.getCourseProgressByCourseIds(enrolledIds.join(",")).catch(() => ({ data: [] }))
    : { data: [] };
  const progressList = progressRes.data || [];
  const continueLearningCourses = enrolledCourses
    .map((item, index) => {
      const course = item.course;
      if (!course) return null;
      const progress = progressList.find((p) => p.courseId === course.id);
      const progressPercent = progress?.totalItems
        ? Math.round(((progress.completedItems || 0) / progress.totalItems) * 100)
        : 0;

      return {
        course,
        progressPercent,
        completedItems: progress?.completedItems || 0,
        totalItems: progress?.totalItems || 0,
        index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item && item.progressPercent < 100);

  return (
    <HomeMarketplacePage
      featuredCourses={featuredRes.data || []}
      popularCourses={popularRes.data || []}
      categories={categoriesRes.data || []}
      continueLearningCourses={continueLearningCourses}
    />
  );
}
