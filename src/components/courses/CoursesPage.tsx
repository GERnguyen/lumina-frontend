import type { CourseCatalogFilters, CourseCategoryFilter, CourseResponse, CategoryResponse } from "@/types";
import { CourseService, CategoryService } from "@/services/courseService";
import { CourseListingCard } from "./CourseListingCard";
import { CoursesActionBar } from "./CoursesActionBar";
import { CoursesFilterSidebar } from "./CoursesFilterSidebar";
import { CoursesFooter } from "./CoursesFooter";
import { CoursesPagination } from "./CoursesPagination";
import { CoursesTopNav } from "./CoursesTopNav";
import { money, compactNumber, formatDuration } from "@/lib/format";

function firstImage(course: CourseResponse) {
  return course.images?.[0]?.imageUrl || "/courses/course-01.png";
}

function mapCourseResponseToCatalogItem(course: CourseResponse) {
  const image = firstImage(course);
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
    badgeTone: "purple" as const,
    href: course.id ? `/courses/${course.id}` : "/courses",
  };
}

async function getCourseCatalog(filters: CourseCatalogFilters) {
  try {
    const payload = await CourseService.getAllCourses(filters);
    if (!payload?.data) {
      return {
        courses: [],
        meta: { page: filters.page || 1, limit: filters.size || 9, totalElements: 0, totalPages: 1 },
      };
    }

    return {
      courses: payload.data.map(mapCourseResponseToCatalogItem),
      meta: payload.meta || {
        page: filters.page,
        limit: filters.size,
        totalElements: payload.data.length,
        totalPages: 1,
      },
    };
  } catch {
    return {
      courses: [],
      meta: { page: filters.page || 1, limit: filters.size || 9, totalElements: 0, totalPages: 1 },
    };
  }
}

async function getCourseCategories(): Promise<CourseCategoryFilter[]> {
  try {
    const payload = await CategoryService.getAllCategories();
    return payload?.data?.map((category: CategoryResponse) => ({
      id: category.id || "",
      label: category.name || "Untitled",
      count: "Live",
    })).filter((category) => category.id && category.label) || [];
  } catch {
    return [];
  }
}

type CoursesPageProps = {
  filters: CourseCatalogFilters;
};

function queryStringFromFilters(filters: CourseCatalogFilters) {
  return (updates: Partial<CourseCatalogFilters>) => {
    const next = { ...filters, ...updates };
    const params = new URLSearchParams();

    if (next.page && next.page > 1) params.set("page", String(next.page));
    if (next.size && next.size !== 9) params.set("size", String(next.size));
    if (next.query) params.set("query", next.query);
    if (next.sort) params.set("sort", next.sort);
    if (next.rating) params.set("rating", String(next.rating));
    if (next.priceFrom !== undefined) params.set("priceFrom", String(next.priceFrom));
    if (next.priceTo !== undefined) params.set("priceTo", String(next.priceTo));
    if (next.categoryId) params.set("categoryId", next.categoryId);

    const query = params.toString();
    return query ? `/courses?${query}` : "/courses";
  };
}

export async function CoursesPage({ filters }: CoursesPageProps) {
  const [catalog, categories] = await Promise.all([
    getCourseCatalog(filters),
    getCourseCategories(),
  ]);
  const currentPage = catalog.meta.page || filters.page || 1;
  const totalPages = Math.max(1, catalog.meta.totalPages || 1);
  const totalElements = catalog.meta.totalElements || catalog.courses.length;
  const queryString = queryStringFromFilters(filters);

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 pb-10 pt-10 sm:px-8">
        <CoursesActionBar filters={filters} totalElements={totalElements} queryString={queryString} />
        <div className="flex gap-6">
          <CoursesFilterSidebar categories={categories} filters={filters} queryString={queryString} />
          <div className="flex flex-1 flex-col gap-10">
            {catalog.courses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {catalog.courses.map((course, index) => (
                  <CourseListingCard key={`${course.id || course.title}-${index}`} course={course} />
                ))}
              </div>
            ) : (
              <div className="border border-[#E9EAF0] bg-[#F5F7FA] px-6 py-14 text-center">
                <h2 className="text-2xl font-semibold text-[#1D2026]">No courses found</h2>
                <p className="mt-2 text-sm text-[#6E7485]">Try changing your search, category, rating, or price range.</p>
              </div>
            )}
            <CoursesPagination currentPage={currentPage} totalPages={totalPages} queryString={(page) => queryString({ page })} />
          </div>
        </div>
      </section>
      <CoursesFooter />
    </main>
  );
}
