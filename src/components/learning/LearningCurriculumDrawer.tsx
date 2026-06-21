"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CheckCheck, ChevronDown, Clock, ClipboardCheck, FileText, HelpCircle, Pause, PlayCircle, Video } from "lucide-react";
import type { LearningLesson, LearningSection } from "@/types/learning-page";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

type LearningCurriculumDrawerProps = {
  courseId: string;
  sections: LearningSection[];
  onClose?: () => void;
};

function lessonIcon(type: LearningLesson["type"]) {
  if (type === "ARTICLE") return <FileText className="size-4" />;
  if (type === "QUIZ") return <HelpCircle className="size-4" />;
  if (type === "ASSIGNMENT") return <ClipboardCheck className="size-4" />;
  return <Video className="size-4" />;
}

export function LearningCurriculumDrawer({ courseId, sections, onClose }: LearningCurriculumDrawerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((section, index) => {
      initial[section.id] = index === 0 || section.lessons.some((lesson) => lesson.isCurrent);
    });
    return initial;
  });

  return (
    <aside className="h-full rounded-[24px] border border-[#E9EAF0] bg-white p-5 shadow-[0_18px_50px_rgba(29,32,38,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[#1D2026]">Course Contents</h2>
          <span className="mt-1 block text-sm font-semibold text-[#23BD33]">
            {sections.reduce((sum, section) => sum + section.completedCount, 0)}/
            {sections.reduce((sum, section) => sum + section.lessons.length, 0)} completed
          </span>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA] text-[#4E5566] transition hover:bg-[#EBEBFF] hover:text-[#7872FD]"
            aria-label="Collapse course contents"
          >
            <ArrowRight className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#E9EAF0]">
        <div
          className="h-full rounded-full bg-[#23BD33] transition-all duration-300"
          style={{
            width: `${Math.round((sections.reduce((sum, section) => sum + section.completedCount, 0) / Math.max(1, sections.reduce((sum, section) => sum + section.lessons.length, 0))) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-6 max-h-[calc(100vh-190px)] overflow-y-auto rounded-[18px] border border-[#E9EAF0] bg-white">
        {sections.map((section) => {
          const isExpanded = expanded[section.id];
          const total = section.lessons.length;
          const percent = total ? Math.round((section.completedCount / total) * 100) : 0;

          return (
            <div key={section.id} className="border-b border-[#E9EAF0] last:border-b-0">
              <button
                type="button"
                onClick={() => setExpanded((current) => ({ ...current, [section.id]: !current[section.id] }))}
                className={cn("flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#F5F7FA]", isExpanded ? "bg-[#F5F7FA]" : "bg-white")}
              >
                <span className={cn("inline-flex min-w-0 items-center gap-2 text-base", isExpanded ? "font-medium text-[#7872FD]" : "text-[#1D2026]")}>
                  <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                  <span className="truncate">{section.title}</span>
                </span>
                <span className="hidden shrink-0 items-center gap-4 text-sm text-[#4E5566] sm:flex">
                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="size-4 text-[#7872FD]" />
                    {total} {total === 1 ? "lecture" : "lectures"}
                  </span>
                  {section.duration ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-[#7872FD]" />
                      {formatDuration(section.duration)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCheck className="size-4 text-[#23BD33]" />
                    {percent}% finish
                  </span>
                </span>
              </button>

              {isExpanded ? (
                <div className="py-3">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/learning/${courseId}?lessonId=${lesson.id}`}
                      className={cn(
                        "group flex items-center justify-between gap-4 px-5 py-3 text-sm transition hover:bg-[#F5F7FA]",
                        lesson.isCurrent ? "bg-[#EBEBFF] hover:bg-[#EBEBFF]" : "bg-white"
                      )}
                    >
                      <span className="inline-flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-[18px] shrink-0 items-center justify-center rounded-full border",
                            lesson.isCompleted ? "border-[#7872FD] bg-[#7872FD] text-white" : lesson.isCurrent ? "border-[#7872FD] bg-white text-[#7872FD]" : "border-[#CED1D9] bg-white text-[#8C94A3]"
                          )}
                        >
                          {lesson.isCompleted ? <Check className="size-3" /> : null}
                        </span>
                        <span className={cn("truncate", lesson.isCurrent ? "font-medium text-[#1D2026]" : "text-[#4E5566]")}>
                          {lesson.title}
                        </span>
                      </span>
                      <span className={cn("inline-flex shrink-0 items-center gap-1.5", lesson.isCurrent ? "text-[#1D2026]" : "text-[#A1A5B3]")}>
                        {lesson.isCurrent ? <Pause className="size-4 fill-current" /> : lessonIcon(lesson.type)}
                        {lesson.duration ? formatDuration(lesson.duration) : ""}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
