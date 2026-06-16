import Image from "next/image";
import { BookOpen, Star, Users } from "lucide-react";
import type { CourseResponse } from "@/types";
import {
  getProfileAvatar,
  getCourseInstructorName,
  getCourseCategory,
  getCourseRating,
  compactNumber,
} from "@/lib/format";

export function CourseInstructorSection({ course }: { course: CourseResponse }) {
  const name = getCourseInstructorName(course);
  const avatar = getProfileAvatar(course.instructor);
  const category = getCourseCategory(course);
  const rating = getCourseRating(course.rating);
  const studentsCount = compactNumber(course.enrollmentCount);
  const bio = (course.instructor as any)?.bio || `${name} teaches practical ${category.toLowerCase()} skills on Lumina with a focus on clear explanations and project-ready learning.`;

  return (
    <section id="instructor">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course instructor (01)</h2>
      <div className="mt-5 space-y-5">
        <article className="flex flex-col gap-5 border border-[#E9EAF0] p-6 sm:flex-row">
          <Image src={avatar} alt={name} width={136} height={136} className="size-[136px] shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#1D2026]">{name}</h3>
            <p className="mt-1 text-sm text-[#6E7485]">{category} Instructor</p>
            <div className="mt-3 flex flex-wrap gap-5 text-sm text-[#4E5566]">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-[#FD8E1F] text-[#FD8E1F]" />
                {rating} Course rating
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-[#7872FD]" />
                {studentsCount} Students
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="size-4 text-[#7872FD]" />
                1 Course
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#4E5566]">
              {bio} <button className="font-semibold text-[#7872FD]">READ MORE</button>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
