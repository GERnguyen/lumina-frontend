import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

export function CourseDetailHeader({ course, isFallback }: { course: CourseDetail; isFallback?: boolean }) {
  return (
    <section className="bg-white px-6 pb-7 pt-10 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#8C94A3]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#7872FD]">
            Home
          </Link>
          {course.categoryTrail.map((item, index) => (
            <span key={item} className="inline-flex items-center gap-2">
              <ChevronRight className="size-3.5" />
              <Link href="/courses" className={index === course.categoryTrail.length - 1 ? "text-[#7872FD]" : "transition hover:text-[#7872FD]"}>
                {item}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mt-4 max-w-[880px]">
          {isFallback ? (
            <span className="mb-3 inline-flex rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold text-[#B85C00]">
              Mock fallback
            </span>
          ) : null}
          <h1 className="max-w-[780px] text-[28px] font-semibold leading-[1.22] tracking-normal text-[#1D2026] md:text-[36px]">
            {course.title}
          </h1>
          <p className="mt-4 max-w-[860px] text-base leading-6 text-[#6E7485] md:text-lg">
            {course.subtitle}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src={course.authorAvatar} alt={course.authors.join(" and ")} width={48} height={48} className="rounded-full" />
              <div>
                <p className="text-xs text-[#8C94A3]">Created by:</p>
                <p className="text-sm font-medium text-[#1D2026]">{course.authors.join(" - ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#6E7485]">
              <span className="inline-flex items-center gap-1 text-[#7872FD]">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="size-5 fill-current" />
                ))}
              </span>
              <strong className="font-medium text-[#1D2026]">{course.rating}</strong>
              <span>({course.ratingCount} Rating)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
