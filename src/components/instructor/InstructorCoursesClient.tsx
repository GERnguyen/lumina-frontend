"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import type { CategoryResponse, CourseResponse, PaginatedMetadata } from "@/types";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { DataTable, DataTableEmptyState, DataTablePagination } from "@/components/ui/shared";
import { getCourseColumns } from "./courses/course-columns";
import { CoursesFilterBar } from "./courses/CoursesFilterBar";

interface InstructorCoursesClientProps {
  courses: CourseResponse[];
  categories: CategoryResponse[];
  meta: PaginatedMetadata;
  filters: {
    page: number;
    size: number;
    query: string;
    status: string;
    publishStatus: string;
    categoryId: string;
    sort: string;
  };
}

export function InstructorCoursesClient({
  courses,
  categories,
  meta,
  filters,
}: InstructorCoursesClientProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(filters.query);

  const totalElements = meta.totalElements ?? 0;
  const totalPages = meta.totalPages ?? 1;
  const currentPage = meta.page ?? 1;

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const activeFilters = { ...filters, ...newFilters };

    if (
      newFilters.query !== undefined ||
      newFilters.status !== undefined ||
      newFilters.publishStatus !== undefined ||
      newFilters.categoryId !== undefined
    ) {
      activeFilters.page = 1;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(activeFilters.page));
    searchParams.set("size", String(activeFilters.size));
    searchParams.set("sort", activeFilters.sort);

    if (activeFilters.query) searchParams.set("query", activeFilters.query);
    if (activeFilters.status && activeFilters.status !== "all") searchParams.set("status", activeFilters.status);
    if (activeFilters.publishStatus && activeFilters.publishStatus !== "all") {
      searchParams.set("publishStatus", activeFilters.publishStatus);
    }
    if (activeFilters.categoryId && activeFilters.categoryId !== "all") {
      searchParams.set("categoryId", activeFilters.categoryId);
    }

    router.push(`/instructor/courses?${searchParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters({ page: newPage });
    }
  };

  const handleClearFilters = () => {
    setSearchVal("");
    router.push("/instructor/courses");
  };

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name || "Chưa đặt tên",
      })),
    ],
    [categories]
  );

  const columns = useMemo(() => getCourseColumns(), []);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Upper info Card */}
      <InstructorCard
        bodyClassName="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        className="border-zinc-200/50"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Danh sách khóa học</h2>
          <p className="mt-1 text-xs font-semibold text-zinc-450">
            Tổng cộng <span className="font-bold text-zinc-700">{totalElements}</span> khóa học giảng dạy
          </p>
        </div>
        <InstructorButton
          variant="primary"
          icon={Plus}
          onClick={() => router.push("/instructor/courses/create")}
          className="rounded-lg shadow-sm"
        >
          Tạo khóa học mới
        </InstructorButton>
      </InstructorCard>

      {/* Filter box */}
      <CoursesFilterBar
        filters={filters}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        categoryOptions={categoryOptions}
        updateFilters={updateFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <InstructorCard
        bodyClassName="p-0"
        className="border-zinc-200/50 shadow-xs"
        footer={
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="khóa học"
            onPageChange={handlePageChange}
          />
        }
      >
        {courses.length === 0 ? (
          <DataTableEmptyState
            icon={BookOpen}
            title="Không tìm thấy khóa học nào"
            description="Hãy thử điều chỉnh bộ lọc tìm kiếm hoặc tạo một khóa học mới để bắt đầu."
          />
        ) : (
          <DataTable columns={columns} data={courses} minWidth={880} />
        )}
      </InstructorCard>
    </div>
  );
}
