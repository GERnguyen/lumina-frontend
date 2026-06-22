"use client";

import { InstructorCourseOverviewChart, InstructorCourseRevenueChart } from "@/components/instructor/InstructorCourseDetailCharts";
import { InstructorCourseEngagementPanels } from "@/components/instructor/InstructorCourseEngagementPanels";
import {
  InstructorCourseBreadcrumb,
  InstructorCourseFacts,
  InstructorCourseHero,
  InstructorCourseRatingPanel,
} from "@/components/instructor/InstructorCourseDetailWidgets";
import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import type { InstructorCourseDetailData } from "@/services/instructor-course-detail-service";

export function InstructorCourseDetailPage({ data }: { data: InstructorCourseDetailData }) {
  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="courses" />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={data.user} title="My Courses" />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-40">
            <InstructorCourseBreadcrumb course={data.course} />
            <InstructorCourseHero course={data.course} />

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <InstructorCourseFacts facts={data.facts} />
              <InstructorCourseRatingPanel data={data} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[536px_1fr]">
              <InstructorCourseRevenueChart series={data.revenueSeries} />
              <InstructorCourseOverviewChart comments={data.overviewSeries.comments} views={data.overviewSeries.views} />
            </section>

            <InstructorCourseEngagementPanels courseId={data.course.id} />

            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
