import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CourseResponse } from "@/types";
import { CourseRatingStars } from "./CourseRatingStars";
import {
  getProfileAvatar,
  getCourseInstructorName,
  getCourseRating,
  getCourseCategory,
  fullNumber,
} from "@/lib/format";

export function CourseDetailHeader({ course, reviewsCount }: { course: CourseResponse; reviewsCount: number }) {
  const category = getCourseCategory(course);
  const categoryTrail = ["Courses", category];
  
  const ratingValue = course.rating || 0;
  const ratingText = getCourseRating(course.rating);
  const reviewsCountText = fullNumber(reviewsCount);
  
  const instructor = getCourseInstructorName(course);
  const avatar = getProfileAvatar(course.instructor);

  return (
    <section className="bg-white px-6 pb-7 pt-10 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#8C94A3]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#7872FD]">
            Home
          </Link>
          {categoryTrail.map((item, index) => (
            <span key={item} className="inline-flex items-center gap-2">
              <ChevronRight className="size-3.5" />
              <Link href="/courses" className={index === categoryTrail.length - 1 ? "text-[#7872FD]" : "transition hover:text-[#7872FD]"}>
                {item}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mt-4 max-w-[880px]">
          <h1 className="max-w-[780px] text-[28px] font-semibold leading-[1.22] tracking-normal text-[#1D2026] md:text-[36px]">
            {course.title || "Untitled Course"}
          </h1>
          <p className="mt-4 max-w-[860px] text-base leading-6 text-[#6E7485] md:text-lg">
            {course.description || ""}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src={avatar} alt={instructor} width={48} height={48} className="rounded-full" />
              <div>
                <p className="text-xs text-[#8C94A3]">Created by:</p>
                <p className="text-sm font-medium text-[#1D2026]">{instructor}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#6E7485]">
              <CourseRatingStars rating={ratingValue} size="md" />
              <strong className="font-medium text-[#1D2026]">{ratingText}</strong>
              <span>({reviewsCountText} {reviewsCount === 1 ? "review" : "reviews"})</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
