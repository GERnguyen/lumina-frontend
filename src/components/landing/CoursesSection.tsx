import { ArrowRight, Code2 } from "lucide-react";
import { courseTabs, type LandingCourse } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CourseCard } from "./CourseCard";
import type { CourseResponse } from "@/types";
import { CourseService } from "@/services";
import { money, compactNumber } from "@/lib/format";

function firstImage(course: CourseResponse) {
  return course.images?.[0]?.imageUrl || "/landing/figma/course-1.png";
}

function mapCourseToLandingCourse(course: CourseResponse): LandingCourse {
  return {
    id: course.id,
    title: course.title || "Untitled course",
    category: course.category?.name || "Software Dev",
    price: money(course.discountedPrice ?? course.price),
    image: firstImage(course),
    students: compactNumber(course.enrollmentCount),
    rating: typeof course.rating === "number" ? course.rating.toFixed(1) : "5.0",
    href: course.id ? `/courses/${course.id}` : "/courses",
    icon: Code2,
  };
}

async function getLandingCourses(): Promise<LandingCourse[]> {
  try {
    const payload = await CourseService.getAllCourses({ page: 1, size: 8 });
    return payload.data?.map(mapCourseToLandingCourse).filter((course) => course.title) || [];
  } catch {
    return [];
  }
}

export async function CoursesSection() {
  const courses = await getLandingCourses();

  return (
    <section id="courses" className="bg-[#FAFAFA] px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader
          title="Discover our Courses"
          description="Find software development courses from Lumina and build the skills for your next step."
        />

        <div className="animate-fade-up mt-10 flex overflow-x-auto border-b border-[#C6CAD1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {courseTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={
                index === 0
                  ? "min-w-[180px] flex-1 shrink-0 border-b border-[#0066FF] bg-gradient-to-b from-transparent to-[#E6F0FF] px-5 py-3 text-base font-medium text-[#0066FF]"
                  : "min-w-[180px] flex-1 shrink-0 px-5 py-3 text-base font-normal text-[#6C7787] transition hover:text-[#0066FF]"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {courses.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, index) => (
              <CourseCard key={`${course.id || course.title}-${index}`} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-[#E9EAF0] bg-white px-6 py-14 text-center">
            <h3 className="text-xl font-semibold text-[#1D2026]">No courses available</h3>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <LandingButton href="/courses" rightIcon={<ArrowRight className="size-4" />}>
            Browse all courses
          </LandingButton>
        </div>
      </div>
    </section>
  );
}
