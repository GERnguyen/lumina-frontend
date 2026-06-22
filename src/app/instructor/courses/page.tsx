import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InstructorCoursesPage } from "@/components/instructor/InstructorCoursesPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { getInstructorCoursesData, type InstructorCoursesFilters } from "@/services/instructor-courses-service";

export const metadata: Metadata = {
  title: "My Courses - Lumina Instructor",
  description: "Search, filter, and manage your Lumina instructor courses.",
  alternates: {
    canonical: "/instructor/courses",
  },
};

type InstructorCoursesRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sortParam(value: string | string[] | undefined) {
  const raw = firstParam(value);
  if (!raw) return '{"createdAt":"DESC"}';
  return raw;
}

export default async function InstructorCoursesRoute({ searchParams }: InstructorCoursesRouteProps) {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const params = await searchParams;
  const filters: InstructorCoursesFilters = {
    page: numberParam(params.page) || 1,
    size: numberParam(params.size) || 12,
    query: firstParam(params.query),
    sort: sortParam(params.sort),
    rating: numberParam(params.rating),
    categoryId: firstParam(params.categoryId),
    status: firstParam(params.status),
  };

  const data = await getInstructorCoursesData(filters);
  if (data.user.role && data.user.role !== "INSTRUCTOR") {
    redirect("/courses");
  }

  return <InstructorCoursesPage data={data} filters={filters} />;
}
