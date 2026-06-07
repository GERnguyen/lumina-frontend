import type { WatchCourseData } from "@/data/watch-course";

export function WatchLessonTabs({ course }: { course: WatchCourseData }) {
  return (
    <nav className="border-y border-[#E9EAF0]">
      <div className="flex overflow-x-auto">
        {course.tabs.map((tab, index) => (
          <a
            key={tab.label}
            href={`#${tab.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="relative flex h-[62px] min-w-[155px] items-center justify-center gap-2 px-5 text-sm font-medium text-[#4E5566]"
          >
            <span className={index === 0 ? "text-[#1D2026]" : ""}>{tab.label}</span>
            {tab.badge ? <span className="bg-[#EBEBFF] px-1.5 py-1 text-[10px] font-semibold text-[#7872FD]">{tab.badge}</span> : null}
            {index === 0 ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#7872FD]" /> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
