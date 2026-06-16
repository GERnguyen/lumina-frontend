"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { CourseCatalogFilters } from "@/types";

type CoursesSearchFormProps = {
  filters: CourseCatalogFilters;
};

export function CoursesSearchForm({ filters }: CoursesSearchFormProps) {
  const [query, setQuery] = useState(filters.query || "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    function handleSuggestion(event: Event) {
      const nextQuery = (event as CustomEvent<string>).detail;
      if (typeof nextQuery === "string") {
        setQuery(nextQuery);
      }
    }

    window.addEventListener("lumina:courses-search", handleSuggestion);
    return () => window.removeEventListener("lumina:courses-search", handleSuggestion);
  }, []);

  return (
    <form action="/courses" className="flex flex-col gap-4 sm:flex-row">
      {filters.categoryId ? <input type="hidden" name="categoryId" value={filters.categoryId} /> : null}
      {filters.rating ? <input type="hidden" name="rating" value={filters.rating} /> : null}
      {filters.priceFrom !== undefined ? <input type="hidden" name="priceFrom" value={filters.priceFrom} /> : null}
      {filters.priceTo !== undefined ? <input type="hidden" name="priceTo" value={filters.priceTo} /> : null}
      {filters.sort ? <input type="hidden" name="sort" value={filters.sort} /> : null}
      <label className="flex h-12 w-full items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4 transition focus-within:border-[#7872FD] focus-within:shadow-[0_0_0_4px_rgba(120,114,253,0.10)] sm:w-[457px]">
        <Search className="size-6 text-[#8C94A3]" />
        <span className="sr-only">Search current courses</span>
        <input
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#1D2026] focus:ring-0"
          placeholder={focused ? "" : "Search courses"}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="grid size-7 shrink-0 place-items-center rounded-full text-[#8C94A3] transition hover:bg-[#F5F7FA] hover:text-[#1D2026]"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </label>
      <button type="submit" className="h-12 rounded-[18px] bg-[#7872FD] px-5 text-sm font-semibold text-white transition hover:bg-[#5F58F0]">
        Search
      </button>
    </form>
  );
}
