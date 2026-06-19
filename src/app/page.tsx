import type { Metadata } from "next";
import { HomeMarketplacePage } from "@/components/home/HomeMarketplacePage";
import { InstructorDashboardPage } from "@/components/instructor/InstructorDashboardPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { CategoryApi, CourseApi } from "@/services/api/course-api";
import { UserApi } from "@/services/api/user-api";
import { getInstructorDashboardData } from "@/services/instructor-dashboard-service";

export const metadata: Metadata = {
  title: "Lumina - Career-focused online learning",
  description:
    "Lumina helps learners discover practical IT courses, explore categories, and build job-ready technology skills.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lumina - Career-focused online learning",
    description:
      "Discover practical courses, career pathways, categories, and instructor-led learning on Lumina.",
    url: "/",
    siteName: "Lumina",
    type: "website",
  },
};

export default async function Home() {
  const token = await getServerAccessToken();

  if (token) {
    const currentUserRes = await UserApi.getCurrentUser().catch(() => ({ data: undefined }));
    if (currentUserRes.data?.role === "INSTRUCTOR") {
      const data = await getInstructorDashboardData();
      return <InstructorDashboardPage data={data} />;
    }
  }

  const [featuredRes, popularRes, categoriesRes] = await Promise.all([
    CourseApi.getAllCourses({ page: 1, size: 8, sort: '{"rating":"DESC"}' }).catch(() => ({ data: [] })),
    CourseApi.getAllCourses({ page: 1, size: 8, sort: '{"enrollmentCount":"DESC"}' }).catch(() => ({ data: [] })),
    CategoryApi.getAllCategories().catch(() => ({ data: [] })),
  ]);

  return (
    <HomeMarketplacePage
      featuredCourses={featuredRes.data || []}
      popularCourses={popularRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}
