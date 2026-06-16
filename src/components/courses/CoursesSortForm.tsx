"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { CourseCatalogFilters } from "@/types";

const sortOptions = [
  { label: "Highest rating", value: '{"rating":"DESC"}' },
  { label: "Lowest price", value: '{"discountedPrice":"ASC"}' },
  { label: "Highest price", value: '{"discountedPrice":"DESC"}' },
  { label: "Most enrolled", value: '{"enrollmentCount":"DESC"}' },
];

type CoursesSortFormProps = {
  filters: CourseCatalogFilters;
};

export function CoursesSortForm({ filters }: CoursesSortFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action="/courses" className="flex items-center gap-6">
      {filters.categoryId ? <input type="hidden" name="categoryId" value={filters.categoryId} /> : null}
      {filters.query ? <input type="hidden" name="query" value={filters.query} /> : null}
      {filters.rating ? <input type="hidden" name="rating" value={filters.rating} /> : null}
      {filters.priceFrom !== undefined ? <input type="hidden" name="priceFrom" value={filters.priceFrom} /> : null}
      {filters.priceTo !== undefined ? <input type="hidden" name="priceTo" value={filters.priceTo} /> : null}
      <p className="text-sm text-[#4E5566]">Sort by:</p>
      <label className="relative">
        <span className="sr-only">Sort courses</span>
        <select
          name="sort"
          defaultValue={filters.sort || '{"rating":"DESC"}'}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-12 w-[200px] appearance-none rounded-[18px] border-[#E9EAF0] px-4 pr-10 text-base text-[#4E5566] transition focus:border-[#7872FD] focus:ring-[#7872FD]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#4E5566]" />
      </label>
    </form>
  );
}
