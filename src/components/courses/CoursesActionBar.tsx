import { SlidersHorizontal } from "lucide-react";
import { courseSuggestions } from "@/data/courses";
import type { CourseCatalogFilters } from "@/types";
import { CourseSuggestionLinks } from "./CourseSuggestionLinks";
import { CoursesSearchForm } from "./CoursesSearchForm";
import { CoursesSortForm } from "./CoursesSortForm";

type CoursesActionBarProps = {
  filters: CourseCatalogFilters;
  totalElements: number;
  queryString: (updates: Partial<CourseCatalogFilters>) => string;
};

export function CoursesActionBar({ filters, totalElements, queryString }: CoursesActionBarProps) {
  const activeFilters = [filters.categoryId, filters.query, filters.rating, filters.priceFrom, filters.priceTo].filter(Boolean).length;
  const searchLabel = filters.query || "all courses";

  return (
    <section className="flex flex-col gap-0">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-[18px] border border-[#7872FD] bg-white px-6 text-base font-semibold text-[#7872FD] lg:pointer-events-none">
            <SlidersHorizontal className="size-6" />
            Filter
            <span className="flex min-w-6 items-center justify-center bg-[#7872FD] px-1.5 py-1 text-xs text-white">
              {activeFilters}
            </span>
          </button>
          <CoursesSearchForm key={filters.query || "empty-search"} filters={filters} />
        </div>

        <CoursesSortForm filters={filters} />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-b border-[#E9EAF0] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 text-sm tracking-[-0.14px]">
          <span className="text-[#1D2026]">Suggestion:</span>
          <CourseSuggestionLinks suggestions={courseSuggestions.map((item) => ({ label: item, href: queryString({ query: item, page: 1 }) }))} />
          <span className="text-[#8C94A3]">Click a keyword to search.</span>
        </div>
        <p className="text-sm tracking-[-0.14px] text-[#4E5566]">
          <strong className="font-medium text-[#1D2026]">{new Intl.NumberFormat("en-US").format(totalElements)}</strong>{" "}
          results found for <span>&quot;{searchLabel}&quot;</span>
        </p>
      </div>
    </section>
  );
}
