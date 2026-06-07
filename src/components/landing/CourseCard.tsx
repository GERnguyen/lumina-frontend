import Image from "next/image";
import Link from "next/link";
import { Star, UsersRound } from "lucide-react";
import type { LandingCourse } from "@/data/landing";

type CourseCardProps = {
  course: LandingCourse;
};

export function CourseCard({ course }: CourseCardProps) {
  const Icon = course.icon;

  return (
    <Link href={course.href || "/courses"} className="animate-fade-up group overflow-hidden rounded-[4px] border border-[#E6E9EA] bg-white transition duration-300 hover:-translate-y-1.5 hover:border-[#C9DCFF] hover:shadow-[0_20px_48px_rgba(0,43,107,0.14)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EAF2FF]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 bg-[#EBEBFF] px-1.5 py-1 text-[10px] font-medium uppercase leading-3 text-[#342F98]">
          {course.category}
        </span>
      </div>

      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#EAF2FF] text-[#0066FF]">
            <Icon className="size-5" />
          </span>
          <span className="text-base font-bold text-[#0066FF]">{course.price}</span>
        </div>

        <h3 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-[22px] text-[#1E242C]">
          {course.title}
        </h3>

        <div className="mt-3 flex items-center justify-between border-t border-[#EEF2F7] pt-3 text-xs font-medium text-[#6C7787]">
          <span className="flex items-center gap-1.5 text-[#FFB547]">
            <Star className="size-4 fill-current" />
            {course.rating || "5.0"}
          </span>
          <span className="flex items-center gap-1.5">
            <UsersRound className="size-4 text-[#0066FF]" />
            {course.students} students
          </span>
        </div>
      </div>
    </Link>
  );
}
