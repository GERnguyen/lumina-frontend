"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { CategoryResponse } from "@/types";
import type { InstructorCoursesFilters } from "@/services/instructor-courses-service";

type InstructorCoursesFiltersProps = {
  filters: InstructorCoursesFilters;
  categories: CategoryResponse[];
};

const sortOptions = [
  { label: "Latest", value: '{"createdAt":"DESC"}' },
  { label: "Oldest", value: '{"createdAt":"ASC"}' },
  { label: "Highest Rating", value: '{"rating":"DESC"}' },
  { label: "Most Enrolled", value: '{"enrollmentCount":"DESC"}' },
  { label: "Lowest Price", value: '{"discountedPrice":"ASC"}' },
  { label: "Highest Price", value: '{"discountedPrice":"DESC"}' },
];

const ratingOptions = [
  { label: "All Ratings", value: "" },
  { label: "4 Star & Up", value: "4" },
  { label: "3 Star & Up", value: "3" },
  { label: "2 Star & Up", value: "2" },
];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Pending review", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

function cleanParams(params: URLSearchParams) {
  Array.from(params.entries()).forEach(([key, value]) => {
    if (!value) params.delete(key);
  });
  return params;
}

export function InstructorCoursesFilters({ filters, categories }: InstructorCoursesFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query || "");

  const initialParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("size", String(filters.size));
    if (filters.query) params.set("query", filters.query);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.rating) params.set("rating", String(filters.rating));
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.status) params.set("status", filters.status);
    return params;
  }, [filters]);

  function pushWith(update: Record<string, string>) {
    const params = new URLSearchParams(initialParams);
    Object.entries(update).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`/instructor/courses?${cleanParams(params).toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushWith({ query });
  }

  function clearSearch() {
    setQuery("");
    pushWith({ query: "" });
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(260px,528px)_200px_200px_200px_200px]">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-2">
        <label htmlFor="instructor-course-search" className="text-xs leading-4 text-[#6E7485]">
          Search:
        </label>
        <div className="flex h-12 items-center gap-3 rounded-[18px] bg-white px-[18px] transition focus-within:shadow-[0_0_0_3px_rgba(86,79,253,0.14)]">
          <Search className="size-5 shrink-0 text-[#8C94A3]" />
          <input
            id="instructor-course-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search in your courses..."
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="flex size-7 items-center justify-center rounded-full text-[#8C94A3] transition hover:bg-[#F5F7FA] hover:text-[#564FFD]"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </form>

      <label className="flex flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Sort by:</span>
        <select
          value={filters.sort || sortOptions[0].value}
          onChange={(event) => pushWith({ sort: event.target.value })}
          className="h-12 rounded-[18px] border-0 bg-white px-[18px] text-sm text-[#4E5566] focus:ring-2 focus:ring-[#564FFD]/20"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Category</span>
        <select
          value={filters.categoryId || ""}
          onChange={(event) => pushWith({ categoryId: event.target.value })}
          className="h-12 rounded-[18px] border-0 bg-white px-[18px] text-sm text-[#4E5566] focus:ring-2 focus:ring-[#564FFD]/20"
        >
          <option value="">All Category</option>
          {categories.map((category) => (
            <option key={category.id || category.name} value={category.id || ""}>
              {category.name || "Untitled"}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Rating</span>
        <select
          value={filters.rating ? String(filters.rating) : ""}
          onChange={(event) => pushWith({ rating: event.target.value })}
          className="h-12 rounded-[18px] border-0 bg-white px-[18px] text-sm text-[#4E5566] focus:ring-2 focus:ring-[#564FFD]/20"
        >
          {ratingOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Status</span>
        <select
          value={filters.status || ""}
          onChange={(event) => pushWith({ status: event.target.value })}
          className="h-12 rounded-[18px] border-0 bg-white px-[18px] text-sm text-[#4E5566] focus:ring-2 focus:ring-[#564FFD]/20"
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
