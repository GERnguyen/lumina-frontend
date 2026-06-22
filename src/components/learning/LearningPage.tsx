"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Clock, FileText, Loader2, Menu, PanelRightOpen, PlayCircle, X } from "lucide-react";
import type { LearningPageData } from "@/types/learning-page";
import type { CertificateRequestResponse } from "@/types/learning";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { applyForCertificateAction, getMyCourseProgressAction, markItemAsCompleteAction } from "@/services/actions/learning";
import { API_BASE_URL } from "@/lib/api-base";
import { LearningArticleLesson } from "./LearningArticleLesson";
import { LearningAssignmentLesson } from "./LearningAssignmentLesson";
import { LearningCurriculumDrawer } from "./LearningCurriculumDrawer";
import { LearningQuizLesson } from "./LearningQuizLesson";
import { LearningVideoLesson } from "./LearningVideoLesson";

type LearningPageProps = {
  data: LearningPageData;
};

function completedStorageKey(courseId: string) {
  return `lumina:completed-lessons:${courseId}`;
}

function completionModalStorageKey(courseId: string) {
  return `lumina:completion-modal-shown:${courseId}`;
}

function readLocalCompletedLessonIds(courseId: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(completedStorageKey(courseId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalCompletedLessonIds(courseId: string, ids: Set<string>) {
  try {
    window.localStorage.setItem(completedStorageKey(courseId), JSON.stringify([...ids]));
  } catch {
    // Local completion is only a UI guard; server progress still comes from the API.
  }
}

export function LearningPage({ data }: LearningPageProps) {
  const router = useRouter();
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
  const [certificate, setCertificate] = useState<CertificateRequestResponse | undefined>(data.certificate);
  const [certificateMessage, setCertificateMessage] = useState<string>();
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [isCertificatePending, startCertificateTransition] = useTransition();

  useEffect(() => {
    setCompletedIds((current) => {
      const serverCompletedIds = new Set<string>();
      const localCompletableIds = new Set<string>();

      data.sections.forEach((section) => {
        section.lessons.forEach((lesson) => {
          if (lesson.isCompleted) serverCompletedIds.add(lesson.id);
          if (lesson.type !== "ASSIGNMENT") localCompletableIds.add(lesson.id);
        });
      });

      const next = new Set([...current].filter((lessonId) => serverCompletedIds.has(lessonId) || localCompletableIds.has(lessonId)));
      serverCompletedIds.forEach((lessonId) => next.add(lessonId));
      readLocalCompletedLessonIds(data.courseId).forEach((lessonId) => {
        if (localCompletableIds.has(lessonId)) next.add(lessonId);
      });
      writeLocalCompletedLessonIds(data.courseId, new Set([...next].filter((lessonId) => localCompletableIds.has(lessonId))));
      return next;
    });
  }, [data.courseId, data.sections]);

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
  const displayedLessonTotal = useMemo(() => sections.reduce((total, section) => total + section.lessons.length, 0), [sections]);
  const displayedCompletedTotal = useMemo(() => sections.reduce((total, section) => total + section.completedCount, 0), [sections]);
  const displayedCourseComplete = displayedLessonTotal > 0 && displayedCompletedTotal >= displayedLessonTotal;
  const canRequestCertificate = Boolean(data.hasCertificate && displayedCourseComplete && !certificate?.id);

  useEffect(() => {
    setCertificate(data.certificate);
  }, [data.certificate]);

  useEffect(() => {
    if (!canRequestCertificate) return;
    try {
      const key = completionModalStorageKey(data.courseId);
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
      setCompletionModalOpen(true);
    } catch {
      setCompletionModalOpen(true);
    }
  }, [canRequestCertificate, data.courseId]);

  function handleComplete(lessonId: string) {
    const lesson = data.sections.flatMap((section) => section.lessons).find((item) => item.id === lessonId);
    if (lesson?.type === "ASSIGNMENT") {
      router.refresh();
      return;
    }

    setCompletedIds((current) => {
      if (current.has(lessonId)) return current;
      const next = new Set(current);
      next.add(lessonId);
      writeLocalCompletedLessonIds(data.courseId, next);
      return next;
    });
    window.setTimeout(() => router.refresh(), 700);
  }

  async function markCurrentComplete() {
    handleComplete(data.currentLesson.id);
    await markItemAsCompleteAction(data.currentLesson.id);
  }

  function requestCertificate() {
    if (!canRequestCertificate || isCertificatePending) return;
    setCertificateMessage(undefined);
    startCertificateTransition(async () => {
      const progressPayload = await getMyCourseProgressAction(data.courseId);
      const serverProgress = progressPayload.success ? progressPayload.data : undefined;
      if (!serverProgress?.isCompleted || !serverProgress.isPassed) {
        const completed = serverProgress?.completedItems ?? data.completedItems;
        const total = serverProgress?.totalItems ?? data.totalItems;
        setCertificateMessage(
          `The server has not confirmed this course as completed yet (${completed}/${total} items, passed: ${serverProgress?.isPassed ? "yes" : "no"}). Assignments must be graded and quizzes must be passed before requesting a certificate.`,
        );
        router.refresh();
        return;
      }

      const payload = await applyForCertificateAction(data.courseId);
      if (!payload.success) {
        setCertificateMessage(payload.error || "Could not request certificate yet.");
        return;
      }

      setCertificate(payload.data);
      setCertificateMessage("Certificate request sent. Your instructor can now review it.");
      setCompletionModalOpen(false);
    });
  }

  const certificateButtonLabel = (() => {
    if (!data.hasCertificate) return "Certificate unavailable";
    if (certificate?.status === "APPROVED") return "Certificate issued";
    if (certificate?.status === "PENDING") return "Certificate requested";
    if (certificate?.status === "REJECTED") return "Certificate rejected";
    if (!displayedCourseComplete) return "Complete course to request";
    return "Request Certificate";
  })();
  const certificateButtonDisabled = !canRequestCertificate || isCertificatePending;

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
            {data.hasCertificate ? (
              <button
                type="button"
                onClick={requestCertificate}
                disabled={certificateButtonDisabled}
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-[18px] px-5 text-sm font-semibold transition",
                  certificateButtonDisabled
                    ? "cursor-not-allowed bg-[#F5F7FA] text-[#8C94A3]"
                    : "bg-[#EBEBFF] text-[#564FFD] hover:-translate-y-0.5 hover:bg-[#DEDFFF]",
                )}
              >
                {isCertificatePending ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
                {certificateButtonLabel}
              </button>
            ) : null}
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

              {certificateMessage ? (
                <div className="mt-6 rounded-[18px] bg-[#F4F3FF] px-5 py-4 text-sm font-semibold text-[#564FFD]">
                  {certificateMessage}
                </div>
              ) : null}

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

      {completionModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-[0_30px_90px_rgba(17,24,39,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex size-14 items-center justify-center rounded-[20px] bg-[#EBEBFF] text-[#564FFD]">
                <CheckCircle2 className="size-7" />
              </div>
              <button
                type="button"
                onClick={() => setCompletionModalOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-full bg-[#F5F7FA] text-[#6E7485] transition hover:bg-[#EBEBFF] hover:text-[#564FFD]"
                aria-label="Close completion dialog"
              >
                <X className="size-5" />
              </button>
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-[#1D2026]">Course completed</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[#6E7485]">
              Nice work. You finished every lesson in {data.courseTitle}. You can request your certificate now, or come back to it later from this page.
            </p>
            {certificateMessage ? (
              <div className="mt-5 rounded-[18px] bg-[#F4F3FF] px-4 py-3 text-sm font-semibold text-[#564FFD]">
                {certificateMessage}
              </div>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCompletionModalOpen(false)}
                className="h-12 rounded-full border border-[#E9EAF0] px-6 text-sm font-bold text-[#4E5566] transition hover:border-[#D8D6FF] hover:bg-[#F8F8FF]"
              >
                Later
              </button>
              <button
                type="button"
                onClick={requestCertificate}
                disabled={certificateButtonDisabled}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCertificatePending ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
                Request Certificate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
