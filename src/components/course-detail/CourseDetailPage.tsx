import type { CourseDetail } from "@/data/course-detail";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseDetailHeader } from "./CourseDetailHeader";
import { CourseDetailTabs } from "./CourseDetailTabs";
import { CourseHeroMedia } from "./CourseHeroMedia";
import { CourseInstructorSection } from "./CourseInstructorSection";
import { CourseOverview } from "./CourseOverview";
import { CoursePurchaseCard } from "./CoursePurchaseCard";
import { CourseReviews } from "./CourseReviews";

export function CourseDetailPage({ course, isFallback }: { course: CourseDetail; isFallback?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <CourseDetailHeader course={course} isFallback={isFallback} />

      <section className="px-6 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[minmax(0,872px)_424px] lg:items-start">
          <div className="space-y-10">
            <CourseHeroMedia course={course} />
            <CourseDetailTabs />
            <CourseOverview course={course} />
            <CourseCurriculum course={course} />
            <CourseInstructorSection course={course} />
            <CourseReviews course={course} />
          </div>

          <CoursePurchaseCard course={course} />
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
