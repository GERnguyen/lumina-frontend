import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { InstructorCoursesFilters } from "@/services/instructor-courses-service";
import type { PaginatedMetadata } from "@/types";

type InstructorCoursesPaginationProps = {
  meta: PaginatedMetadata;
  filters: InstructorCoursesFilters;
};

function pageHref(page: number, filters: InstructorCoursesFilters) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(filters.size));
  if (filters.query) params.set("query", filters.query);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  return `/instructor/courses?${params.toString()}`;
}

export function InstructorCoursesPagination({ meta, filters }: InstructorCoursesPaginationProps) {
  const currentPage = meta.page || filters.page;
  const totalPages = Math.max(1, meta.totalPages || 1);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    const half = 2;
    const start = Math.max(1, Math.min(currentPage - half, totalPages - 4));
    return start + index;
  }).filter((page) => page <= totalPages);

  return (
    <nav className="flex items-center justify-center gap-4" aria-label="Instructor courses pagination">
      <Link
        href={pageHref(Math.max(1, currentPage - 1), filters)}
        aria-disabled={currentPage <= 1}
        className={`flex size-12 items-center justify-center rounded-full bg-white transition ${
          currentPage <= 1 ? "pointer-events-none text-[#C6CAD1]" : "text-[#564FFD] hover:bg-[#EBEBFF]"
        }`}
      >
        <ArrowLeft className="size-5" />
      </Link>

      <div className="flex items-center">
        {pages.map((page) => (
          <Link
            key={page}
            href={pageHref(page, filters)}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium tracking-[-0.14px] transition ${
              page === currentPage ? "bg-[#564FFD] text-white" : "text-[#1D2026] hover:bg-white hover:text-[#564FFD]"
            }`}
          >
            {String(page).padStart(2, "0")}
          </Link>
        ))}
      </div>

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1), filters)}
        aria-disabled={currentPage >= totalPages}
        className={`flex size-12 items-center justify-center rounded-full bg-white transition ${
          currentPage >= totalPages ? "pointer-events-none text-[#C6CAD1]" : "text-[#564FFD] hover:bg-[#EBEBFF]"
        }`}
      >
        <ArrowRight className="size-5" />
      </Link>
    </nav>
  );
}
