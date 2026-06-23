"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import type { InstructorStatisticsResponse } from "@/types";

interface DashboardTopRankingsProps {
  enrollmentStats?: InstructorStatisticsResponse;
}

export function DashboardTopRankings({ enrollmentStats }: DashboardTopRankingsProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Courses by Revenue */}
      <InstructorCard
        title="Top khóa học theo doanh thu"
        subtitle="Các khóa học mang lại doanh thu cao nhất"
        className="border-zinc-200/50 shadow-xs"
      >
        <div className="divide-y divide-zinc-100 -mx-6 -my-6">
          {!enrollmentStats?.topCoursesByRevenue || enrollmentStats.topCoursesByRevenue.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Chưa có dữ liệu doanh thu
            </div>
          ) : (
            enrollmentStats.topCoursesByRevenue.map((item, idx) => (
              <div key={item.courseId || idx} className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50/50 transition">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold font-general",
                    idx === 0 ? "bg-amber-50 text-amber-700 border border-amber-200/50" :
                    idx === 1 ? "bg-zinc-100 text-zinc-700 border border-zinc-200/50" :
                    idx === 2 ? "bg-orange-50 text-orange-700 border border-orange-200/50" :
                    "text-zinc-450 bg-zinc-50"
                  )}>
                    {idx + 1}
                  </span>
                  <Link
                    href={`/instructor/courses/${item.courseId}`}
                    className="text-sm font-bold text-zinc-900 hover:text-primary-600 truncate transition-colors"
                    title={item.title}
                  >
                    {item.title || "Khóa học không tên"}
                  </Link>
                </div>
                <span className="text-sm font-extrabold text-zinc-950 font-general shrink-0 pl-4">
                  {formatMoney(item.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </InstructorCard>

      {/* Top Courses by Enrollment */}
      <InstructorCard
        title="Top khóa học theo lượt ghi danh"
        subtitle="Các khóa học được ghi danh nhiều nhất"
        className="border-zinc-200/50 shadow-xs"
      >
        <div className="divide-y divide-zinc-100 -mx-6 -my-6">
          {!enrollmentStats?.topCoursesByEnrollment || enrollmentStats.topCoursesByEnrollment.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Chưa có dữ liệu ghi danh
            </div>
          ) : (
            enrollmentStats.topCoursesByEnrollment.map((item, idx) => (
              <div key={item.courseId || idx} className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50/50 transition">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold font-general",
                    idx === 0 ? "bg-amber-50 text-amber-700 border border-amber-200/50" :
                    idx === 1 ? "bg-zinc-100 text-zinc-700 border border-zinc-200/50" :
                    idx === 2 ? "bg-orange-50 text-orange-700 border border-orange-200/50" :
                    "text-zinc-450 bg-zinc-50"
                  )}>
                    {idx + 1}
                  </span>
                  <Link
                    href={`/instructor/courses/${item.courseId}`}
                    className="text-sm font-bold text-zinc-900 hover:text-primary-600 truncate transition-colors"
                    title={item.title}
                  >
                    {item.title || "Khóa học không tên"}
                  </Link>
                </div>
                <span className="text-sm font-extrabold text-zinc-955 font-general shrink-0 pl-4">
                  {(item.enrollmentCount ?? 0).toLocaleString("vi-VN")} học viên
                </span>
              </div>
            ))
          )}
        </div>
      </InstructorCard>
    </section>
  );
}
