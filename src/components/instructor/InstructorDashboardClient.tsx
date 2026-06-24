"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import type {
  CourseResponse,
  InstructorCourseStatisticsOverviewResponse,
  InstructorStatisticsResponse,
} from "@/types";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { DataTable, DataTableEmptyState } from "@/components/ui/shared";
import { getDashboardColumns } from "./dashboard/dashboard-columns";
import { DashboardChart } from "./dashboard/DashboardChart";
import { formatMoney } from "@/lib/format";

// Import subcomponents
import { DashboardOverviewCards } from "./dashboard/DashboardOverviewCards";
import { DashboardFilterToolbar } from "./dashboard/DashboardFilterToolbar";
import { DashboardRangeCards } from "./dashboard/DashboardRangeCards";
import { DashboardTopRankings } from "./dashboard/DashboardTopRankings";

interface InstructorDashboardClientProps {
  initialData: {
    courseStats?: InstructorCourseStatisticsOverviewResponse;
    enrollmentStats?: InstructorStatisticsResponse;
    recentCourses: CourseResponse[];
  };
  groupBy: string;
  durationOption?: string;
  startDate?: string;
  endDate?: string;
}

export function InstructorDashboardClient({
  initialData,
  groupBy: initialGroupBy,
  durationOption: initialDurationOption,
  startDate: initialStartDate,
  endDate: initialEndDate,
}: InstructorDashboardClientProps) {
  const router = useRouter();

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Local state for filters
  const [groupBy, setGroupBy] = useState<"MONTH" | "DAY">(initialGroupBy as "MONTH" | "DAY");
  const [durationOption, setDurationOption] = useState<string>(
    initialDurationOption || (initialGroupBy === "MONTH" ? "12" : "30")
  );

  // Custom month states
  const [startMonth, setStartMonth] = useState(() => {
    if (initialStartDate) {
      const [year, month] = initialStartDate.split("-");
      return `${year}-${month}`;
    }
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${month}`;
  });

  const [endMonth, setEndMonth] = useState(() => {
    if (initialEndDate) {
      const [year, month] = initialEndDate.split("-");
      return `${year}-${month}`;
    }
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${today.getFullYear()}-${month}`;
  });

  // Custom date states
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(() => {
    if (initialStartDate) return parseLocalDate(initialStartDate);
    const d = new Date();
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(() => {
    if (initialEndDate) return parseLocalDate(initialEndDate);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Sync state with props when query parameters change
  React.useEffect(() => {
    if (initialStartDate) {
      setCustomStartDate(parseLocalDate(initialStartDate));
      const [year, month] = initialStartDate.split("-");
      setStartMonth(`${year}-${month}`);
    }
  }, [initialStartDate]);

  React.useEffect(() => {
    if (initialEndDate) {
      setCustomEndDate(parseLocalDate(initialEndDate));
      const [year, month] = initialEndDate.split("-");
      setEndMonth(`${year}-${month}`);
    }
  }, [initialEndDate]);

  React.useEffect(() => {
    setGroupBy(initialGroupBy as "MONTH" | "DAY");
    setDurationOption(initialDurationOption || (initialGroupBy === "MONTH" ? "12" : "30"));
  }, [initialGroupBy, initialDurationOption]);

  const { courseStats, enrollmentStats, recentCourses } = initialData;

  const activeChartData = useMemo(() => {
    const rawData = enrollmentStats?.enrollmentsByTime || [];
    return rawData.map((item) => ({
      label: item.label || "N/A",
      value: item.enrollmentCount ?? 0,
    }));
  }, [enrollmentStats]);

  const activeRevenueChartData = useMemo(() => {
    const rawData = enrollmentStats?.revenueByTime || [];
    return rawData.map((item) => ({
      label: item.timeLabel || "N/A",
      value: item.grossRevenue ?? 0,
    }));
  }, [enrollmentStats]);

  const formatYAxisRevenue = (val: number) => {
    if (val === 0) return "0 ₫";
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")} tr`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1).replace(/\.0$/, "")} k`;
    }
    return `${val} ₫`;
  };

  const formatTooltipRevenue = (val: number) => {
    return formatMoney(val);
  };

  const activeCoursesCreatedData = useMemo(() => {
    const rawData = courseStats?.createdCoursesByTime || [];
    return rawData.map((item) => ({
      label: item.label || "N/A",
      value: item.value ?? 0,
    }));
  }, [courseStats]);

  // Dynamic disabledDays matchers
  const startDateDisabledDays = useMemo(() => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const matchers: any[] = [
      { before: twelveMonthsAgo },
      { after: today }
    ];

    if (customEndDate) {
      // Disable any dates after customEndDate
      matchers.push({ after: customEndDate });

      // Disable any dates before customEndDate - 29 days (max 30 days)
      const minStartDate = new Date(customEndDate);
      minStartDate.setDate(minStartDate.getDate() - 29);
      minStartDate.setHours(0, 0, 0, 0);
      matchers.push({ before: minStartDate });
    }

    return matchers;
  }, [customEndDate]);

  const endDateDisabledDays = useMemo(() => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const matchers: any[] = [
      { before: twelveMonthsAgo },
      { after: today }
    ];

    if (customStartDate) {
      // Disable any dates before customStartDate
      matchers.push({ before: customStartDate });

      // Disable any dates after customStartDate + 29 days (max 30 days)
      const maxEndDate = new Date(customStartDate);
      maxEndDate.setDate(maxEndDate.getDate() + 29);
      maxEndDate.setHours(23, 59, 59, 999);
      matchers.push({ after: maxEndDate });
    }

    return matchers;
  }, [customStartDate]);

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const executeFilterQuery = (
    mode: "MONTH" | "DAY",
    duration: string,
    start?: string,
    end?: string
  ) => {
    let url = `/instructor/dashboard?groupBy=${mode}&durationOption=${duration}`;
    if (duration === "custom" && start && end) {
      url += `&startDate=${start}&endDate=${end}`;
    }
    router.push(url);
  };

  const handleModeChange = (newMode: "MONTH" | "DAY") => {
    setGroupBy(newMode);
    const defaultOption = newMode === "MONTH" ? "12" : "30";
    setDurationOption(defaultOption);
    executeFilterQuery(newMode, defaultOption);
  };

  const handleDurationChange = (val: string) => {
    setDurationOption(val);

    if (val !== "custom") {
      executeFilterQuery(groupBy, val);
    } else {
      if (groupBy === "MONTH") {
        const startStr = `${startMonth}-01`;
        const endStr = calculateEndMonthDateStr(endMonth);
        executeFilterQuery("MONTH", "custom", startStr, endStr);
      } else {
        const start = customStartDate || new Date();
        const end = customEndDate || new Date();
        executeFilterQuery("DAY", "custom", formatLocalDate(start), formatLocalDate(end));
      }
    }
  };

  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mVal = String(d.getMonth() + 1).padStart(2, "0");
      const yVal = d.getFullYear();
      options.push({
        label: `Tháng ${mVal}/${yVal}`,
        value: `${yVal}-${mVal}`,
      });
    }
    return options;
  }, []);

  const calculateEndMonthDateStr = (yearMonthStr: string): string => {
    const [year, month] = yearMonthStr.split("-").map(Number);
    const lastDayObj = new Date(year, month, 0);
    const lastDay = String(lastDayObj.getDate()).padStart(2, "0");
    const monthStr = String(month).padStart(2, "0");
    return `${year}-${monthStr}-${lastDay}`;
  };

  const getMonthDiff = (startStr: string, endStr: string): number => {
    const [sYear, sMonth] = startStr.split("-").map(Number);
    const [eYear, eMonth] = endStr.split("-").map(Number);
    return (eYear - sYear) * 12 + (eMonth - sMonth);
  };

  const addMonthsStr = (yearMonthStr: string, monthsToAdd: number): string => {
    const [year, month] = yearMonthStr.split("-").map(Number);
    const date = new Date(year, month - 1 + monthsToAdd, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const handleStartMonthChange = (val: string) => {
    setStartMonth(val);
    let newEnd = endMonth;
    const diff = getMonthDiff(val, endMonth);
    if (diff > 11 || diff < 0) {
      newEnd = addMonthsStr(val, 11);
      const today = new Date();
      const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      if (newEnd > maxMonth) {
        newEnd = maxMonth;
      }
      setEndMonth(newEnd);
    }
    executeFilterQuery("MONTH", "custom", `${val}-01`, calculateEndMonthDateStr(newEnd));
  };

  const handleEndMonthChange = (val: string) => {
    setEndMonth(val);
    let newStart = startMonth;
    const diff = getMonthDiff(startMonth, val);
    if (diff > 11 || diff < 0) {
      newStart = addMonthsStr(val, -11);
      const today = new Date();
      const minMonthObj = new Date(today);
      minMonthObj.setMonth(minMonthObj.getMonth() - 11);
      const minMonth = `${minMonthObj.getFullYear()}-${String(minMonthObj.getMonth() + 1).padStart(2, "0")}`;
      if (newStart < minMonth) {
        newStart = minMonth;
      }
      setStartMonth(newStart);
    }
    executeFilterQuery("MONTH", "custom", `${newStart}-01`, calculateEndMonthDateStr(val));
  };

  const handleCustomStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setCustomStartDate(date);

    let newEnd = customEndDate;
    if (!newEnd) {
      newEnd = new Date(date);
      newEnd.setDate(newEnd.getDate() + 29);
      const today = new Date();
      if (newEnd > today) {
        newEnd = today;
      }
      setCustomEndDate(newEnd);
    } else {
      const diffTime = newEnd.getTime() - date.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 29 || diffDays < 0) {
        newEnd = new Date(date);
        newEnd.setDate(newEnd.getDate() + 29);
        const today = new Date();
        if (newEnd > today) {
          newEnd = today;
        }
        setCustomEndDate(newEnd);
      }
    }

    executeFilterQuery("DAY", "custom", formatLocalDate(date), formatLocalDate(newEnd));
  };

  const handleCustomEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setCustomEndDate(date);

    let newStart = customStartDate;
    if (!newStart) {
      newStart = new Date(date);
      newStart.setDate(newStart.getDate() - 29);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setHours(0, 0, 0, 0);
      if (newStart < twelveMonthsAgo) {
        newStart = twelveMonthsAgo;
      }
      setCustomStartDate(newStart);
    } else {
      const diffTime = date.getTime() - newStart.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 29 || diffDays < 0) {
        newStart = new Date(date);
        newStart.setDate(newStart.getDate() - 29);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setHours(0, 0, 0, 0);
        if (newStart < twelveMonthsAgo) {
          newStart = twelveMonthsAgo;
        }
        setCustomStartDate(newStart);
      }
    }

    executeFilterQuery("DAY", "custom", formatLocalDate(newStart), formatLocalDate(date));
  };

  const recentCourseColumns = useMemo(() => getDashboardColumns(), []);

  const durationOptions = groupBy === "MONTH"
    ? [
      { value: "3", label: "3 tháng gần đây" },
      { value: "6", label: "6 tháng gần đây" },
      { value: "12", label: "12 tháng gần đây" },
      { value: "custom", label: "Tùy chỉnh..." },
    ]
    : [
      { value: "7", label: "7 ngày gần đây" },
      { value: "14", label: "14 ngày gần đây" },
      { value: "30", label: "30 ngày gần đây" },
      { value: "custom", label: "Tùy chỉnh..." },
    ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* 4 Overview Statistics Cards */}
      <DashboardOverviewCards courseStats={courseStats} />

      {/* Global Filter Toolbar */}
      <DashboardFilterToolbar
        groupBy={groupBy}
        durationOption={durationOption}
        startMonth={startMonth}
        endMonth={endMonth}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        monthOptions={monthOptions}
        durationOptions={durationOptions}
        handleModeChange={handleModeChange}
        handleDurationChange={handleDurationChange}
        handleStartMonthChange={handleStartMonthChange}
        handleEndMonthChange={handleEndMonthChange}
        handleCustomStartDateChange={handleCustomStartDateChange}
        handleCustomEndDateChange={handleCustomEndDateChange}
        startDateDisabledDays={startDateDisabledDays}
        endDateDisabledDays={endDateDisabledDays}
      />

      {/* Dynamic Range Statistics Cards */}
      <DashboardRangeCards enrollmentStats={enrollmentStats} />

      {/* Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1: Revenue Chart (Full width) */}
        <div className="lg:col-span-2">
          <InstructorCard
            headerClassName="pb-5 border-b border-zinc-100/80"
            className="border-zinc-200/50 shadow-xs"
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-emerald-650" />
                <span>Doanh thu theo {groupBy === "MONTH" ? "tháng" : "ngày"}</span>
              </div>
            }
            subtitle="Tổng doanh thu của giảng viên trong khoảng thời gian đã chọn"
          >
            <div className="relative min-h-[300px] pt-4">
              <DashboardChart
                data={activeRevenueChartData}
                lineColor="#10B981"
                gradientId="chartGradientRevenue"
                yAxisFormatter={formatYAxisRevenue}
                tooltipFormatter={formatTooltipRevenue}
              />
            </div>
          </InstructorCard>
        </div>

        {/* Row 2: Column 1 - Enrollments */}
        <InstructorCard
          headerClassName="pb-5 border-b border-zinc-100/80"
          className="border-zinc-200/50 shadow-xs"
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary-600" />
              <span>Ghi danh theo {groupBy === "MONTH" ? "tháng" : "ngày"}</span>
            </div>
          }
          subtitle="Số lượng ghi danh mới của học viên"
        >
          <div className="relative min-h-[300px] pt-4">
            <DashboardChart
              data={activeChartData}
              valueSuffix="học viên"
              lineColor="#564FFD"
              gradientId="chartGradientEnrollments"
            />
          </div>
        </InstructorCard>

        {/* Row 2: Column 2 - Created Courses */}
        <InstructorCard
          headerClassName="pb-5 border-b border-zinc-100/80"
          className="border-zinc-200/50 shadow-xs"
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-violet-650" />
              <span>Khóa học mới theo {groupBy === "MONTH" ? "tháng" : "ngày"}</span>
            </div>
          }
          subtitle="Số lượng khóa học mới được tạo"
        >
          <div className="relative min-h-[300px] pt-4">
            <DashboardChart
              data={activeCoursesCreatedData}
              valueSuffix="khóa học"
              lineColor="#8B5CF6"
              gradientId="chartGradientCourses"
            />
          </div>
        </InstructorCard>
      </section>

      {/* Top Rankings Lists */}
      <DashboardTopRankings enrollmentStats={enrollmentStats} />

      {/* Recent Courses List Table */}
      <InstructorCard
        title="Khóa học gần đây"
        subtitle="Các khóa học được cập nhật mới nhất"
        className="border-zinc-200/50 shadow-xs"
        headerAction={
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-750 transition cursor-pointer"
          >
            Tất cả khóa học
            <ChevronRight className="size-4" />
          </Link>
        }
      >
        {recentCourses.length === 0 ? (
          <DataTableEmptyState
            icon={BookOpen}
            title="Bạn chưa tạo khóa học nào"
            description="Khóa học mới cập nhật sẽ xuất hiện tại đây."
          />
        ) : (
          <DataTable
            columns={recentCourseColumns}
            data={recentCourses}
            minWidth={700}
            className="-mx-6 -my-6 border-zinc-150"
          />
        )}
      </InstructorCard>
    </div>
  );
}
