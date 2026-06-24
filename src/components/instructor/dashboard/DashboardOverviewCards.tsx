"use client";

import React from "react";
import { BookOpen, CheckCircle, Users, Star } from "lucide-react";
import type { InstructorCourseStatisticsOverviewResponse } from "@/types";

interface DashboardOverviewCardsProps {
  courseStats?: InstructorCourseStatisticsOverviewResponse;
}

export function DashboardOverviewCards({ courseStats }: DashboardOverviewCardsProps) {
  const metrics = [
    {
      title: "Tổng khóa học",
      value: courseStats?.currentCourseCount ?? 0,
      trend: "tất cả trạng thái",
      icon: BookOpen,
      bg: "bg-primary-50 border-primary-100",
      iconColor: "text-primary-650",
    },
    {
      title: "Đã xuất bản",
      value: courseStats?.currentPublishedCourseCount ?? 0,
      trend: "đang hoạt động",
      icon: CheckCircle,
      bg: "bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-650",
    },
    {
      title: "Học viên",
      value: (courseStats?.currentEnrollmentSnapshot ?? 0).toLocaleString("vi-VN"),
      trend: "tổng ghi danh",
      icon: Users,
      bg: "bg-blue-50 border-blue-100",
      iconColor: "text-blue-650",
    },
    {
      title: "Đánh giá TB",
      value: courseStats?.averageRating ? courseStats.averageRating.toFixed(1) : "--",
      trend: "từ học viên",
      icon: Star,
      bg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-650",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="flex items-start justify-between rounded-xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md/5 select-none"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-450">{m.title}</p>
              <p className="text-3xl font-extrabold tracking-tight text-zinc-900 font-general pt-1">{m.value}</p>
              <p className="text-xs text-zinc-400 font-medium pt-1 capitalize">{m.trend}</p>
            </div>
            <div className={`rounded-xl p-3 border ${m.bg} ${m.iconColor}`}>
              <Icon className="size-6 shrink-0" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
