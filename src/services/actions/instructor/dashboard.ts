import { CourseApi, CourseStatisticsApi } from "@/services/api/course-api";
import { StatisticsApi } from "@/services/api/enrollment-api";

export async function getInstructorDashboardData(params: {
  groupBy?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [courseStatsRes, enrollmentStatsRes, recentCoursesRes] = await Promise.all([
    CourseStatisticsApi.getInstructorOverview(params).catch((err) => {
      console.error("Failed to fetch instructor course statistics:", err);
      return { data: undefined };
    }),
    StatisticsApi.getInstructorOverview(params).catch((err) => {
      console.error("Failed to fetch instructor enrollment statistics:", err);
      return { data: undefined };
    }),
    CourseApi.getMyCourses({ size: 5, sort: '{"updatedAt":"DESC"}' }).catch((err) => {
      console.error("Failed to fetch recent courses:", err);
      return { data: [], meta: { totalElements: 0, totalPages: 1 } };
    }),
  ]);

  return {
    courseStats: courseStatsRes?.data,
    enrollmentStats: enrollmentStatsRes?.data,
    recentCourses: recentCoursesRes?.data || [],
  };
}
