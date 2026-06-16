import Image from "next/image";
import Link from "next/link";
import { Star, User } from "lucide-react";
import type { CourseResponse } from "@/types";
import { cn } from "@/lib/utils";
import {
  getCourseImage,
  getCourseCategory,
  money,
  getCourseRating,
  compactNumber,
  formatDuration,
  getCourseInstructorName,
} from "@/lib/format";

const badgeTones: Record<string, string> = {
  purple: "bg-[#EBEBFF] text-[#342F98]",
  orange: "bg-[#FFEEE8] text-[#993D20]",
  blue: "bg-[#E6F0FF] text-[#002B6B]",
  green: "bg-[#E7F7ED] text-[#19703E]",
};

export function CourseListingCard({ course, index = 0 }: { course: CourseResponse; index?: number }) {
  const href = course.id ? `/courses/${course.id}` : "/courses";
  const ratingValue = course.rating || 0;
  const hasRating = typeof ratingValue === "number" && ratingValue > 0;

  const image = getCourseImage(course, index);
  const category = getCourseCategory(course);
  const instructor = getCourseInstructorName(course);
  
  const discounted = course.discountedPrice ?? course.price ?? 0;
  const original = course.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;
  
  const priceLabel = money(discounted);
  const ratingText = getCourseRating(course.rating);
  const studentsCount = compactNumber(course.enrollmentCount);
  const durationText = formatDuration(course.duration);

  // Pick badge tone based on category name or index
  const toneKeys = Object.keys(badgeTones);
  const badgeTone = badgeTones[toneKeys[index % toneKeys.length]] || "purple";

  return (
    <Link href={href} className="group flex flex-col gap-3.5 border border-[#E9EAF0] bg-white pb-3.5 transition hover:-translate-y-0.5 hover:border-[#D8D6FF] hover:shadow-[0_16px_36px_rgba(29,32,38,0.08)]">
      <div className="relative h-[234px] w-full overflow-hidden">
        <Image
          src={image}
          alt={course.title || "Untitled Course"}
          fill
          sizes="(min-width: 1280px) 312px, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 px-[18px]">
        <div className="flex items-center justify-between">
          <span className={cn("px-1.5 py-1 text-[10px] font-medium uppercase leading-3", badgeTone)}>
            {category}
          </span>
          <span className="flex items-baseline gap-2">
            {original ? <span className="text-sm text-[#8C94A3] line-through">{original}</span> : null}
            <span className="text-lg font-medium text-[#7872FD]">{priceLabel}</span>
          </span>
        </div>
        <h3 className="line-clamp-2 min-h-11 text-base font-medium leading-[22px] text-[#1D2026]">
          {course.title || "Untitled Course"}
        </h3>
      </div>
      <div className="h-px bg-[#E9EAF0]" />
      <div className="flex flex-wrap items-center justify-between gap-3 px-[18px]">
        <span className="flex items-center gap-2 text-sm font-medium text-[#4E5566]">
          <span className="flex items-center gap-0.5" aria-label={hasRating ? `${ratingText} star rating` : "No rating yet"}>
            {Array.from({ length: 5 }).map((_, idx) => {
              const filled = hasRating && idx < Math.round(ratingValue);
              return (
                <Star
                  key={idx}
                  className={cn(
                    "size-4",
                    filled ? "fill-[#FD8E1F] text-[#FD8E1F]" : "fill-[#E9EAF0] text-[#C6CAD1]",
                  )}
                />
              );
            })}
          </span>
          <span className={hasRating ? "text-[#4E5566]" : "text-[#8C94A3]"}>{ratingText}</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#8C94A3]">
          <User className="size-5 text-[#7872FD]" />
          <strong className="font-medium text-[#4E5566]">{studentsCount}</strong> students
        </span>
        {durationText ? <span className="text-xs text-[#8C94A3]">{durationText}</span> : null}
      </div>
      {instructor ? <p className="px-[18px] text-xs text-[#6E7485]">By <span className="font-medium text-[#1D2026]">{instructor}</span></p> : null}
    </Link>
  );
}
