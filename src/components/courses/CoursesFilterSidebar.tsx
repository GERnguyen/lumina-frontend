import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  courseCategories,
  durationFilters,
  levelFilters,
  ratingFilters,
  toolFilters,
} from "@/data/courses";

export function CoursesFilterSidebar() {
  return (
    <aside className="hidden w-[312px] shrink-0 flex-col gap-6 rounded-[18px] lg:flex">
      <FilterPanel title="Category">
        <div className="space-y-4">
          {courseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <label key={category.label} className="flex w-full cursor-pointer items-center justify-between">
                <span className="flex items-center gap-3">
                  <Icon className="size-5 text-[#8C94A3]" />
                  <span className={category.active ? "text-sm font-medium text-[#1D2026]" : "text-sm text-[#4E5566]"}>
                    {category.label}
                  </span>
                </span>
                <span className="text-xs text-[#8C94A3]">{category.count}</span>
              </label>
            );
          })}
        </div>
      </FilterPanel>

      <FilterPanel title="Tools">
        <RadioList items={toolFilters} active="Webflow" />
      </FilterPanel>

      <FilterPanel title="Rating">
        <RadioList items={ratingFilters} active="3 Star & up" />
      </FilterPanel>

      <FilterPanel title="Course Level">
        <RadioList items={levelFilters} active="All Level" />
      </FilterPanel>

      <FilterPanel title="Price">
        <div className="space-y-4">
          <div className="h-1 rounded-full bg-[#E9EAF0]">
            <div className="ml-8 h-1 w-32 rounded-full bg-[#7872FD]" />
          </div>
          <div className="flex gap-3">
            <input className="h-9 w-full rounded-[8px] border-[#E9EAF0] text-sm" placeholder="$ min" />
            <input className="h-9 w-full rounded-[8px] border-[#E9EAF0] text-sm" placeholder="$ max" />
          </div>
          <RadioList items={["Paid", "Free"]} active="Paid" />
        </div>
      </FilterPanel>

      <FilterPanel title="Duration">
        <RadioList items={durationFilters} active="3-6 Months" />
      </FilterPanel>
    </aside>
  );
}

function FilterPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[#E9EAF0] bg-white">
      <button className="flex w-full items-center justify-between border-b border-[#E9EAF0] p-5 text-left text-lg font-medium uppercase text-[#1D2026]">
        {title}
        <ChevronDown className="size-6 rotate-180" />
      </button>
      <div className="p-4">{children}</div>
    </section>
  );
}

function RadioList({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <label key={item} className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className={item === active ? "size-3 rounded-full border-2 border-[#7872FD]" : "size-3 rounded-full border border-[#C6CAD1]"} />
            <span className="text-sm text-[#4E5566]">{item}</span>
          </span>
          <span className="text-xs text-[#8C94A3]">{["12.4k", "8.3k", "7.1k", "5.8k", "1.3k"][index % 5]}</span>
        </label>
      ))}
    </div>
  );
}
