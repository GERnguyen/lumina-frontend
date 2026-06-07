import Link from "next/link";
import { ArrowLeft, Clock, FileText, PlayCircle } from "lucide-react";
import type { WatchCourseData } from "@/data/watch-course";

export function WatchCourseHeader({ course }: { course: WatchCourseData }) {
  return (
    <section className="border-b border-[#E9EAF0] bg-[#F5F7FA] px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1888px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <Link href={`/courses/${course.courseId}`} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-[#1D2026] transition hover:text-[#7872FD]" aria-label="Back to course detail">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-[#1D2026] lg:text-xl">{course.courseTitle}</h1>
            <div className="mt-2 flex flex-wrap gap-5 text-sm text-[#4E5566]">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-4 text-[#7872FD]" />
                6 Sections
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PlayCircle className="size-4 text-[#7872FD]" />
                202 lectures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-[#7872FD]" />
                19h 37m
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="h-12 rounded-[18px] bg-white px-6 text-sm font-semibold text-[#7872FD]">
            Write A Review
          </button>
          <button type="button" className="h-12 rounded-[18px] bg-[#7872FD] px-6 text-sm font-semibold text-white">
            Next Lecture
          </button>
        </div>
      </div>
    </section>
  );
}
