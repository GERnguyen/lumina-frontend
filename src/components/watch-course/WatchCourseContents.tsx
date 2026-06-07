import { Check, CheckCheck, ChevronDown, Clock, Pause, Play, PlayCircle } from "lucide-react";
import type { WatchCourseData, WatchLecture } from "@/data/watch-course";
import { cn } from "@/lib/utils";

function LessonStatus({ lesson }: { lesson: WatchLecture }) {
  if (lesson.status === "done") {
    return (
      <span className="flex size-[18px] items-center justify-center rounded-full bg-[#7872FD] text-white">
        <Check className="size-3" />
      </span>
    );
  }

  return <span className={cn("size-[18px] rounded-full border", lesson.status === "current" ? "border-[#7872FD] bg-white" : "border-[#CED1D9] bg-white")} />;
}

export function WatchCourseContents({ course }: { course: WatchCourseData }) {
  return (
    <aside className="sticky top-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Course Contents</h2>
        <span className="text-base font-semibold text-[#23BD33]">{course.progress}</span>
      </div>
      <div className="mt-4 h-1 bg-[#E9EAF0]">
        <div className="h-full bg-[#23BD33]" style={{ width: `${course.progressPercent}%` }} />
      </div>

      <div className="mt-6 border border-[#E9EAF0] bg-white">
        {course.sections.map((section) => (
          <div key={section.title} className="border-b border-[#E9EAF0] last:border-b-0">
            <button type="button" className={cn("flex w-full items-center justify-between gap-4 p-5 text-left", section.expanded ? "bg-[#F5F7FA]" : "bg-white")}>
              <span className={cn("inline-flex min-w-0 items-center gap-2 text-base", section.expanded ? "font-medium text-[#7872FD]" : "text-[#1D2026]")}>
                <ChevronDown className={cn("size-5 shrink-0", section.expanded ? "rotate-180" : "")} />
                <span className="truncate">{section.title}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-4 text-sm text-[#4E5566] sm:flex">
                <span className="inline-flex items-center gap-1.5">
                  <PlayCircle className="size-4 text-[#7872FD]" />
                  {section.lectures}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-[#7872FD]" />
                  {section.duration}
                </span>
                {section.progress ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCheck className="size-4 text-[#23BD33]" />
                    {section.progress}
                  </span>
                ) : null}
              </span>
            </button>

            {section.expanded ? (
              <div className="py-3">
                {section.lessons.map((lesson) => (
                  <div key={lesson.title} className={cn("flex items-center justify-between gap-4 px-5 py-3 text-sm", lesson.status === "current" ? "bg-[#EBEBFF]" : "bg-white")}>
                    <span className="inline-flex min-w-0 items-center gap-3">
                      <LessonStatus lesson={lesson} />
                      <span className={cn("truncate", lesson.status === "current" ? "font-medium text-[#1D2026]" : "text-[#4E5566]")}>{lesson.title}</span>
                    </span>
                    <span className={cn("inline-flex shrink-0 items-center gap-1.5", lesson.status === "current" ? "text-[#1D2026]" : "text-[#A1A5B3]")}>
                      {lesson.status === "current" ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                      {lesson.duration}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
