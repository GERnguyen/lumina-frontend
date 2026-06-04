import Image from "next/image";
import Link from "next/link";
import { Star, User } from "lucide-react";
import type { CourseListingItem } from "@/data/courses";
import { cn } from "@/lib/utils";

const badgeTones = {
  purple: "bg-[#EBEBFF] text-[#342F98]",
  orange: "bg-[#FFEEE8] text-[#993D20]",
  blue: "bg-[#E6F0FF] text-[#002B6B]",
  green: "bg-[#E7F7ED] text-[#19703E]",
};

function slugifyCourseTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CourseListingCard({ course }: { course: CourseListingItem }) {
  const href = `/courses/${slugifyCourseTitle(course.title)}`;

  return (
    <Link href={href} className="group flex flex-col gap-3.5 border border-[#E9EAF0] bg-white pb-3.5 transition hover:-translate-y-0.5 hover:border-[#D8D6FF] hover:shadow-[0_16px_36px_rgba(29,32,38,0.08)]">
      <div className="relative h-[234px] w-full overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(min-width: 1280px) 312px, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 px-[18px]">
        <div className="flex items-center justify-between">
          <span className={cn("px-1.5 py-1 text-[10px] font-medium uppercase leading-3", badgeTones[course.badgeTone])}>
            {course.category}
          </span>
          <span className="text-lg font-medium text-[#7872FD]">{course.price}</span>
        </div>
        <h3 className="line-clamp-2 min-h-11 text-base font-medium leading-[22px] text-[#1D2026]">
          {course.title}
        </h3>
      </div>
      <div className="h-px bg-[#E9EAF0]" />
      <div className="flex items-center justify-between px-[18px]">
        <span className="flex items-center gap-1.5 text-sm font-medium text-[#4E5566]">
          <Star className="size-5 fill-[#FD8E1F] text-[#FD8E1F]" />
          {course.rating}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#8C94A3]">
          <User className="size-5 text-[#7872FD]" />
          <strong className="font-medium text-[#4E5566]">{course.students}</strong> students
        </span>
      </div>
    </Link>
  );
}
