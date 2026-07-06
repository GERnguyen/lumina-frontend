import Image from "next/image";
import Link from "next/link";
import type { ProfileLearningCourse } from "@/data/user-profile";
import { cn } from "@/lib/utils";

export function UserProfileLearningCard({ course }: { course: ProfileLearningCourse }) {
  return (
    <article className={`group flex min-h-[368px] flex-col overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(29,32,38,0.12)] ${course.featured ? "shadow-[0_12px_24px_rgba(29,32,38,0.12)]" : ""}`}>
      <div className="relative aspect-[312/220] overflow-hidden bg-[#F5F7FA]">
        <Image src={course.image} alt={course.title} fill sizes="(min-width: 1280px) 312px, 90vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-1.5">
          <p className="line-clamp-1 text-xs leading-4 text-[#6E7485]">{course.title}</p>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 tracking-normal text-[#1D2026]">{course.lesson}</h3>
        </div>

        <div className="mt-auto border-t border-[#E9EAF0] pt-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={course.href}
              className={`inline-flex h-10 items-center justify-center rounded-[18px] px-4 text-sm font-semibold tracking-normal transition ${
                course.featured ? "bg-[#564FFD] text-white hover:bg-[#433EE8]" : "bg-[#EBEBFF] text-[#564FFD] hover:bg-[#DEDDFF]"
              }`}
            >
              Watch Lecture
            </Link>
            {typeof course.progress === "number" ? (
              <span className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-sm font-medium">
                <span className="text-[#23BD33]">{course.progress}% {course.featured ? "Finish" : "Completed"}</span>
                {course.progress >= 100 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none",
                        course.isPassed
                          ? "bg-[#E6FBD9] text-[#1E7E34]"
                          : "bg-[#FFF4E5] text-[#B85C00]"
                      )}
                    >
                      {course.isPassed ? "Passed" : "Not Passed"}
                    </span>
                  </>
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {typeof course.progress === "number" ? (
        <div className="h-0.5 bg-transparent">
          <div
            className={cn(
              "h-full transition-all duration-300",
              course.progress >= 100 && !course.isPassed ? "bg-[#F5A623]" : "bg-[#564FFD]"
            )}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}
