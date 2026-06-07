import Link from "next/link";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import { courseSuggestions } from "@/data/courses";
import type { CourseCatalogFilters } from "@/services/course-catalog-service";

const sortOptions = [
  { label: "Newest", value: "createdAt,desc" },
  { label: "Highest rating", value: "rating,desc" },
  { label: "Most enrolled", value: "enrollmentCount,desc" },
  { label: "Lowest price", value: "price,asc" },
];

type CoursesActionBarProps = {
  filters: CourseCatalogFilters;
  totalElements: number;
  isFallback: boolean;
  queryString: (updates: Partial<CourseCatalogFilters>) => string;
};

export function CoursesActionBar({ filters, totalElements, isFallback, queryString }: CoursesActionBarProps) {
  const activeFilters = [filters.categoryId, filters.query, filters.rating, filters.priceFrom, filters.priceTo].filter(Boolean).length;
  const searchLabel = filters.query || "all courses";

  return (
    <section className="flex flex-col gap-0">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <form action="/courses" className="flex flex-col gap-4 sm:flex-row">
          <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-[18px] border border-[#7872FD] bg-white px-6 text-base font-semibold text-[#7872FD] lg:pointer-events-none">
            <SlidersHorizontal className="size-6" />
            Filter
            <span className="flex min-w-6 items-center justify-center bg-[#7872FD] px-1.5 py-1 text-xs text-white">
              {activeFilters}
            </span>
          </button>
          {filters.categoryId ? <input type="hidden" name="categoryId" value={filters.categoryId} /> : null}
          {filters.rating ? <input type="hidden" name="rating" value={filters.rating} /> : null}
          {filters.priceFrom !== undefined ? <input type="hidden" name="priceFrom" value={filters.priceFrom} /> : null}
          {filters.priceTo !== undefined ? <input type="hidden" name="priceTo" value={filters.priceTo} /> : null}
          {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
          <label className="flex h-12 w-full items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4 sm:w-[457px]">
            <Search className="size-6 text-[#8C94A3]" />
            <span className="sr-only">Search current courses</span>
            <input
              name="query"
              defaultValue={filters.query || ""}
              className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#1D2026] focus:ring-0"
              placeholder="Search courses"
            />
          </label>
        </form>

        <form action="/courses" className="flex items-center gap-6">
          {filters.categoryId ? <input type="hidden" name="categoryId" value={filters.categoryId} /> : null}
          {filters.query ? <input type="hidden" name="query" value={filters.query} /> : null}
          {filters.rating ? <input type="hidden" name="rating" value={filters.rating} /> : null}
          {filters.priceFrom !== undefined ? <input type="hidden" name="priceFrom" value={filters.priceFrom} /> : null}
          {filters.priceTo !== undefined ? <input type="hidden" name="priceTo" value={filters.priceTo} /> : null}
          <p className="text-sm text-[#4E5566]">Sort by:</p>
          <label className="relative">
            <span className="sr-only">Sort courses</span>
            <select name="sort" defaultValue={filters.sort || "createdAt,desc"} className="h-12 w-[200px] appearance-none rounded-[18px] border-[#E9EAF0] px-4 pr-10 text-base text-[#4E5566] focus:border-[#7872FD] focus:ring-[#7872FD]">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#4E5566]" />
          </label>
          <button type="submit" className="hidden h-12 rounded-[18px] bg-[#7872FD] px-5 text-sm font-semibold text-white sm:block">
            Apply
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-b border-[#E9EAF0] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 text-sm tracking-[-0.14px]">
          <span className="text-[#1D2026]">Suggestion:</span>
          {courseSuggestions.map((item) => (
            <Link key={item} href={queryString({ query: item, page: 1 })} className="text-[#7872FD] hover:text-[#5F58F0]">
              {item}
            </Link>
          ))}
        </div>
        <p className="text-sm tracking-[-0.14px] text-[#4E5566]">
          <strong className="font-medium text-[#1D2026]">{new Intl.NumberFormat("en-US").format(totalElements)}</strong>{" "}
          results found for <span>&quot;{searchLabel}&quot;</span>
          {isFallback ? <span className="ml-2 text-xs text-[#8C94A3]">(mock fallback)</span> : null}
        </p>
      </div>
    </section>
  );
}
