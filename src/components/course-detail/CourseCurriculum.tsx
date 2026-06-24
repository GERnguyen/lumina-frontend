"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardCheck,
  Clock,
  FileQuestion,
  FileText,
  FolderOpen,
  PlayCircle,
  X,
  Lock,
  ExternalLink,
  Loader2,
  FileVideo,
} from "lucide-react";
import type { CourseCurriculumResponse } from "@/types";
import { formatDuration } from "@/lib/format";
import { VideoLessonApi, ArticleLessonApi } from "@/services/api/course-api";

function LessonIcon({ type, preview }: { type?: string; preview?: boolean }) {
  if (preview) return <PlayCircle className="size-4 shrink-0 text-[#23BD33]" />;
  if (type === "VIDEO")
    return <PlayCircle className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "QUIZ")
    return <FileQuestion className="size-4 shrink-0 text-[#1D2026]" />;
  if (type === "ASSIGNMENT")
    return <ClipboardCheck className="size-4 shrink-0 text-[#1D2026]" />;
  return <FileText className="size-4 shrink-0 text-[#1D2026]" />;
}

export function CourseCurriculum({
  curriculum,
  duration,
  isEnrolled = false,
  courseId,
  isAuthenticated = false,
}: {
  curriculum?: CourseCurriculumResponse;
  duration?: number;
  isEnrolled?: boolean;
  courseId?: string;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [previewLesson, setPreviewLesson] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState<string | null>(null);

  const sections = useMemo(() => {
    return [...(curriculum?.sections || [])].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0),
    );
  }, [curriculum]);

  const initialOpenSections = useMemo(
    () => sections.map((_, index) => index === 0),
    [sections],
  );
  const [openSections, setOpenSections] = useState(initialOpenSections);

  function toggleSection(index: number) {
    setOpenSections((current) =>
      current.map((isOpen, itemIndex) =>
        itemIndex === index ? !isOpen : isOpen,
      ),
    );
  }

  const lecturesCount = useMemo(() => {
    return sections.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0,
    );
  }, [sections]);

  const curriculumSummary = [
    { label: "Sections", value: String(sections.length) },
    { label: "Lectures", value: String(lecturesCount) },
    { label: "Duration", value: formatDuration(duration) },
  ];

  const handleLessonClick = (lesson: any) => {
    if (isEnrolled) {
      router.push(`/learning/${courseId}?lessonId=${lesson.id}`);
    }
  };

  const handlePreviewClick = async (e: React.MouseEvent, lesson: any) => {
    e.stopPropagation(); // Prevent trigger row click

    setPreviewLesson(lesson);
    setLoadingPreview(true);
    setErrorPreview(null);
    setPreviewContent(null);

    try {
      if (lesson.lessonType === "ARTICLE") {
        const res = await ArticleLessonApi.getArticleByLessonId(
          courseId || "",
          lesson.id,
          { auth: false },
        );
        if (res?.data) {
          setPreviewContent(res.data);
        } else {
          throw new Error("No content available for this preview document.");
        }
      } else {
        // Default to video preview
        const res = await VideoLessonApi.getVideoByLessonId(
          courseId || "",
          lesson.id,
          { auth: false },
        );
        if (res?.data) {
          setPreviewContent(res.data);
        } else {
          throw new Error("No video available for this preview lesson.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load preview content:", err);
      setErrorPreview(
        err?.message ||
          "An error occurred while loading preview content. Please try again later.",
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewLesson(null);
    setPreviewContent(null);
    setErrorPreview(null);
  };

  return (
    <section id="curriculum" className="pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Curriculum</h2>
        <div className="flex flex-wrap gap-5 text-sm text-[#363B47]">
          {curriculumSummary.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              {item.label === "Sections" ? (
                <FolderOpen className="size-4 text-[#7872FD]" />
              ) : null}
              {item.label === "Lectures" ? (
                <PlayCircle className="size-4 text-[#7872FD]" />
              ) : null}
              {item.label === "Duration" ? (
                <Clock className="size-4 text-[#7872FD]" />
              ) : null}
              <strong className="font-medium text-[#1D2026]">
                {item.value}
              </strong>{" "}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white">
        {sections.map((section, index) => {
          const isOpen = openSections[index];
          const lessons = [...(section.lessons || [])].sort(
            (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0),
          );
          const sectionDuration =
            section.duration ||
            lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

          return (
            <div
              key={section.id || index}
              className="border-b border-[#E9EAF0] last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`course-section-${index}`}
                onClick={() => toggleSection(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#F8F8FF]"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-[#1D2026]">
                  <ChevronDown
                    className={`size-4 text-[#7872FD] transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                  {section.title || `Section ${index + 1}`}
                </span>
                <span className="flex shrink-0 items-center gap-4 text-xs font-medium text-[#6E7485]">
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
                <div
                  id={`course-section-${index}`}
                  className="border-t border-[#E9EAF0] bg-white px-5 py-2"
                >
                  {lessons.map((item, itemIdx) => {
                    const canPreview = item.isPreview && !isEnrolled;
                    return (
                      <div
                        key={item.id || itemIdx}
                        onClick={() => handleLessonClick(item)}
                        className={`flex items-center justify-between gap-4 py-2.5 text-sm text-[#363B47] ${
                          isEnrolled
                            ? "cursor-pointer hover:text-[#564FFD] transition"
                            : ""
                        }`}
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <LessonIcon
                            type={item.lessonType}
                            preview={item.isPreview}
                          />
                          <span className="truncate">
                            {item.title || "Untitled Lesson"}
                          </span>
                        </span>

                        <div className="flex items-center gap-4 shrink-0">
                          {isEnrolled ? (
                            <span className="text-xs font-semibold text-[#564FFD]">
                              Learn now &rarr;
                            </span>
                          ) : canPreview ? (
                            <button
                              type="button"
                              onClick={(e) => handlePreviewClick(e, item)}
                              className="cursor-pointer rounded-lg bg-[#EBEBFF] px-2.5 py-1 text-xs font-bold text-[#564FFD] hover:bg-[#DEDDFF] transition"
                            >
                              Preview
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="size-3" />
                              <span>Locked</span>
                            </span>
                          )}
                          <span className="text-xs font-medium text-[#6E7485]">
                            {formatDuration(item.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#1D2026] text-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#23BD33]/20 px-2.5 py-0.5 text-xs font-bold text-[#23BD33] uppercase">
                  Free Preview
                </span>
                <h3
                  className="text-base font-bold text-white truncate max-w-[450px]"
                  title={previewLesson.title}
                >
                  {previewLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="group flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
              >
                <X className="size-4 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[320px] bg-[#121417]">
              {loadingPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-10 animate-spin text-[#564FFD]" />
                  <p className="text-sm font-semibold text-zinc-400">
                    Loading preview content...
                  </p>
                </div>
              ) : errorPreview ? (
                <div className="text-center space-y-3 p-6">
                  <p className="text-sm font-bold text-red-400">
                    {errorPreview}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => handlePreviewClick(e as any, previewLesson)}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-850 px-4 text-xs font-bold text-white hover:bg-zinc-750 transition animate-pulse"
                  >
                    Try again
                  </button>
                </div>
              ) : previewContent ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {previewLesson.lessonType === "ARTICLE" ? (
                    <div className="w-full space-y-4">
                      {previewContent.articleUrl
                        ?.toLowerCase()
                        .endsWith(".pdf") ? (
                        <div className="space-y-4 w-full">
                          <iframe
                            src={`${previewContent.articleUrl}#toolbar=0`}
                            className="w-full h-[450px] rounded-lg border border-zinc-850"
                            title={previewLesson.title}
                          />
                          <div className="flex justify-center">
                            <a
                              href={previewContent.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#564FFD] px-5 text-sm font-bold text-white hover:bg-[#433EE8] transition"
                            >
                              <ExternalLink className="size-4" />
                              <span>Open document in new tab</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-zinc-850 p-6 bg-zinc-900/50 text-center space-y-4 max-w-md mx-auto">
                          <FileText className="size-12 text-[#564FFD] mx-auto" />
                          <h4 className="font-semibold text-white">
                            {previewContent.fileName || "Learning Material"}
                          </h4>
                          <p className="text-xs text-zinc-400">
                            Preview document is ready as an attachment.
                          </p>
                          <a
                            href={previewContent.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#564FFD] px-5 text-sm font-bold text-white hover:bg-[#433EE8] transition w-full"
                          >
                            <ExternalLink className="size-4" />
                            <span>View full document</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Video preview
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border border-zinc-850">
                      {previewContent.videoUrl ? (
                        <video
                          src={previewContent.videoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 gap-2">
                          <FileVideo className="size-12 text-zinc-600" />
                          <p className="text-sm">
                            Video is not processed yet or path not found.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">Could not load content.</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#181a20]">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">
                  Enjoyed this lesson?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enroll today to earn your certificate and unlock all remaining lessons.
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#564FFD] px-6 text-sm font-bold text-white hover:bg-[#433EE8] transition cursor-pointer"
              >
                Enroll in Course
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
