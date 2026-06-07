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
  students: string;
  instructor?: string;
  duration?: string;
  badgeTone: "purple" | "orange" | "blue" | "green";
  href: string;
};

export type CourseCategoryFilter = {
  id: string;
  label: string;
  count: string;
  isMock?: boolean;
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

const mockCategories: CourseCategoryFilter[] = [
  { id: SOFTWARE_DEV_CATEGORY_ID, label: "Software Dev", count: "Live" },
  { id: "mock-ux-ui", label: "UX / UI Design", count: "Mock", isMock: true },
  { id: "mock-data-science", label: "Data Science", count: "Mock", isMock: true },
  { id: "mock-business", label: "Business", count: "Mock", isMock: true },
  { id: "mock-marketing", label: "Marketing", count: "Mock", isMock: true },
  { id: "mock-design", label: "Design", count: "Mock", isMock: true },
];

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

function fallbackCourses(filters: CourseCatalogFilters): CourseCatalogResult {
  const page = filters.page || 1;
  const size = filters.size || 9;
  const query = filters.query?.trim().toLowerCase();
  const rating = filters.rating;
  const from = filters.priceFrom;
  const to = filters.priceTo;

  const filtered = courseListingItems
    .filter((course) => (!query ? true : course.title.toLowerCase().includes(query) || course.category.toLowerCase().includes(query)))
    .filter((course) => (!rating ? true : Number(course.rating) >= rating))
    .filter((course) => {
      const price = Number(course.price.replace(/[^0-9.]/g, ""));
      if (from !== undefined && price < from) return false;
      if (to !== undefined && price > to) return false;
      return true;
    });

  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size).map((course, index) => ({
    ...course,
    id: undefined,
    href: "/courses/complete-website-responsive-design",
    instructor: ["Dianne Russell", "Kristin Watson", "Vako Shvili"][index % 3],
  }));

  return {
    courses: items,
    meta: {
      page,
      limit: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    },
    isFallback: true,
  };
}

export function mapCourseResponseToCatalogItem(course: CourseResponse, index: number): CourseCatalogItem {
  const image = course.images?.[0]?.imageUrl || courseListingItems[index % courseListingItems.length]?.image || "/courses/course-01.png";
  const category = course.category?.name || "Software Dev";
  const discounted = course.discountedPrice ?? course.price;
  const original = course.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;

  return {
    id: course.id,
    title: course.title || "Untitled course",
    image,
    category,
    price: money(discounted),
    originalPrice: original,
    rating: typeof course.rating === "number" ? course.rating.toFixed(1) : "0.0",
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

  if (!payload?.data) return fallbackCourses(normalized);

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
    count: "Live",
  })).filter((category) => category.id && category.label);

  if (!categories?.length) return mockCategories;

  const hasSoftwareDev = categories.some((category) => category.id === SOFTWARE_DEV_CATEGORY_ID);
  return hasSoftwareDev ? [...categories, ...mockCategories.filter((item) => item.isMock)] : [...categories, ...mockCategories];
}
