import { CourseApi, CategoryApi } from "@/services/api/course-api";
import { CourseListingCard } from "./CourseListingCard";
import { CoursesActionBar } from "./CoursesActionBar";
import { CoursesFilterSidebar } from "./CoursesFilterSidebar";
import { CoursesFooter } from "./CoursesFooter";
import { CoursesPagination } from "./CoursesPagination";
import { CoursesTopNav } from "./CoursesTopNav";
import { getServerAccessToken } from "@/lib/server-auth";
import { EnrollmentApi } from "@/services/api/enrollment-api";

export type CourseCatalogFilters = {
  page?: number;
  size?: number;
  query?: string;
  sort?: string;
  rating?: number;
  priceFrom?: number;
  priceTo?: number;
  categoryId?: string;
  excludeEnrolled?: boolean;
};

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
    if (next.excludeEnrolled) params.set("excludeEnrolled", "true");

    const query = params.toString();
    return query ? `/courses?${query}` : "/courses";
  };
}

export async function CoursesPage({ filters }: CoursesPageProps) {
  const token = await getServerAccessToken().catch(() => undefined);
  const enrolledRes = token
    ? await EnrollmentApi.getEnrolledCourses({ page: 1, size: 100 }).catch(() => ({ data: [] }))
    : { data: [] };
  const enrolledIds = new Set((enrolledRes.data || []).map((c) => c.id).filter(Boolean));

  const [catalogRes, categoriesRes] = await Promise.all([
    CourseApi.getAllCourses(filters).catch(() => ({ data: [], meta: { page: filters.page || 1, totalElements: 0, totalPages: 1 } })),
    CategoryApi.getAllCategories().catch(() => ({ data: [] })),
  ]);

  let courses = catalogRes.data || [];
  if (token && filters.excludeEnrolled) {
    courses = courses.filter((course) => course.id && !enrolledIds.has(course.id));
  }

  const categories = (categoriesRes.data || []).map((cat) => ({
    id: cat.id || "",
    label: cat.name || "Untitled",
  })).filter((cat) => cat.id && cat.label);

  const currentPage = catalogRes.meta?.page || filters.page || 1;
  const totalPages = Math.max(1, catalogRes.meta?.totalPages || 1);
  const totalElements = token && filters.excludeEnrolled 
    ? courses.length 
    : (catalogRes.meta?.totalElements || courses.length);
  const queryString = queryStringFromFilters(filters);

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 pb-10 pt-10 sm:px-8">
        <CoursesActionBar filters={filters} totalElements={totalElements} queryString={queryString} />
        <div className="flex gap-6">
          <CoursesFilterSidebar categories={categories} filters={filters} queryString={queryString} isAuthenticated={Boolean(token)} />
          <div className="flex flex-1 flex-col gap-10">
            {courses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course, index) => (
                  <CourseListingCard key={`${course.id || course.title}-${index}`} course={course} index={index} />
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
