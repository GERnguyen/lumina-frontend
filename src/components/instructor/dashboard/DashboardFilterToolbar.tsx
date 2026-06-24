"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Select, DatePicker } from "@/components/ui/shared";

interface DashboardFilterToolbarProps {
  groupBy: "MONTH" | "DAY";
  durationOption: string;
  startMonth: string;
  endMonth: string;
  customStartDate?: Date;
  customEndDate?: Date;
  monthOptions: { label: string; value: string }[];
  durationOptions: { label: string; value: string }[];
  handleModeChange: (newMode: "MONTH" | "DAY") => void;
  handleDurationChange: (val: string) => void;
  handleStartMonthChange: (val: string) => void;
  handleEndMonthChange: (val: string) => void;
  handleCustomStartDateChange: (date: Date | undefined) => void;
  handleCustomEndDateChange: (date: Date | undefined) => void;
  startDateDisabledDays: any;
  endDateDisabledDays: any;
}

export function DashboardFilterToolbar({
  groupBy,
  durationOption,
  startMonth,
  endMonth,
  customStartDate,
  customEndDate,
  monthOptions,
  durationOptions,
  handleModeChange,
  handleDurationChange,
  handleStartMonthChange,
  handleEndMonthChange,
  handleCustomStartDateChange,
  handleCustomEndDateChange,
  startDateDisabledDays,
  endDateDisabledDays,
}: DashboardFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200/70 bg-white p-4 shadow-sm select-none">
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-zinc-900 font-general">Bộ lọc thời gian</h3>
        <p className="text-xs text-zinc-400 font-medium">Xem thống kê báo cáo theo khoảng thời gian tùy chọn</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* MONTH / DAY Toggle */}
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => handleModeChange("MONTH")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
              groupBy === "MONTH"
                ? "bg-white text-zinc-950 border border-zinc-250/65 shadow-xs"
                : "text-zinc-500 hover:text-zinc-850"
            )}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("DAY")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
              groupBy === "DAY"
                ? "bg-white text-zinc-950 border border-zinc-250/65 shadow-xs"
                : "text-zinc-500 hover:text-zinc-855"
            )}
          >
            Theo ngày
          </button>
        </div>

        {/* Duration selector */}
        <Select
          value={durationOption}
          onValueChange={handleDurationChange}
          options={durationOptions}
          className="w-44"
          triggerClassName="h-9 text-xs font-bold rounded-lg border-zinc-200 bg-transparent text-zinc-850"
        />

        {/* Custom Month selector inline */}
        {durationOption === "custom" && groupBy === "MONTH" && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider">TỪ:</span>
            <Select
              value={startMonth}
              onValueChange={handleStartMonthChange}
              options={monthOptions}
              className="w-40"
              triggerClassName="h-9 text-xs font-bold rounded-lg border-zinc-200 bg-transparent text-zinc-855"
            />
            <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider">ĐẾN:</span>
            <Select
              value={endMonth}
              onValueChange={handleEndMonthChange}
              options={monthOptions}
              className="w-40"
              triggerClassName="h-9 text-xs font-bold rounded-lg border-zinc-200 bg-transparent text-zinc-855"
            />
          </div>
        )}

        {/* Custom Day DatePicker inline */}
        {durationOption === "custom" && groupBy === "DAY" && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider">TỪ:</span>
            <DatePicker
              value={customStartDate}
              onChange={handleCustomStartDateChange}
              disabledDays={startDateDisabledDays}
              className="w-40"
              triggerClassName="h-9 text-xs font-bold"
              placeholder="Chọn ngày"
            />
            <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider">ĐẾN:</span>
            <DatePicker
              value={customEndDate}
              onChange={handleCustomEndDateChange}
              disabledDays={endDateDisabledDays}
              className="w-40"
              triggerClassName="h-9 text-xs font-bold"
              placeholder="Chọn ngày"
            />
          </div>
        )}
      </div>
    </div>
  );
}
