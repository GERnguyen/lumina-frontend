import { ChevronDown, Clock, FileText, FolderOpen, PlayCircle } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

export function CourseCurriculum({ course }: { course: CourseDetail }) {
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
        {course.curriculum.map((section) => (
          <div key={section.title} className="border-b border-[#E9EAF0] last:border-b-0">
            <button type="button" className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="inline-flex items-center gap-3 text-sm font-medium text-[#1D2026]">
                <ChevronDown className={`size-4 text-[#7872FD] ${section.expanded ? "" : "-rotate-90"}`} />
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

            {section.expanded ? (
              <div className="border-t border-[#E9EAF0] bg-white px-5 py-2">
                {section.items.map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-4 py-2.5 text-sm text-[#4E5566]">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      {item.preview ? <PlayCircle className="size-4 shrink-0 text-[#1D2026]" /> : <FileText className="size-4 shrink-0 text-[#1D2026]" />}
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-[#8C94A3]">{item.duration}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
