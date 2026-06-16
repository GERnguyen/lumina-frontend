import type { CourseListingItem } from "@/data/courses";
import type { PaginatedMetadata } from "@/types";

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

export type CourseCategoryFilter = {
  id: string;
  label: string;
  count?: string;
  isMock?: boolean;
};

export type CourseCatalogResult = {
  courses: CourseListingItem[];
  meta: PaginatedMetadata;
};
