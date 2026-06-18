"use client";

import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import {
  InstructorEarningRangeTabs,
  InstructorEarningStatGrid,
  InstructorEarningTodayCard,
  InstructorEnrollmentTrendPanel,
  InstructorRevenueTrendPanel,
  InstructorTopEnrollmentCourses,
  InstructorTopRevenueCourses,
} from "@/components/instructor/InstructorEarningWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import type { InstructorEarningData } from "@/services/instructor-earning-service";

type InstructorEarningPageProps = {
  data: InstructorEarningData;
};

export function InstructorEarningPage({ data }: InstructorEarningPageProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="earning" />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={data.user} title="Earning" />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#6E7485]">Revenue analytics</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.24px] text-[#1D2026]">
                  Track course revenue without payout-only data
                </h2>
              </div>
              <InstructorEarningRangeTabs activeRange={data.activeRange} />
            </div>

            <InstructorEarningStatGrid summary={data.summary} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <InstructorRevenueTrendPanel series={data.revenueSeries} />
              <InstructorEarningTodayCard value={data.todayNetRevenue} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <InstructorEnrollmentTrendPanel series={data.enrollmentSeries} />
              <InstructorTopRevenueCourses courses={data.topRevenueCourses} />
            </section>

            <InstructorTopEnrollmentCourses courses={data.topEnrollmentCourses} />
            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
