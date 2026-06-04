import { courseListingItems } from "@/data/courses";
import { CourseListingCard } from "./CourseListingCard";
import { CoursesActionBar } from "./CoursesActionBar";
import { CoursesFilterSidebar } from "./CoursesFilterSidebar";
import { CoursesFooter } from "./CoursesFooter";
import { CoursesPagination } from "./CoursesPagination";
import { CoursesTopNav } from "./CoursesTopNav";

export function CoursesPage() {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 pb-10 pt-10 sm:px-8">
        <CoursesActionBar />
        <div className="flex gap-6">
          <CoursesFilterSidebar />
          <div className="flex flex-1 flex-col gap-10">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courseListingItems.map((course) => (
                <CourseListingCard key={`${course.title}-${course.image}`} course={course} />
              ))}
            </div>
            <CoursesPagination />
          </div>
        </div>
      </section>
      <CoursesFooter />
    </main>
  );
}
