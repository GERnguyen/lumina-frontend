import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import type { WatchCourseData } from "@/data/watch-course";
import { WatchComments } from "./WatchComments";
import { WatchCourseContents } from "./WatchCourseContents";
import { WatchCourseHeader } from "./WatchCourseHeader";
import { WatchLessonContent } from "./WatchLessonContent";
import { WatchLessonTabs } from "./WatchLessonTabs";
import { WatchVideoPlayer } from "./WatchVideoPlayer";

export function WatchCoursePage({ course, isFallback }: { course: WatchCourseData; isFallback?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <WatchCourseHeader course={course} />

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-[1528px]">
          <WatchVideoPlayer course={course} />
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {isFallback ? (
                <span className="mb-3 inline-flex rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold text-[#B85C00]">
                  Mock fallback
                </span>
              ) : null}
              <h1 className="text-[32px] font-semibold leading-10 text-[#1D2026]">{course.currentLesson}</h1>
            </div>
            <div className="flex shrink-0 gap-6 text-sm text-[#6E7485]">
              <span>
                Last updated: <strong className="font-medium text-[#1D2026]">{course.lastUpdated}</strong>
              </span>
              <span>
                Comments: <strong className="font-medium text-[#1D2026]">{course.commentsCount}</strong>
              </span>
            </div>
          </div>
          <div className="mt-5 max-w-[916px]">
            <WatchLessonTabs course={course} />
          </div>

          <div className="mt-9 grid gap-12 lg:grid-cols-[minmax(0,916px)_minmax(360px,603px)]">
            <div className="space-y-12">
              <WatchLessonContent course={course} />
              <WatchComments course={course} />
            </div>
            <WatchCourseContents course={course} />
          </div>
        </div>
      </section>

      <CoursesFooter />
    </main>
  );
}
