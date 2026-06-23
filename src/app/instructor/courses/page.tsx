import { getInstructorCourses } from "@/services/actions/instructor";
import { CategoryApi } from "@/services/api/course-api";
import { InstructorCoursesClient } from "@/components/instructor/InstructorCoursesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khóa học của tôi - Giảng viên",
  description: "Quản lý danh sách khóa học giảng dạy của bạn trên Lumina.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // Extract query filters
  const page = Number(firstParam(searchParams.page) || "1");
  const size = Number(firstParam(searchParams.size) || "10");
  const query = firstParam(searchParams.query);
  const status = firstParam(searchParams.status);
  const publishStatus = firstParam(searchParams.publishStatus);
  const categoryId = firstParam(searchParams.categoryId);
  const sort = firstParam(searchParams.sort) || '{"updatedAt":"DESC"}';

  // Fetch paginated courses & categories in parallel
  const [coursesRes, categoriesRes] = await Promise.all([
    getInstructorCourses({
      page,
      size,
      query,
      sort,
      status: status === "all" ? undefined : status,
      publishStatus: publishStatus === "all" ? undefined : publishStatus,
      categoryId: categoryId === "all" ? undefined : categoryId,
    }),
    CategoryApi.getAllCategories().catch(() => ({ data: [] })),
  ]);

  const courses = coursesRes?.data || [];
  const meta = coursesRes?.meta || { totalElements: 0, totalPages: 1, page: 1, limit: 10 };
  const categories = categoriesRes?.data || [];

  return (
    <InstructorCoursesClient
      courses={courses}
      categories={categories}
      meta={meta}
      filters={{
        page,
        size,
        query: query || "",
        status: status || "all",
        publishStatus: publishStatus || "all",
        categoryId: categoryId || "all",
        sort,
      }}
    />
  );
}
