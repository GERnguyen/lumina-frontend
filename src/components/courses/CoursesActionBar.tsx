import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import { courseSuggestions } from "@/data/courses";

export function CoursesActionBar() {
  return (
    <section className="flex flex-col gap-0">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="flex h-12 items-center justify-center gap-3 rounded-[18px] border border-[#7872FD] bg-white px-6 text-base font-semibold text-[#7872FD]">
            <SlidersHorizontal className="size-6" />
            Filter
            <span className="flex min-w-6 items-center justify-center bg-[#7872FD] px-1.5 py-1 text-xs text-white">
              3
            </span>
          </button>
          <label className="flex h-12 w-full items-center gap-3 rounded-[18px] border border-[#E9EAF0] px-4 sm:w-[457px]">
            <Search className="size-6 text-[#8C94A3]" />
            <span className="sr-only">Search current courses</span>
            <input
              className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#1D2026] focus:ring-0"
              placeholder="UI/UX Design"
            />
          </label>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-sm text-[#4E5566]">Sort by:</p>
          <button className="flex h-12 w-[200px] items-center justify-between rounded-[18px] border border-[#E9EAF0] px-4 text-base text-[#4E5566]">
            Trending <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-b border-[#E9EAF0] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 text-sm tracking-[-0.14px]">
          <span className="text-[#1D2026]">Suggestion:</span>
          {courseSuggestions.map((item) => (
            <button key={item} className="text-[#7872FD]">
              {item}
            </button>
          ))}
        </div>
        <p className="text-sm tracking-[-0.14px] text-[#4E5566]">
          <strong className="font-medium text-[#1D2026]">3,145,684</strong>{" "}
          results find for <span>&quot;ui/ux design&quot;</span>
        </p>
      </div>
    </section>
  );
}
