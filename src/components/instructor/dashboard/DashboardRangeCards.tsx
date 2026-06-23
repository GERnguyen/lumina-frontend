"use client";

import React from "react";
import { DollarSign, Users } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { InstructorStatisticsResponse } from "@/types";

interface DashboardRangeCardsProps {
  enrollmentStats?: InstructorStatisticsResponse;
}

export function DashboardRangeCards({ enrollmentStats }: DashboardRangeCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-start justify-between rounded-xl border border-zinc-200/60 bg-white p-5 shadow-xs select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 font-semibold">Doanh thu thô (Gross)</p>
          <p className="text-2xl font-extrabold tracking-tight text-emerald-700 font-general pt-1">
            {formatMoney(enrollmentStats?.totalGrossRevenue)}
          </p>
          <p className="text-xs text-zinc-400 font-medium pt-0.5">Trong khoảng thời gian</p>
        </div>
        <div className="rounded-lg p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600">
          <DollarSign className="size-5 shrink-0" />
        </div>
      </div>

      <div className="flex items-start justify-between rounded-xl border border-zinc-200/60 bg-white p-5 shadow-xs select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 font-semibold">Doanh thu thực (Net)</p>
          <p className="text-2xl font-extrabold tracking-tight text-emerald-700 font-general pt-1">
            {formatMoney(enrollmentStats?.totalNetRevenue)}
          </p>
          <p className="text-xs text-zinc-400 font-medium pt-0.5">Sau chiết khấu & phí nền tảng</p>
        </div>
        <div className="rounded-lg p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600">
          <DollarSign className="size-5 shrink-0" />
        </div>
      </div>

      <div className="flex items-start justify-between rounded-xl border border-zinc-200/60 bg-white p-5 shadow-xs select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 font-semibold">Ghi danh mới</p>
          <p className="text-2xl font-extrabold tracking-tight text-primary-700 font-general pt-1">
            {(enrollmentStats?.enrollmentsInRange ?? 0).toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-zinc-400 font-medium pt-0.5">Lượt đăng ký khóa học</p>
        </div>
        <div className="rounded-lg p-2.5 bg-primary-50 border border-primary-100 text-primary-600">
          <Users className="size-5 shrink-0" />
        </div>
      </div>

      <div className="flex items-start justify-between rounded-xl border border-zinc-200/60 bg-white p-5 shadow-xs select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 font-semibold">Học viên mới</p>
          <p className="text-2xl font-extrabold tracking-tight text-blue-750 font-general pt-1">
            {(enrollmentStats?.distinctLearnersInRange ?? 0).toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-zinc-400 font-medium pt-0.5">Học viên khác biệt</p>
        </div>
        <div className="rounded-lg p-2.5 bg-blue-50 border border-blue-100 text-blue-600">
          <Users className="size-5 shrink-0" />
        </div>
      </div>
    </section>
  );
}
