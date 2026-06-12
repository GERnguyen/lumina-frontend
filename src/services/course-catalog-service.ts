import type { CategoryResponse, CourseResponse, PaginatedMetadata } from "@/api/generated/course";
import { courseListingItems } from "@/data/courses";
import { API_BASE_URL } from "@/lib/api-base";

export type CourseCatalogFilters = {
  page?: number;
  size?: number;
  query?: string;
  sort?: string;
  rating?: number;
  priceFrom?: number;
  priceTo?: number;
  categoryId?: string;
};

export type CourseCatalogItem = {
  id?: string;
  title: string;
  image: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating: string;
  ratingValue?: number;
  students: string;
  instructor?: string;
  duration?: string;
  badgeTone: "purple" | "orange" | "blue" | "green";
  href: string;
};

export type CourseCategoryFilter = {
  id: string;
  label: string;
  count?: string;
};

export type CourseCatalogResult = {
  courses: CourseCatalogItem[];
  meta: PaginatedMetadata;
  isFallback: boolean;
};

type CourseListPayload = {
  data?: CourseResponse[];
  meta?: PaginatedMetadata;
};

type CategoryListPayload = {
  data?: CategoryResponse[];
};

export const SOFTWARE_DEV_CATEGORY_ID = "2fc96189-324b-4664-98b1-6c05decd3213";

function apiUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && !Number.isNaN(value)) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function fetchJson<T>(url: URL): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return undefined;
    if (!(response.headers.get("content-type") || "").includes("application/json")) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function money(value?: number) {
  if (typeof value !== "number") return "Free";
  if (value === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDuration(minutes?: number) {
  if (!minutes) return undefined;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function emptyCourses(filters: CourseCatalogFilters): CourseCatalogResult {
  const page = filters.page || 1;
  const size = filters.size || 9;

  return {
    courses: [],
    meta: {
      page,
      limit: size,
      totalElements: 0,
      totalPages: 1,
    },
    isFallback: false,
  };
}

export function mapCourseResponseToCatalogItem(course: CourseResponse, index: number): CourseCatalogItem {
  const image = course.images?.[0]?.imageUrl || courseListingItems[index % courseListingItems.length]?.image || "/courses/course-01.png";
  const category = course.category?.name || "Software Dev";
  const discounted = course.discountedPrice ?? course.price;
  const original = course.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;
  const ratingValue = typeof course.rating === "number" && course.rating > 0 ? course.rating : undefined;

  return {
    id: course.id,
    title: course.title || "Untitled course",
    image,
    category,
    price: money(discounted),
    originalPrice: original,
    rating: ratingValue ? ratingValue.toFixed(1) : "No reviews yet",
    ratingValue,
    students: compactNumber(course.enrollmentCount),
    instructor: course.instructor?.name,
    duration: formatDuration(course.duration),
    badgeTone: "purple",
    href: course.id ? `/courses/${course.id}` : "/courses",
  };
}

export async function getCourseCatalog(filters: CourseCatalogFilters): Promise<CourseCatalogResult> {
  const normalized = {
    ...filters,
    page: filters.page || 1,
    size: filters.size || 9,
  };

  const payload = await fetchJson<CourseListPayload>(
    apiUrl("/api/v1/courses", {
      page: normalized.page,
      size: normalized.size,
      query: normalized.query,
      sort: normalized.sort,
      rating: normalized.rating,
      priceFrom: normalized.priceFrom,
      priceTo: normalized.priceTo,
      categoryId: normalized.categoryId,
    }),
  );

  if (!payload?.data) return emptyCourses(normalized);

  return {
    courses: payload.data.map(mapCourseResponseToCatalogItem),
    meta: payload.meta || {
      page: normalized.page,
      limit: normalized.size,
      totalElements: payload.data.length,
      totalPages: 1,
    },
    isFallback: false,
  };
}

export async function getCourseCategories(): Promise<CourseCategoryFilter[]> {
  const payload = await fetchJson<CategoryListPayload>(apiUrl("/api/v1/categories"));
  const categories = payload?.data?.map((category) => ({
    id: category.id || "",
    label: category.name || "Untitled",
  })).filter((category) => category.id && category.label);

  return categories || [];
}
