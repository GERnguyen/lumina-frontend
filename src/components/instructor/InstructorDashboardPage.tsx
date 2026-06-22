"use client";

import {
  InstructorCourseOverviewPanel,
  InstructorRevenuePanel,
} from "@/components/instructor/InstructorCharts";
import {
  InstructorFooter,
  InstructorProfileBanner,
  InstructorTopCoursesPanel,
} from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorStatCard } from "@/components/instructor/InstructorStatCard";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import type { InstructorDashboardData } from "@/services/instructor-dashboard-service";

type InstructorDashboardPageProps = {
  data: InstructorDashboardData;
};

export function InstructorDashboardPage({ data }: InstructorDashboardPageProps) {
  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="dashboard" />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={data.user} />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-10">
            <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {data.stats.map((stat) => (
                <InstructorStatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <InstructorProfileBanner data={data} />

            <section className="grid gap-6 xl:grid-cols-3">
              <InstructorRevenuePanel series={data.revenueSeries} />
              <InstructorTopCoursesPanel courses={data.topCourses} />
            </section>

            <section className="grid gap-6">
              <InstructorCourseOverviewPanel series={data.courseSeries} />
            </section>

            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
