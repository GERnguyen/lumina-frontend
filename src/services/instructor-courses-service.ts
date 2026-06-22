import "server-only";

import type { CategoryResponse, CourseResponse, PaginatedMetadata, UserDto } from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

type ApiPayload<T> = {
  data?: T;
  meta?: PaginatedMetadata;
};

export type InstructorCoursesFilters = {
  page: number;
  size: number;
  query?: string;
  sort?: string;
  rating?: number;
  categoryId?: string;
  status?: string;
};

export type InstructorCourseCardData = {
  id: string;
  title: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  students: number;
  status?: CourseResponse["status"];
  publishStatus?: CourseResponse["publishStatus"];
  statusLabel: string;
  statusTone: "published" | "draft" | "waiting" | "rejected" | "archived";
};

export type InstructorCoursesData = {
  user: {
    name: string;
    email?: string;
    avatar: string;
    role: UserDto["role"];
  };
  courses: InstructorCourseCardData[];
  categories: CategoryResponse[];
  meta: PaginatedMetadata;
};

const fallbackImages = [
  "/courses/course-01.png",
  "/courses/course-02.png",
  "/courses/course-03.png",
  "/courses/course-04.png",
  "/courses/course-05.png",
  "/courses/course-06.png",
  "/courses/course-07.png",
  "/courses/course-08.png",
  "/courses/course-09.png",
  "/courses/course-10.png",
  "/courses/course-11.png",
  "/courses/course-12.png",
];

function apiUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function fetchJson<T>(path: string, params?: Record<string, string | number | undefined>) {
  try {
    const response = await fetch(apiUrl(path, params), {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function avatarFor(user?: UserDto) {
  const avatar = user?.avatarUrl?.trim();
  if (avatar) {
    if (/^(https?:|data:|blob:)/.test(avatar) || avatar.startsWith("/")) return avatar;
    return new URL(avatar, API_BASE_URL).toString();
  }

  const params = new URLSearchParams({
    name: user?.name || "Lumina Instructor",
    background: "EBEBFF",
    color: "564FFD",
    bold: "true",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

function imageFor(course: CourseResponse, index: number) {
  const image = course.images?.[0]?.imageUrl?.trim();
  if (image) {
    if (/^(https?:|data:|blob:)/.test(image) || image.startsWith("/")) return image;
    return new URL(image, API_BASE_URL).toString();
  }
  return fallbackImages[index % fallbackImages.length];
}

function statusFor(course: CourseResponse): Pick<InstructorCourseCardData, "statusLabel" | "statusTone"> {
  if (course.publishStatus === "WAITING_APPROVAL") {
    return { statusLabel: "Pending review", statusTone: "waiting" };
  }
  if (course.publishStatus === "REJECTED") {
    return { statusLabel: "Rejected", statusTone: "rejected" };
  }
  if (course.status === "PUBLISHED" || course.publishStatus === "PUBLISHED") {
    return { statusLabel: "Published", statusTone: "published" };
  }
  if (course.status === "ARCHIVED") {
    return { statusLabel: "Archived", statusTone: "archived" };
  }
  return { statusLabel: "Draft", statusTone: "draft" };
}

function mapCourse(course: CourseResponse, index: number): InstructorCourseCardData {
  const discountedPrice = course.discountedPrice ?? course.price ?? 0;
  const originalPrice = course.discountedPrice !== undefined && course.price !== undefined && course.discountedPrice < course.price
    ? course.price
    : undefined;

  return {
    id: course.id || `${course.title}-${index}`,
    title: course.title || "Untitled Course",
    category: course.category?.name || "Development",
    image: imageFor(course, index),
    price: discountedPrice,
    originalPrice,
    rating: course.rating,
    students: course.enrollmentCount || 0,
    status: course.status,
    publishStatus: course.publishStatus,
    ...statusFor(course),
  };
}

function statusParams(status?: string) {
  switch (status) {
    case "published":
      return { status: "PUBLISHED", publishStatus: "PUBLISHED" };
    case "draft":
      return { status: "DRAFT", publishStatus: undefined };
    case "pending":
      return { status: undefined, publishStatus: "WAITING_APPROVAL" };
    case "rejected":
      return { status: undefined, publishStatus: "REJECTED" };
    case "archived":
      return { status: "ARCHIVED", publishStatus: undefined };
    default:
      return { status: undefined, publishStatus: undefined };
  }
}

export async function getInstructorCoursesData(filters: InstructorCoursesFilters): Promise<InstructorCoursesData> {
  const courseStatus = statusParams(filters.status);
  const [userPayload, coursesPayload, categoriesPayload] = await Promise.all([
    fetchJson<ApiPayload<UserDto>>("/api/v1/users/me"),
    fetchJson<ApiPayload<CourseResponse[]>>("/api/v1/courses/mine", {
      page: filters.page,
      size: filters.size,
      query: filters.query,
      sort: filters.sort,
      rating: filters.rating,
      categoryId: filters.categoryId,
      status: courseStatus.status,
      publishStatus: courseStatus.publishStatus,
    }),
    fetchJson<ApiPayload<CategoryResponse[]> | CategoryResponse[]>("/api/v1/categories"),
  ]);

  const user = userPayload?.data;
  const categories = Array.isArray(categoriesPayload) ? categoriesPayload : categoriesPayload?.data || [];
  const courses = (coursesPayload?.data || []).map(mapCourse);

  return {
    user: {
      name: user?.name || "Lumina Instructor",
      email: user?.email,
      avatar: avatarFor(user),
      role: user?.role,
    },
    courses,
    categories,
    meta: coursesPayload?.meta || {
      page: filters.page,
      limit: filters.size,
      totalElements: courses.length,
      totalPages: 1,
    },
  };
}
