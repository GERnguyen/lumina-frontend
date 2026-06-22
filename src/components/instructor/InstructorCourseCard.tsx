"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, MoreHorizontal, Pencil, Star, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import type { InstructorCourseCardData } from "@/services/instructor-courses-service";

type InstructorCourseCardProps = {
  course: InstructorCourseCardData;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

const statusToneClass: Record<InstructorCourseCardData["statusTone"], string> = {
  published: "bg-[#E8F8EE] text-[#159947]",
  draft: "bg-[#F5F7FA] text-[#4E5566]",
  waiting: "bg-[#FFF4E5] text-[#B4690E]",
  rejected: "bg-[#FFF0F0] text-[#E34444]",
  archived: "bg-[#F0F1F5] text-[#6E7485]",
};

export function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ratingText = course.rating ? course.rating.toFixed(1) : "No rating";

  return (
    <article className="group relative flex min-h-[390px] flex-col overflow-visible rounded-[18px] bg-white pb-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(29,32,38,0.12)]">
      <Link href={`/instructor/courses/${course.id}`} className="relative h-[196px] overflow-hidden rounded-t-[18px]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(min-width: 1536px) 312px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 h-px bg-[#E9EAF0]" />
      </Link>

      <div className="flex flex-1 flex-col gap-4 px-[18px] pt-4">
        <div className="space-y-2">
          <div className="flex flex-col items-start gap-1.5">
            <span className="inline-flex rounded-full bg-[#EBEBFF] px-2.5 py-1 text-[10px] font-bold uppercase leading-3 text-[#342F98]">
              {course.category}
            </span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-3 ${statusToneClass[course.statusTone]}`}>
              {course.statusLabel}
            </span>
          </div>
          <Link href={`/instructor/courses/${course.id}`} className="line-clamp-2 min-h-11 text-base font-medium leading-[22px] text-[#1D2026] transition hover:text-[#564FFD]">
            {course.title}
          </Link>
        </div>

        <div className="-mx-[18px] h-px bg-[#E9EAF0]" />

        <div className="flex items-center justify-between gap-3 text-sm tracking-[-0.14px]">
          <div className="flex items-center gap-1.5 text-[#4E5566]">
            <Star className={`size-5 ${course.rating ? "fill-[#FD8E1F] text-[#FD8E1F]" : "text-[#C6CAD1]"}`} />
            <span className="font-medium">{ratingText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8C94A3]">
            <UserRound className="size-5 text-[#564FFD]" />
            <span>
              <strong className="font-medium text-[#4E5566]">{formatCount(course.students)}</strong> students
            </span>
          </div>
        </div>

        <div className="-mx-[18px] h-px bg-[#E9EAF0]" />

        <div className="mt-auto flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <strong className="truncate text-lg font-semibold leading-6 text-[#564FFD]">
              {formatMoney(course.price)}
            </strong>
            {course.originalPrice ? (
              <span className="truncate text-sm leading-[22px] text-[#A1A5B3] line-through">
                {formatMoney(course.originalPrice)}
              </span>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label={`Open options for ${course.title}`}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((value) => !value)}
              className="flex size-8 items-center justify-center rounded-full text-[#8C94A3] transition hover:bg-[#F5F7FA] hover:text-[#564FFD]"
            >
              <MoreHorizontal className="size-5" />
            </button>

            {isMenuOpen ? (
              <div className="absolute bottom-[calc(100%+8px)] right-0 z-20 w-[168px] overflow-hidden rounded-[4px] bg-white py-1 shadow-[0_10px_30px_rgba(29,32,38,0.18)] ring-1 ring-black/5">
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="flex h-9 items-center gap-2 px-3 text-xs text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#564FFD]"
                >
                  <BookOpen className="size-4" />
                  View Details
                </Link>
                <Link
                  href={`/instructor/courses/${course.id}/edit`}
                  className="flex h-9 items-center gap-2 px-3 text-xs text-[#4E5566] transition hover:bg-[#F5F7FA] hover:text-[#564FFD]"
                >
                  <Pencil className="size-4" />
                  Edit Course
                </Link>
                <button
                  type="button"
                  disabled
                  className="flex h-9 w-full cursor-not-allowed items-center gap-2 px-3 text-left text-xs text-[#8C94A3]"
                >
                  <Trash2 className="size-4" />
                  Delete Course
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
