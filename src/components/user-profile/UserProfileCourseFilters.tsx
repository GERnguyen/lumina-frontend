import { ChevronDown, Search } from "lucide-react";
import type { ProfileCourseFilter, ProfileCourseItem } from "@/data/user-profile";

function SelectField({ label, name, value, options }: { label: string; name: string; value?: string; options: Array<{ label: string; value: string }> }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-xs leading-4 text-[#6E7485]">{label}</span>
      <span className="relative block">
        <select name={name} defaultValue={value || options[0]?.value} className="h-12 w-full appearance-none border border-[#E9EAF0] bg-white px-4 pr-10 text-base text-[#4E5566] outline-none transition focus:border-[#564FFD]">
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

export function UserProfileCourseFilters({ filters, courses }: { filters: ProfileCourseFilter; courses: ProfileCourseItem[] }) {
  const teachers = Array.from(new Set(courses.map((course) => course.teacher))).filter(Boolean);

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(280px,528px)_repeat(3,minmax(180px,240px))]" action="/user-profile/courses">
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-xs leading-4 text-[#6E7485]">Search:</span>
        <span className="flex h-12 items-center gap-3 border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
          <Search className="size-6 text-[#8C94A3]" />
          <input
            name="query"
            defaultValue={filters.query || ""}
            className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
            placeholder="Search in your courses..."
          />
        </span>
      </label>

      <SelectField
        label="Sort by:"
        name="sort"
        value={filters.sort}
        options={[
          { label: "Latest", value: "latest" },
          { label: "Progress", value: "progress" },
          { label: "Title", value: "title" },
        ]}
      />
      <SelectField
        label="Status:"
        name="status"
        value={filters.status}
        options={[
          { label: "All Courses", value: "all" },
          { label: "Active Courses", value: "active" },
          { label: "Completed Courses", value: "completed" },
        ]}
      />
      <SelectField
        label="Teacher:"
        name="teacher"
        value={filters.teacher}
        options={[{ label: "All Teachers", value: "all" }, ...teachers.map((teacher) => ({ label: teacher, value: teacher }))]}
      />

      <button type="submit" className="sr-only">
        Apply filters
      </button>
    </form>
  );
}
