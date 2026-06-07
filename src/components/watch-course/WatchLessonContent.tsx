import { Download, FileText } from "lucide-react";
import type { WatchCourseData } from "@/data/watch-course";

export function WatchLessonContent({ course }: { course: WatchCourseData }) {
  return (
    <div className="space-y-10">
      <section id="description">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Lectures Description</h2>
        <div className="mt-5 space-y-4 text-sm leading-6 text-[#4E5566]">
          {course.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section id="lectures-notes">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-[#1D2026]">Lecture Notes</h2>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[18px] bg-[#EBEBFF] px-4 text-sm font-semibold text-[#7872FD]">
            <Download className="size-4" />
            Download Notes
          </button>
        </div>
        <div className="mt-5 space-y-4 text-sm leading-6 text-[#4E5566]">
          {course.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>

      <section id="attach-file">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Attach Files (01)</h2>
        <div className="mt-5 flex items-center justify-between gap-4 bg-[#F5F7FA] p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center bg-white text-[#7872FD]">
              <FileText className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#1D2026]">{course.attachment.name}</h3>
              <p className="text-xs text-[#6E7485]">{course.attachment.size}</p>
            </div>
          </div>
          <button type="button" className="h-12 rounded-[18px] bg-[#7872FD] px-6 text-sm font-semibold text-white">
            Download File
          </button>
        </div>
      </section>
    </div>
  );
}
