"use client";

import { ChevronDown, Search } from "lucide-react";

function SelectField({
  label,
  name,
  value,
  options,
  onValueChange,
}: {
  label: string;
  name: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-xs leading-4 text-[#6E7485]">{label}</span>
      <span className="relative block">
        <select
          name={name}
          {...(onValueChange
            ? { value: value || options[0]?.value, onChange: (event) => onValueChange(event.target.value) }
            : { defaultValue: value || options[0]?.value })}
          className="h-12 w-full appearance-none rounded-[18px] border border-[#E9EAF0] bg-white px-4 pr-10 text-base text-[#4E5566] outline-none transition focus:border-[#564FFD]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#4E5566]" />
      </span>
    </label>
  );
}

export function UserProfileCourseFilters({
  filters,
  onChange,
}: {
  filters: { query: string; sort: string };
  onChange?: (filters: { query: string; sort: string }) => void;
}) {
  const updateFilter = (key: "query" | "sort", value: string) => {
    onChange?.({ ...filters, [key]: value });
  };

  return (
    <form
      className="grid gap-6 sm:grid-cols-[1fr_240px]"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Search:</span>
        <span className="flex h-12 items-center gap-3 rounded-[18px] border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
          <Search className="size-6 text-[#8C94A3]" />
          <input
            name="query"
            value={filters.query || ""}
            onChange={(event) => updateFilter("query", event.target.value)}
            className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
            placeholder="Search in your courses..."
          />
        </span>
      </label>

      <SelectField
        label="Sort by:"
        name="sort"
        value={filters.sort}
        onValueChange={(value) => updateFilter("sort", value)}
        options={[
          { label: "Latest", value: JSON.stringify({ enrolledAt: "DESC" }) },
          { label: "Oldest", value: JSON.stringify({ enrolledAt: "ASC" }) },
        ]}
      />
    </form>
  );
}
