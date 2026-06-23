import { CourseApi } from "@/services/api/course-api";

export interface InstructorCoursesFilters {
  page: number;
  size: number;
  query?: string;
  sort?: string;
  rating?: number;
  categoryId?: string;
  status?: string;
}

export async function getInstructorCourses(params: {
  page?: number;
  size?: number;
  query?: string;
  sort?: string;
  status?: string;
  publishStatus?: string;
  categoryId?: string;
}) {
  try {
    return await CourseApi.getMyCourses(params);
  } catch (err) {
    console.error("Failed to fetch instructor courses:", err);
    return { data: [], meta: { totalElements: 0, totalPages: 1 } };
  }
}

export async function getInstructorCoursesData(filters: InstructorCoursesFilters) {
  try {
    return await CourseApi.getMyCourses({
      page: filters.page,
      size: filters.size,
      query: filters.query,
      sort: filters.sort,
      rating: filters.rating,
      categoryId: filters.categoryId,
      status: filters.status,
    });
  } catch (err) {
    console.error("Failed to fetch instructor courses data for route:", err);
    return { data: [], meta: { totalElements: 0, totalPages: 1 } };
  }
}
