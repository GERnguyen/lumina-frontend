"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCheck, ChevronDown, Clock, Pause, Play, PlayCircle } from "lucide-react";
import type { WatchCourseData, WatchLecture } from "@/data/watch-course";
import { cn } from "@/lib/utils";

type WatchCourseContentsProps = {
  course: WatchCourseData;
  completedLessonIds: Set<string>;
  progressPercent: number;
  progressText: string;
};

function LessonStatus({ lesson, isCompleted }: { lesson: WatchLecture; isCompleted: boolean }) {
  if (isCompleted) {
    return (
      <span className="flex size-[18px] items-center justify-center rounded-full bg-[#7872FD] text-white">
        <Check className="size-3" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "size-[18px] rounded-full border",
        lesson.status === "current" ? "border-[#7872FD] bg-white" : "border-[#CED1D9] bg-white"
      )}
    />
  );
}

export function WatchCourseContents({
  course,
  completedLessonIds,
  progressPercent,
  progressText,
}: WatchCourseContentsProps) {
  // Client state for toggling section visibility
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    course.sections.forEach((section) => {
      initial[section.title] = Boolean(section.expanded);
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="sticky top-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Course Contents</h2>
        <span className="text-base font-semibold text-[#23BD33]">{progressText}</span>
      </div>
      <div className="mt-4 h-1 bg-[#E9EAF0]">
        <div className="h-full bg-[#23BD33] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="mt-6 border border-[#E9EAF0] bg-white">
        {course.sections.map((section) => {
          const isExpanded = Boolean(expandedSections[section.title]);
          
          // Re-calculate completion progress for this section based on client state
          const sectionCompletedCount = section.lessons.filter((l) => completedLessonIds.has(l.id || "")).length;
          const sectionProgressText = section.lessons.length
            ? `${Math.round((sectionCompletedCount / section.lessons.length) * 100)}% finish (${sectionCompletedCount}/${section.lessons.length})`
            : undefined;

          return (
            <div key={section.title} className="border-b border-[#E9EAF0] last:border-b-0">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className={cn("flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#F5F7FA]", isExpanded ? "bg-[#F5F7FA]" : "bg-white")}
              >
                <span className={cn("inline-flex min-w-0 items-center gap-2 text-base", isExpanded ? "font-medium text-[#7872FD]" : "text-[#1D2026]")}>
                  <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
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
                  {sectionProgressText ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCheck className="size-4 text-[#23BD33]" />
                      {sectionProgressText}
                    </span>
                  ) : null}
                </span>
              </button>

              {isExpanded ? (
                <div className="py-3">
                  {section.lessons.map((lesson) => {
                    const isLessonDone = completedLessonIds.has(lesson.id || "");
                    const isCurrent = lesson.status === "current";

                    return (
                      <Link
                        key={lesson.title}
                        href={`/courses/${course.courseId}/watch?lessonId=${lesson.id}`}
                        className={cn(
                          "flex items-center justify-between gap-4 px-5 py-3 text-sm transition hover:bg-[#F5F7FA]",
                          isCurrent ? "bg-[#EBEBFF] hover:bg-[#EBEBFF]" : "bg-white"
                        )}
                      >
                        <span className="inline-flex min-w-0 items-center gap-3">
                          <LessonStatus lesson={lesson} isCompleted={isLessonDone} />
                          <span className={cn("truncate", isCurrent ? "font-medium text-[#1D2026]" : "text-[#4E5566]")}>
                            {lesson.title}
                          </span>
                        </span>
                        <span className={cn("inline-flex shrink-0 items-center gap-1.5", isCurrent ? "text-[#1D2026]" : "text-[#A1A5B3]")}>
                          {isCurrent ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                          {lesson.duration}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
