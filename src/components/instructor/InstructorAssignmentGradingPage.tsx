"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Loader2 } from "lucide-react";
import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import { AssignmentService } from "@/services/learningService";
import { CourseService } from "@/services/courseService";
import type { AssignmentSubmissionResponse, LessonResponse } from "@/types";
import type { InstructorCourseDetailData } from "@/services/instructor-course-detail-service";

type AssignmentLessonSummary = {
  id: string;
  title: string;
  sectionTitle: string;
};

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function InstructorAssignmentGradingPage({ data }: { data: InstructorCourseDetailData }) {
  const [assignmentLessons, setAssignmentLessons] = useState<AssignmentLessonSummary[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<string, AssignmentSubmissionResponse[]>>({});
  const [assignmentScores, setAssignmentScores] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string>();
  const [message, setMessage] = useState("");

  const submissionCount = useMemo(
    () => Object.values(assignmentSubmissions).reduce((total, submissions) => total + submissions.length, 0),
    [assignmentSubmissions],
  );

  async function loadAssignments() {
    setIsLoading(true);
    setMessage("");
    const curriculumRes = await CourseService.getReadableCurriculum({ id: data.course.id }).catch(() => undefined);
    const nextAssignments =
      curriculumRes?.data?.sections?.flatMap((section) =>
        (section.lessons || [])
          .filter((lesson): lesson is LessonResponse & { id: string } => Boolean(lesson.id && lesson.lessonType === "ASSIGNMENT"))
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title || "Untitled assignment",
            sectionTitle: section.title || "Course section",
          })),
      ) || [];

    setAssignmentLessons(nextAssignments);
    const submissionEntries = await Promise.all(
      nextAssignments.map(async (assignment) => {
        const response = await AssignmentService.getAssignmentSubmissions({
          assignmentId: assignment.id,
          page: 1,
          size: 50,
        }).catch(() => undefined);
        return [assignment.id, response?.data || []] as const;
      }),
    );
    const nextSubmissions = Object.fromEntries(submissionEntries);
    setAssignmentSubmissions(nextSubmissions);
    setAssignmentScores(
      Object.fromEntries(
        Object.values(nextSubmissions)
          .flat()
          .filter((submission) => submission.id)
          .map((submission) => [submission.id!, typeof submission.score === "number" ? String(submission.score) : ""]),
      ),
    );
    setIsLoading(false);
  }

  useEffect(() => {
    loadAssignments();
  }, [data.course.id]);

  async function gradeAssignment(submission: AssignmentSubmissionResponse) {
    if (!submission.id) return;
    const score = Number(assignmentScores[submission.id]);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      setMessage("Score must be between 0 and 10.");
      return;
    }

    setPendingId(submission.id);
    setMessage("");
    try {
      await AssignmentService.scoreAssignmentSubmission({ submissionId: submission.id, score });
      setMessage("Assignment graded.");
      await loadAssignments();
    } catch {
      setMessage("Could not grade assignment submission.");
    } finally {
      setPendingId(undefined);
    }
  }

  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem="courses" />
        <main className="min-w-0 flex-1">
          <InstructorTopbar user={data.user} title="Assignment Grading" />
          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-40">
            <div className="flex flex-col gap-4 rounded-[18px] bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link href={`/instructor/courses/${data.course.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#564FFD]">
                  <ArrowLeft className="size-4" />
                  Back to course
                </Link>
                <h1 className="mt-4 text-2xl font-bold text-[#1D2026]">{data.course.title}</h1>
                <p className="mt-2 text-sm font-medium text-[#6E7485]">Review learner submissions and grade assignments from this course.</p>
              </div>
              <div className="rounded-[18px] bg-[#EBEBFF] px-5 py-4 text-sm font-bold text-[#564FFD]">
                {submissionCount} submission{submissionCount === 1 ? "" : "s"}
              </div>
            </div>

            {message ? <p className="rounded-[18px] bg-white px-5 py-4 text-sm font-bold text-[#564FFD]">{message}</p> : null}

            <section className="grid gap-5">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center rounded-[18px] bg-white text-[#564FFD]">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : assignmentLessons.length ? assignmentLessons.map((assignment) => {
                const submissions = assignmentSubmissions[assignment.id] || [];
                return (
                  <article key={assignment.id} className="rounded-[18px] bg-white p-6">
                    <div className="flex flex-col gap-3 border-b border-[#E9EAF0] pb-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">{assignment.sectionTitle}</p>
                        <h2 className="mt-2 text-xl font-bold text-[#1D2026]">{assignment.title}</h2>
                      </div>
                      <span className="w-fit rounded-full bg-[#F5F7FA] px-3 py-1.5 text-xs font-bold text-[#4E5566]">
                        {submissions.length} submitted
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {submissions.length ? submissions.map((submission) => (
                        <div key={submission.id || `${assignment.id}-${submission.userId}`} className="rounded-[18px] border border-[#E9EAF0] p-5">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="break-all text-sm font-bold text-[#1D2026]">Student {submission.userId || "Unknown"}</p>
                              <p className="mt-1 text-xs font-medium text-[#8C94A3]">Submitted {formatDate(submission.submissionTime)}</p>
                            </div>
                            {typeof submission.score === "number" ? (
                              <span className="rounded-full bg-[#EAF8EC] px-3 py-1.5 text-xs font-bold text-[#15803D]">{submission.score}/10</span>
                            ) : (
                              <span className="rounded-full bg-[#FFF4E5] px-3 py-1.5 text-xs font-bold text-[#B4690E]">Pending grade</span>
                            )}
                          </div>

                          {submission.content ? <p className="mt-4 whitespace-pre-line rounded-[16px] bg-[#F9FAFB] p-4 text-sm leading-6 text-[#4E5566]">{submission.content}</p> : null}

                          {submission.attachments?.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {submission.attachments.map((attachment) => (
                                <a
                                  key={attachment.id || attachment.attachmentUrl || attachment.fileName}
                                  href={attachment.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#EBEBFF] px-4 text-sm font-bold text-[#564FFD] transition hover:bg-[#DEDFFF]"
                                >
                                  <ExternalLink className="size-4" />
                                  {attachment.fileName || "Submission file"}
                                </a>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={assignmentScores[submission.id || ""] || ""}
                              onChange={(event) => setAssignmentScores((current) => ({ ...current, [submission.id || ""]: event.target.value }))}
                              className="h-12 min-w-0 flex-1 rounded-[18px] border border-[#E9EAF0] px-4 text-sm font-semibold text-[#1D2026] outline-none transition focus:border-[#564FFD] focus:ring-4 focus:ring-[#EBEBFF]"
                              placeholder="Score 0-10"
                            />
                            <button
                              type="button"
                              onClick={() => gradeAssignment(submission)}
                              disabled={!submission.id || pendingId === submission.id}
                              className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:bg-[#453FCA] active:scale-[0.98] disabled:opacity-60"
                            >
                              {pendingId === submission.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                              Save grade
                            </button>
                          </div>
                        </div>
                      )) : (
                        <p className="rounded-[18px] bg-[#F5F7FA] p-5 text-sm font-medium text-[#6E7485]">No submissions for this assignment yet.</p>
                      )}
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-[18px] bg-white p-10 text-center">
                  <FileText className="mx-auto size-10 text-[#8C94A3]" />
                  <p className="mt-4 text-lg font-bold text-[#1D2026]">No assignment lessons</p>
                  <p className="mt-2 text-sm text-[#6E7485]">This course does not have assignment lessons to grade yet.</p>
                </div>
              )}
            </section>

            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
