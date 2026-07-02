import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProfileCourseFilter } from "@/data/user-profile";

function pageHref(page: number, filters: ProfileCourseFilter) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.sort && filters.sort !== "latest") params.set("sort", filters.sort);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.teacher && filters.teacher !== "all") params.set("teacher", filters.teacher);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/user-profile?tab=courses&${query}` : "/user-profile?tab=courses";
}

export function UserProfileCoursesPagination({ currentPage, totalPages, filters }: { currentPage: number; totalPages: number; filters: ProfileCourseFilter }) {
  const pages = Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, index) => index + 1);

  return (
    <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Courses pagination">
      <Link href={pageHref(Math.max(1, currentPage - 1), filters)} className="flex size-12 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD] transition hover:bg-[#DEDDFF]">
        <ArrowLeft className="size-5" />
      </Link>
      <div className="flex items-center">
        {pages.map((page) => (
          <Link
            key={page}
            href={pageHref(page, filters)}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium tracking-normal transition ${
              page === currentPage ? "bg-[#564FFD] text-white" : page === 4 ? "bg-[#EBEBFF] text-[#564FFD]" : "text-[#1D2026] hover:bg-[#EBEBFF]"
            }`}
          >
            {String(page).padStart(2, "0")}
          </Link>
        ))}
      </div>
      <Link href={pageHref(Math.min(totalPages, currentPage + 1), filters)} className="flex size-12 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD] transition hover:bg-[#DEDDFF]">
        <ArrowRight className="size-5" />
      </Link>
    </nav>
  );
}
