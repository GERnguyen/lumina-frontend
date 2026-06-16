"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ClipboardCheck, Clock, FileQuestion, FileText, FolderOpen, PlayCircle } from "lucide-react";
import type { CourseCurriculumResponse } from "@/types";
import { formatDuration } from "@/lib/format";

function LessonIcon({ type, preview }: { type?: string; preview?: boolean }) {
  if (type === "VIDEO" || preview) return <PlayCircle className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "QUIZ") return <FileQuestion className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "ASSIGNMENT") return <ClipboardCheck className="size-4 shrink-0 text-[#1D2026]" />;
  return <FileText className="size-4 shrink-0 text-[#1D2026]" />;
}

export function CourseCurriculum({
  curriculum,
  duration,
}: {
  curriculum?: CourseCurriculumResponse;
  duration?: number;
}) {
  const sections = useMemo(() => {
    return [...(curriculum?.sections || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [curriculum]);

  const initialOpenSections = useMemo(
    () => sections.map((_, index) => index === 0),
    [sections],
  );
  const [openSections, setOpenSections] = useState(initialOpenSections);

  function toggleSection(index: number) {
    setOpenSections((current) => current.map((isOpen, itemIndex) => (itemIndex === index ? !isOpen : isOpen)));
  }

  const lecturesCount = useMemo(() => {
    return sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
  }, [sections]);

  const curriculumSummary = [
    { label: "Sections", value: String(sections.length) },
    { label: "Lectures", value: String(lecturesCount) },
    { label: "Duration", value: formatDuration(duration) },
  ];

  return (
    <section id="curriculum" className="pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Curriculum</h2>
        <div className="flex flex-wrap gap-5 text-sm text-[#4E5566]">
          {curriculumSummary.map((item) => (
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
        {sections.map((section, index) => {
          const isOpen = openSections[index];
          const lessons = [...(section.lessons || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          const sectionDuration = section.duration || lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

          return (
            <div key={section.id || index} className="border-b border-[#E9EAF0] last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`course-section-${index}`}
                onClick={() => toggleSection(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#F8F8FF]"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-[#1D2026]">
                  <ChevronDown className={`size-4 text-[#7872FD] transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  {section.title || `Section ${index + 1}`}
                </span>
                <span className="flex shrink-0 items-center gap-4 text-xs text-[#8C94A3]">
                  <span className="inline-flex items-center gap-1">
                    <PlayCircle className="size-4 text-[#7872FD]" />
                    {lessons.length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4 text-[#7872FD]" />
                    {formatDuration(sectionDuration)}
                  </span>
                </span>
              </button>

              {isOpen ? (
                <div id={`course-section-${index}`} className="border-t border-[#E9EAF0] bg-white px-5 py-2">
                  {lessons.map((item, itemIdx) => (
                    <div key={item.id || itemIdx} className="flex items-center justify-between gap-4 py-2.5 text-sm text-[#4E5566]">
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <LessonIcon type={item.lessonType} preview={item.isPreview} />
                        <span className="truncate">{item.title || "Untitled Lesson"}</span>
                      </span>
                      <span className="shrink-0 text-xs text-[#8C94A3]">{formatDuration(item.duration)}</span>
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
