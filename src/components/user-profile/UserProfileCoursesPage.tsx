import { CoursesFooter } from "@/components/courses/CoursesFooter";
import type { UserProfileCoursesData } from "@/data/user-profile";
import { UserProfileCourseCard } from "./UserProfileCourseCard";
import { UserProfileCourseFilters } from "./UserProfileCourseFilters";
import { UserProfileCoursesPagination } from "./UserProfileCoursesPagination";
import { UserProfileHero } from "./UserProfileHero";
import { UserProfileTopNav } from "./UserProfileTopNav";

export function UserProfileCoursesPage({ coursesPage }: { coursesPage: UserProfileCoursesData }) {
  return (
    <main className="min-h-screen bg-white">
      <UserProfileTopNav avatar={coursesPage.user.avatar} />
      <UserProfileHero dashboard={coursesPage} />

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
              Courses <span className="font-normal">({coursesPage.totalCourses})</span>
            </h2>
          </div>

          <div className="mt-6">
            <UserProfileCourseFilters filters={coursesPage.filters} courses={coursesPage.courses} />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {coursesPage.courses.map((course) => (
              <UserProfileCourseCard key={course.id} course={course} />
            ))}
          </div>

          <UserProfileCoursesPagination currentPage={coursesPage.currentPage} totalPages={coursesPage.totalPages} filters={coursesPage.filters} />
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
