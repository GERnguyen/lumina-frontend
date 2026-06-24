import { ArrowRight } from "lucide-react";
import type { LandingCourse } from "@/data/landing";
import { LandingButton } from "@/components/ui/LandingButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { CategoryResponse, CourseResponse } from "@/types";
import { CategoryApi, CourseApi } from "@/services/api/course-api";
import { money, compactNumber } from "@/lib/format";
import { CoursesTabs } from "./CoursesTabs";

function firstImage(course: CourseResponse) {
  return course.images?.[0]?.imageUrl || "/landing/figma/course-1.png";
}

function mapCourseToLandingCourse(course: CourseResponse): LandingCourse {
  return {
    id: course.id,
    title: course.title || "Untitled course",
    categoryId: course.category?.id,
    category: course.category?.name || "Software Dev",
    price: money(course.discountedPrice ?? course.price),
    image: firstImage(course),
    students: compactNumber(course.enrollmentCount),
    rating: typeof course.rating === "number" ? course.rating.toFixed(1) : "5.0",
    href: course.id ? `/courses/${course.id}` : "/courses",
  };
}

async function getLandingCourses(): Promise<LandingCourse[]> {
  try {
    const payload = await CourseApi.getAllCourses({ page: 1, size: 24, sort: '{"rating":"DESC"}' });
    return payload.data?.map(mapCourseToLandingCourse).filter((course) => course.title) || [];
  } catch {
    return [];
  }
}

async function getLandingCategories(): Promise<CategoryResponse[]> {
  try {
    const payload = await CategoryApi.getAllCategories();
    return (payload.data || []).filter((category) => category.name).slice(0, 6);
  } catch {
    return [];
  }
}

export async function CoursesSection() {
  const [courses, categories] = await Promise.all([getLandingCourses(), getLandingCategories()]);

  return (
    <section id="courses" className="bg-[#FAFAFA] px-5 py-[88px] sm:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader
          title="Discover our Courses"
          description="Find software development courses from Cinx and build the skills for your next step."
        />

        <CoursesTabs categories={categories} courses={courses} />

        <div className="mt-10 flex justify-center">
          <LandingButton href="/courses" rightIcon={<ArrowRight className="size-4" />}>
            Browse all courses
          </LandingButton>
        </div>
      </div>
    </section>
  );
}
