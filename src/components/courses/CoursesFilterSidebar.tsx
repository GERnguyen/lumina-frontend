import Link from "next/link";
import { Star } from "lucide-react";
import type { CourseCatalogFilters, CourseCategoryFilter } from "@/types";
import { cn } from "@/lib/utils";
import { CollapsibleFilterPanel } from "./CollapsibleFilterPanel";

type CoursesFilterSidebarProps = {
  categories: CourseCategoryFilter[];
  filters: CourseCatalogFilters;
  queryString: (updates: Partial<CourseCatalogFilters>) => string;
  isAuthenticated: boolean;
};

export function CoursesFilterSidebar({ categories, filters, queryString, isAuthenticated }: CoursesFilterSidebarProps) {
  return (
    <aside className="hidden w-[312px] shrink-0 flex-col gap-6 rounded-[18px] lg:flex">
      {isAuthenticated && (
        <CollapsibleFilterPanel title="Preferences">
          <div className="space-y-4">
            <Link
              href={queryString({ excludeEnrolled: filters.excludeEnrolled ? undefined : true, page: 1 })}
              className="flex items-center gap-3 rounded-[14px] px-3 py-2 transition hover:bg-[#F7F7FF]"
            >
              <span className={filters.excludeEnrolled ? "size-4 flex items-center justify-center rounded border border-[#7872FD] bg-[#7872FD] text-white" : "size-4 rounded border border-[#C6CAD1]"} >
                {filters.excludeEnrolled && (
                  <svg className="size-3 fill-current" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium text-[#4E5566]">Hide purchased courses</span>
            </Link>
          </div>
        </CollapsibleFilterPanel>
      )}
      <CollapsibleFilterPanel title="Category">
        <div className="space-y-4">
          <FilterLink href={queryString({ categoryId: undefined, page: 1 })} active={!filters.categoryId} label="All categories" />
          {categories.map((category) => (
            <FilterLink
              key={category.id}
              href={queryString({ categoryId: category.id, page: 1 })}
              active={filters.categoryId === category.id}
              label={category.label}
              count={category.count}
            />
          ))}
        </div>
      </CollapsibleFilterPanel>

      <CollapsibleFilterPanel title="Rating">
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <Link key={rating} href={queryString({ rating, page: 1 })} className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-2 transition hover:bg-[#F7F7FF]">
              <span className="flex items-center gap-2">
                <span className={filters.rating === rating ? "size-3 rounded-full border-2 border-[#7872FD]" : "size-3 rounded-full border border-[#C6CAD1]"} />
                <span className="flex items-center gap-1 text-sm text-[#4E5566]">
                  <Star className="size-4 fill-[#FD8E1F] text-[#FD8E1F]" />
                  {rating} Star & up
                </span>
              </span>
            </Link>
          ))}
          {filters.rating ? (
            <Link href={queryString({ rating: undefined, page: 1 })} className="text-sm font-medium text-[#7872FD]">
              Clear rating
            </Link>
          ) : null}
        </div>
      </CollapsibleFilterPanel>

      <CollapsibleFilterPanel title="Price">
        <form action="/courses" className="space-y-4">
          {filters.categoryId ? <input type="hidden" name="categoryId" value={filters.categoryId} /> : null}
          {filters.query ? <input type="hidden" name="query" value={filters.query} /> : null}
          {filters.rating ? <input type="hidden" name="rating" value={filters.rating} /> : null}
          {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
          <div className="flex gap-3">
            <input name="priceFrom" defaultValue={filters.priceFrom ?? ""} className="h-10 w-full rounded-[14px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]" placeholder="Min VND" />
            <input name="priceTo" defaultValue={filters.priceTo ?? ""} className="h-10 w-full rounded-[14px] border-[#E9EAF0] text-sm focus:border-[#7872FD] focus:ring-[#7872FD]" placeholder="Max VND" />
          </div>
          <button type="submit" className="h-10 w-full rounded-[18px] bg-[#7872FD] text-sm font-semibold text-white">
            Apply price
          </button>
          {(filters.priceFrom !== undefined || filters.priceTo !== undefined) ? (
            <Link href={queryString({ priceFrom: undefined, priceTo: undefined, page: 1 })} className="block text-center text-sm font-medium text-[#7872FD]">
              Clear price
            </Link>
          ) : null}
        </form>
      </CollapsibleFilterPanel>
    </aside>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: string;
}) {
  return (
    <Link href={href} className={cn("flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2 transition hover:bg-[#F7F7FF] hover:text-[#7872FD]", active && "bg-[#F7F7FF]")}>
      <span className="flex min-w-0 items-center gap-3">
        <span className={cn("truncate text-sm", active ? "font-medium text-[#1D2026]" : "text-[#4E5566]")}>{label}</span>
      </span>
      {count ? <span className="shrink-0 text-xs text-[#8C94A3]">{count}</span> : null}
    </Link>
  );
}
