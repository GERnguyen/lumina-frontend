import Image from "next/image";
import Link from "next/link";
import type { ProfileCourseItem } from "@/data/user-profile";
import { formatShortDate } from "@/lib/format";

export function UserProfileCourseCard({ course }: { course: ProfileCourseItem }) {
  return (
    <article className={`group flex min-h-[368px] flex-col overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(29,32,38,0.12)] ${course.featured ? "shadow-[0_12px_24px_rgba(29,32,38,0.12)]" : ""}`}>
      <div className="relative aspect-[312/220] overflow-hidden bg-[#F5F7FA]">
        <Image src={course.image} alt={course.title} fill sizes="(min-width: 1280px) 312px, 90vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-xs leading-4 text-[#6E7485]">{course.title}</p>
            {course.enrolledAt && (
              <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                {formatShortDate(course.enrolledAt)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 tracking-normal text-[#1D2026]">{course.lesson}</h3>
        </div>

        <div className="mt-auto border-t border-[#E9EAF0] pt-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={course.href}
              className={`inline-flex h-10 items-center justify-center rounded-[18px] px-4 text-sm font-semibold tracking-normal transition ${
                course.featured ? "bg-[#564FFD] text-white hover:bg-[#433EE8]" : "bg-[#EBEBFF] text-[#564FFD] hover:bg-[#DEDDFF]"
              }`}
            >
              Watch Lecture
            </Link>
            {typeof course.progress === "number" ? <span className="whitespace-nowrap text-sm font-medium text-[#23BD33]">{course.progress}% Completed</span> : null}
          </div>
        </div>
      </div>

      {typeof course.progress === "number" ? (
        <div className="h-0.5 bg-transparent">
          <div className="h-full bg-[#564FFD]" style={{ width: `${course.progress}%` }} />
        </div>
      ) : (
        <div className="h-0.5 opacity-0" />
      )}
    </article>
  );
}
