import { ArrowRight } from "lucide-react";
import { courseTabs } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getLandingCourses } from "@/services/course-service";
import { CourseCard } from "./CourseCard";

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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, index) => (
            <CourseCard key={`${course.id || course.title}-${index}`} course={course} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <LandingButton href="/courses" rightIcon={<ArrowRight className="size-4" />}>
            Browse all courses
          </LandingButton>
        </div>
      </div>
    </section>
  );
}
