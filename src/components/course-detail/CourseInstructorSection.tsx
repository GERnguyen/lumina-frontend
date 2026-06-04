import Image from "next/image";
import { BookOpen, Star, Users } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

export function CourseInstructorSection({ course }: { course: CourseDetail }) {
  return (
    <section id="instructor">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course instructor ({String(course.instructors.length).padStart(2, "0")})</h2>
      <div className="mt-5 space-y-5">
        {course.instructors.map((instructor) => (
          <article key={instructor.name} className="flex flex-col gap-5 border border-[#E9EAF0] p-6 sm:flex-row">
            <Image src={instructor.avatar} alt={instructor.name} width={136} height={136} className="size-[136px] shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-[#1D2026]">{instructor.name}</h3>
              <p className="mt-1 text-sm text-[#6E7485]">{instructor.role}</p>
              <div className="mt-3 flex flex-wrap gap-5 text-sm text-[#4E5566]">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-[#FD8E1F] text-[#FD8E1F]" />
                  {instructor.rating} Course rating
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-[#7872FD]" />
                  {instructor.students} Students
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-4 text-[#7872FD]" />
                  {instructor.courses} Courses
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#4E5566]">
                {instructor.bio} <button className="font-semibold text-[#7872FD]">READ MORE</button>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
