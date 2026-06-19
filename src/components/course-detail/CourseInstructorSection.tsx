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
  const avatar = getProfileAvatar(course.instructor, name);
  const category = getCourseCategory(course);
  const rating = getCourseRating(course.rating);
  const studentsCount = compactNumber(course.enrollmentCount);
  const bio = (course.instructor as any)?.bio;
  const email = course.instructor?.email;

  return (
    <section id="instructor">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course instructor (01)</h2>
      <div className="mt-5 space-y-5">
        <article className="flex flex-col gap-5 rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_10px_28px_rgba(29,32,38,0.04)] sm:flex-row">
          <Image src={avatar} alt={name} width={136} height={136} className="size-[136px] shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#1D2026]">{name}</h3>
            <p className="mt-1 text-sm font-medium text-[#4E5566]">{category} Instructor</p>
            {email ? <p className="mt-1 text-sm text-[#6E7485]">{email}</p> : null}
            <div className="mt-3 flex flex-wrap gap-5 text-sm font-medium text-[#363B47]">
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
                {category}
              </span>
            </div>
            {bio ? <p className="mt-4 text-sm leading-6 text-[#363B47]">{bio}</p> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
