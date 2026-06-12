"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ClipboardCheck, Clock, FileQuestion, FileText, FolderOpen, PlayCircle } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

function LessonIcon({ type, preview }: { type?: string; preview?: boolean }) {
  if (type === "VIDEO" || preview) return <PlayCircle className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "QUIZ") return <FileQuestion className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "ASSIGNMENT") return <ClipboardCheck className="size-4 shrink-0 text-[#1D2026]" />;
  return <FileText className="size-4 shrink-0 text-[#1D2026]" />;
}

export function CourseCurriculum({ course }: { course: CourseDetail }) {
  const initialOpenSections = useMemo(
    () => course.curriculum.map((section, index) => Boolean(section.expanded || index === 0)),
    [course.curriculum],
  );
  const [openSections, setOpenSections] = useState(initialOpenSections);

  function toggleSection(index: number) {
    setOpenSections((current) => current.map((isOpen, itemIndex) => (itemIndex === index ? !isOpen : isOpen)));
  }

  return (
    <section id="curriculum" className="pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Curriculum</h2>
        <div className="flex flex-wrap gap-5 text-sm text-[#4E5566]">
          {course.curriculumSummary.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              {item.label === "Sections" ? <FolderOpen className="size-4 text-[#7872FD]" /> : null}
              {item.label === "Lectures" ? <PlayCircle className="size-4 text-[#7872FD]" /> : null}
              {item.label === "Duration" ? <Clock className="size-4 text-[#7872FD]" /> : null}
              <strong className="font-medium text-[#1D2026]">{item.value}</strong> {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 border border-[#E9EAF0]">
        {course.curriculum.map((section, index) => {
          const isOpen = openSections[index];

          return (
            <div key={`${section.title}-${index}`} className="border-b border-[#E9EAF0] last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`course-section-${index}`}
                onClick={() => toggleSection(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#F8F8FF]"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-[#1D2026]">
                  <ChevronDown className={`size-4 text-[#7872FD] transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  {section.title}
                </span>
                <span className="flex shrink-0 items-center gap-4 text-xs text-[#8C94A3]">
                  <span className="inline-flex items-center gap-1">
                    <PlayCircle className="size-4 text-[#7872FD]" />
                    {section.lectures}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4 text-[#7872FD]" />
                    {section.duration}
                  </span>
                </span>
              </button>

              {isOpen ? (
                <div id={`course-section-${index}`} className="border-t border-[#E9EAF0] bg-white px-5 py-2">
                  {section.items.map((item) => (
                    <div key={item.title} className="flex items-center justify-between gap-4 py-2.5 text-sm text-[#4E5566]">
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <LessonIcon type={item.type} preview={item.preview} />
                        <span className="truncate">{item.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-[#8C94A3]">{item.duration}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
