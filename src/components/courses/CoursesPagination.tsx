import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CoursesPagination() {
  return (
    <nav className="flex items-center justify-center gap-4" aria-label="Courses pagination">
      <button className="flex size-12 items-center justify-center rounded-full opacity-50" aria-label="Previous page">
        <ArrowLeft className="size-6" />
      </button>
      <div className="flex items-center">
        {["01", "02", "03", "04", "05"].map((page) => (
          <button
            key={page}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium tracking-[-0.14px]",
              page === "02" && "bg-[#7872FD] text-white",
              page === "04" && "bg-[#EBEBFF] text-[#7872FD]",
              page !== "02" && page !== "04" && "text-[#1D2026]",
            )}
          >
            {page}
          </button>
        ))}
      </div>
      <button className="flex size-12 items-center justify-center rounded-full bg-[#EBEBFF] text-[#7872FD]" aria-label="Next page">
        <ArrowRight className="size-6" />
      </button>
    </nav>
  );
}
