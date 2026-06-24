import { getInstructorDashboardData } from "@/services/actions/instructor";
import { CourseApi } from "@/services/api/course-api";
import { InstructorDashboardClient } from "@/components/instructor/InstructorDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng quan giảng viên - Cinx",
  description: "Trang tổng quan thống kê khóa học và doanh thu dành cho giảng viên.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // Extract parameters
  let groupBy = (searchParams.groupBy as string) || "DAY";
  if (groupBy !== "MONTH" && groupBy !== "DAY") {
    groupBy = "DAY";
  }

  let durationOption = searchParams.durationOption as string | undefined;
  let startDate = searchParams.startDate as string | undefined;
  let endDate = searchParams.endDate as string | undefined;

  // Sync / default durationOption
  if (!durationOption && startDate && endDate) {
    durationOption = "custom";
  } else if (!durationOption) {
    durationOption = groupBy === "MONTH" ? "12" : "30";
  }

  // If durationOption is preset, recalculate start/end dates
  if (durationOption !== "custom") {
    const validDayPresets = ["7", "14", "30"];
    const validMonthPresets = ["3", "6", "12"];
    if (groupBy === "DAY" && !validDayPresets.includes(durationOption)) {
      durationOption = "30";
    } else if (groupBy === "MONTH" && !validMonthPresets.includes(durationOption)) {
      durationOption = "12";
    }

    const today = new Date();
    const start = new Date();
    if (groupBy === "DAY") {
      const daysToSubtract = parseInt(durationOption, 10);
      start.setDate(today.getDate() - (daysToSubtract - 1));
    } else {
      const monthsToSubtract = parseInt(durationOption, 10);
      start.setMonth(today.getMonth() - (monthsToSubtract - 1));
      start.setDate(1);
    }

    const formatLocalDate = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    startDate = formatLocalDate(start);
    endDate = formatLocalDate(today);
  } else {
    // Custom option
    // Validate custom dates, if one is missing, fall back to default preset
    if (!startDate || !endDate) {
      durationOption = groupBy === "MONTH" ? "12" : "30";
      const today = new Date();
      const start = new Date();
      if (groupBy === "DAY") {
        start.setDate(today.getDate() - 29);
      } else {
        start.setMonth(today.getMonth() - 11);
        start.setDate(1);
      }
      const formatLocalDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };
      startDate = formatLocalDate(start);
      endDate = formatLocalDate(today);
    }
  }

  // Fetch dashboard data
  const data = await getInstructorDashboardData({
    groupBy,
    startDate,
    endDate,
  });

  return (
    <InstructorDashboardClient
      initialData={data}
      groupBy={groupBy}
      durationOption={durationOption}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
