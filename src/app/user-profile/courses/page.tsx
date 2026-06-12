import type { Metadata } from "next";
import { UserProfileCoursesPage } from "@/components/user-profile/UserProfileCoursesPage";
import type { ProfileCourseFilter } from "@/data/user-profile";
import { getUserProfileCourses } from "@/services/user-profile-service";

type UserProfileCoursesRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "My Courses - Lumina",
  description: "Browse and continue your enrolled Lumina courses.",
  alternates: {
    canonical: "/user-profile/courses",
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ProfileCourseFilter {
  const page = Number(firstParam(params.page) || "1");

  return {
    query: firstParam(params.query),
    sort: firstParam(params.sort) || "latest",
    status: firstParam(params.status) || "all",
    teacher: firstParam(params.teacher) || "all",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export default async function Page({ searchParams }: UserProfileCoursesRouteProps) {
  const params = await searchParams;
  const { coursesPage } = await getUserProfileCourses(parseFilters(params));

  return <UserProfileCoursesPage coursesPage={coursesPage} />;
}
