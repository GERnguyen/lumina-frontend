import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CoursesPaginationProps = {
  currentPage: number;
  totalPages: number;
  queryString: (page: number) => string;
};

export function CoursesPagination({ currentPage, totalPages, queryString }: CoursesPaginationProps) {
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) return index + 1;
    const start = Math.min(Math.max(currentPage - 2, 1), totalPages - 4);
    return start + index;
  });

  return (
    <nav className="flex items-center justify-center gap-4" aria-label="Courses pagination">
      <Link
        href={queryString(Math.max(1, currentPage - 1))}
        className={cn("flex size-12 items-center justify-center rounded-full", currentPage <= 1 ? "pointer-events-none opacity-40" : "bg-[#F5F5FF] text-[#7872FD]")}
        aria-label="Previous page"
      >
        <ArrowLeft className="size-6" />
      </Link>
      <div className="flex items-center">
        {visiblePages.map((page) => (
          <Link
            key={page}
            href={queryString(page)}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium tracking-[-0.14px]",
              page === currentPage && "bg-[#7872FD] text-white",
              page !== currentPage && "text-[#1D2026] hover:bg-[#EBEBFF] hover:text-[#7872FD]",
            )}
          >
            {String(page).padStart(2, "0")}
          </Link>
        ))}
      </div>
      <Link
        href={queryString(Math.min(totalPages, currentPage + 1))}
        className={cn("flex size-12 items-center justify-center rounded-full bg-[#EBEBFF] text-[#7872FD]", currentPage >= totalPages && "pointer-events-none opacity-40")}
        aria-label="Next page"
      >
        <ArrowRight className="size-6" />
      </Link>
    </nav>
  );
}
