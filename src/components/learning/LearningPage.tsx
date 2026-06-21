"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, FileText, Menu, PanelRightOpen, PlayCircle, X } from "lucide-react";
import type { LearningPageData } from "@/types/learning-page";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { markItemAsCompleteAction } from "@/services/actions/learning";
import { API_BASE_URL } from "@/lib/api-base";
import { LearningArticleLesson } from "./LearningArticleLesson";
import { LearningAssignmentLesson } from "./LearningAssignmentLesson";
import { LearningCurriculumDrawer } from "./LearningCurriculumDrawer";
import { LearningQuizLesson } from "./LearningQuizLesson";
import { LearningVideoLesson } from "./LearningVideoLesson";

type LearningPageProps = {
  data: LearningPageData;
};

export function LearningPage({ data }: LearningPageProps) {
  const [completedIds, setCompletedIds] = useState(() => {
    const ids = new Set<string>();
    data.sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.isCompleted) ids.add(lesson.id);
      });
    });
    return ids;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetch(`${API_BASE_URL}/api/v1/learning/activity`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: data.courseId, itemId: data.currentLesson.id, activeSeconds: 10 }),
        keepalive: true,
      }).catch(() => undefined);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [data.courseId, data.currentLesson.id]);

  const sections = useMemo(
    () =>
      data.sections.map((section) => ({
        ...section,
        completedCount: section.lessons.filter((lesson) => completedIds.has(lesson.id)).length,
        lessons: section.lessons.map((lesson) => ({
          ...lesson,
          isCompleted: completedIds.has(lesson.id),
        })),
      })),
    [completedIds, data.sections]
  );

  function handleComplete(lessonId: string) {
    setCompletedIds((current) => {
      if (current.has(lessonId)) return current;
      const next = new Set(current);
      next.add(lessonId);
      return next;
    });
  }

  async function markCurrentComplete() {
    handleComplete(data.currentLesson.id);
    await markItemAsCompleteAction(data.currentLesson.id);
  }

  const currentContent = data.content;
  const stats = [
    { label: "Sections", value: String(data.sections.length), icon: FileText },
    { label: "Lectures", value: String(data.totalItems), icon: PlayCircle },
    { label: "Duration", value: data.currentLesson.duration ? formatDuration(data.currentLesson.duration) : "Self-paced", icon: Clock },
  ];

  return (
    <>
      <section className="border-b border-[#E9EAF0] bg-[#F5F7FA] px-6 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1888px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-5">
            <Link href={`/courses/${data.courseId}`} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-[#1D2026] transition hover:text-[#7872FD]" aria-label="Back to course detail">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-[#1D2026] lg:text-xl">{data.courseTitle}</h1>
              <div className="mt-2 flex flex-wrap gap-5 text-sm text-[#4E5566]">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <span key={stat.label} className="inline-flex items-center gap-1.5">
                      <Icon className="size-4 text-[#7872FD]" />
                      {stat.value} {stat.label.toLowerCase()}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="h-12 rounded-[18px] bg-white px-6 text-sm font-semibold text-[#7872FD] xl:hidden"
            >
              Lessons
            </button>
            <button
              type="button"
              onClick={() => setContentsOpen((open) => !open)}
              className="hidden h-12 items-center gap-2 rounded-[18px] bg-white px-5 text-sm font-semibold text-[#7872FD] transition hover:bg-[#EBEBFF] xl:inline-flex"
              aria-expanded={contentsOpen}
            >
              {contentsOpen ? <ArrowRight className="size-4" /> : <PanelRightOpen className="size-4" />}
              {contentsOpen ? "Hide Contents" : "Show Contents"}
            </button>
            <button type="button" onClick={markCurrentComplete} className="h-12 rounded-[18px] bg-white px-6 text-sm font-semibold text-[#7872FD]">
              Mark Complete
            </button>
            {data.nextLessonId ? (
              <Link href={`/learning/${data.courseId}?lessonId=${data.nextLessonId}`} className="inline-flex h-12 items-center gap-2 rounded-[18px] bg-[#7872FD] px-6 text-sm font-semibold text-white">
                Next Lecture
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className={cn("bg-white py-16 pl-6 transition-[padding] duration-300 lg:pl-8", contentsOpen ? "pr-6 lg:pr-8" : "pr-2 lg:pr-3")}>
        <div className={cn("mx-auto flex max-w-[1888px] items-start transition-[gap] duration-300", contentsOpen ? "gap-8" : "gap-3")}>
          <main className="min-w-0 flex-1 transition-all duration-300 ease-out">
            <div className="mx-auto max-w-[1528px]">
              {currentContent.type === "VIDEO" ? (
                <LearningVideoLesson
                  courseId={data.courseId}
                  lessonId={data.currentLesson.id}
                  lessonTitle={data.currentLesson.title}
                  poster={data.coverUrl}
                  video={currentContent.video}
                  resumePosition={currentContent.resumePosition}
                  onComplete={handleComplete}
                />
              ) : null}

              {currentContent.type === "ARTICLE" ? (
                <LearningArticleLesson lessonId={data.currentLesson.id} article={currentContent.article} onComplete={handleComplete} />
              ) : null}

              {currentContent.type === "QUIZ" ? (
                <LearningQuizLesson courseId={data.courseId} lessonId={data.currentLesson.id} quiz={currentContent.quiz} onComplete={handleComplete} />
              ) : null}

              {currentContent.type === "ASSIGNMENT" ? (
                <LearningAssignmentLesson
                  lessonId={data.currentLesson.id}
                  assignment={currentContent.assignment}
                  submission={currentContent.submission}
                  onComplete={handleComplete}
                />
              ) : null}

              <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
                    <span className="rounded-full bg-[#EBEBFF] px-3 py-1 text-[#7872FD]">{data.currentLesson.type}</span>
                    {data.currentLesson.duration ? <span className="text-[#6E7485]">{formatDuration(data.currentLesson.duration)}</span> : null}
                  </div>
                  <h2 className="text-[32px] font-semibold leading-10 text-[#1D2026]">{data.currentLesson.title}</h2>
                </div>
                <div className="flex shrink-0 gap-6 text-sm text-[#6E7485]">
                  <span>
                    Progress: <strong className="font-medium text-[#1D2026]">{data.progressPercent}% Completed</strong>
                  </span>
                  <span>
                    Instructor: <strong className="font-medium text-[#1D2026]">{data.instructorName || "Lumina Instructor"}</strong>
                  </span>
                </div>
              </div>

            </div>
          </main>

          <aside
            className={cn(
              "sticky top-0 hidden h-screen shrink-0 self-start overflow-hidden transition-[width] duration-300 ease-out xl:block",
              contentsOpen ? "w-[420px] 2xl:w-[480px]" : "w-16",
            )}
          >
            <div
              className={cn(
                "h-full transition duration-300 ease-out",
                contentsOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
              )}
            >
              <LearningCurriculumDrawer courseId={data.courseId} sections={sections} onClose={() => setContentsOpen(false)} />
            </div>
            {!contentsOpen ? (
              <button
                type="button"
                onClick={() => setContentsOpen(true)}
                className="absolute inset-y-0 right-0 flex w-16 flex-col items-center rounded-[28px] border border-[#E9EAF0] bg-white px-3 py-8 text-[#1D2026] shadow-[0_18px_50px_rgba(29,32,38,0.08)] transition hover:border-[#D8D6FF] hover:bg-[#FCFCFF]"
                aria-label="Open course contents"
              >
                <Menu className="size-6" />
                <span className="sr-only">Course Contents</span>
              </button>
            ) : null}
          </aside>
        </div>
      </section>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 xl:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto bg-white p-4">
            <button
                type="button"
              onClick={() => setDrawerOpen(false)}
              className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-[#F5F7FA] text-[#1D2026]"
              aria-label="Close lessons drawer"
            >
              <X className="size-5" />
            </button>
            <LearningCurriculumDrawer courseId={data.courseId} sections={sections} />
          </div>
        </div>
      ) : null}
    </>
  );
}
