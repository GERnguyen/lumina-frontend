"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { InstructorCourseCard } from "@/components/instructor/InstructorCourseCard";
import { InstructorCoursesFilters } from "@/components/instructor/InstructorCoursesFilters";
import { InstructorCoursesPagination } from "@/components/instructor/InstructorCoursesPagination";
import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import type { InstructorCoursesData, InstructorCoursesFilters as Filters } from "@/services/instructor-courses-service";

type InstructorCoursesPageProps = {
  data: InstructorCoursesData;
  filters: Filters;
};

export function InstructorCoursesPage({ data, filters }: InstructorCoursesPageProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="courses" />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={data.user} title="My Courses" />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-8 px-5 py-8 sm:px-8 2xl:px-40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <InstructorCoursesFilters filters={filters} categories={data.categories} />
              <Link
                href="/instructor/courses/new"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA]"
              >
                <PlusCircle className="size-5" />
                New Course
              </Link>
            </div>

            {data.courses.length ? (
              <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {data.courses.map((course) => (
                  <InstructorCourseCard key={course.id} course={course} />
                ))}
              </section>
            ) : (
              <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] bg-white px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
                  <PlusCircle className="size-8" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#1D2026]">No courses found</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#6E7485]">
                  Try another search or create a new course for your Lumina learners.
                </p>
              </section>
            )}

            <InstructorCoursesPagination meta={data.meta} filters={filters} />
            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
