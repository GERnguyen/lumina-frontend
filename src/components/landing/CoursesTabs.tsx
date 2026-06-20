"use client";

import { useMemo, useState } from "react";
import type { CategoryResponse } from "@/types";
import type { LandingCourse } from "@/data/landing";
import { cn } from "@/lib/utils";
import { CourseCard } from "./CourseCard";

type CoursesTabsProps = {
  categories: CategoryResponse[];
  courses: LandingCourse[];
};

export function CoursesTabs({ categories, courses }: CoursesTabsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || "all");
  const visibleCourses = useMemo(() => {
    if (activeCategoryId === "all") return courses;
    return courses.filter((course) => course.categoryId === activeCategoryId);
  }, [activeCategoryId, courses]);

  return (
    <>
      <div className="animate-fade-up mt-10 flex overflow-x-auto border-b border-[#C6CAD1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category, index) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id || category.name}
              type="button"
              onClick={() => setActiveCategoryId(category.id || "all")}
              className={cn(
                "min-w-[180px] flex-1 shrink-0 px-5 py-3 text-base transition",
                isActive
                  ? "border-b border-[#0066FF] bg-gradient-to-b from-transparent to-[#E6F0FF] font-medium text-[#0066FF]"
                  : "font-normal text-[#6C7787] hover:text-[#0066FF]",
              )}
              aria-pressed={isActive}
            >
              {category.name || `Category ${index + 1}`}
            </button>
          );
        })}
      </div>

      {visibleCourses.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCourses.slice(0, 8).map((course, index) => (
            <CourseCard key={`${course.id || course.title}-${index}`} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[18px] border border-[#E9EAF0] bg-white px-6 py-14 text-center">
          <h3 className="text-xl font-semibold text-[#1D2026]">No courses in this category yet</h3>
          <p className="mt-2 text-sm text-[#6E7485]">Try another category or browse all courses.</p>
        </div>
      )}
    </>
  );
}
