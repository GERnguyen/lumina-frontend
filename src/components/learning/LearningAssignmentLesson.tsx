"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, ExternalLink, Loader2, Send } from "lucide-react";
import type { AssignmentLessonResponse } from "@/types/course";
import type { AssignmentSubmissionResponse } from "@/types/learning";
import { submitAssignmentAction } from "@/services/actions/learning";

type LearningAssignmentLessonProps = {
  lessonId: string;
  assignment?: AssignmentLessonResponse;
  submission?: unknown;
  onComplete: (lessonId: string) => void;
};

function isSubmission(value: unknown): value is AssignmentSubmissionResponse {
  return Boolean(value && typeof value === "object" && "id" in value);
}

export function LearningAssignmentLesson({
  lessonId,
  assignment,
  submission,
  onComplete,
}: LearningAssignmentLessonProps) {
  const existingSubmission = isSubmission(submission) ? submission : undefined;
  const [content, setContent] = useState(existingSubmission?.content || "");
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submitAssignment() {
    setMessage(undefined);
    startTransition(async () => {
      const payload = await submitAssignmentAction(lessonId, { content, attachments: [] });
      if (!payload.success) {
        setMessage(payload.error || "Could not submit assignment.");
        return;
      }
      onComplete(lessonId);
      setMessage("Assignment submitted successfully.");
    });
  }

  return (
    <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_18px_48px_rgba(29,32,38,0.06)] lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex size-12 items-center justify-center rounded-[16px] bg-[#EBEBFF] text-[#564FFD]">
            <ClipboardCheck className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[#1D2026]">Assignment</h2>
          <p className="mt-2 max-w-3xl whitespace-pre-line text-sm font-medium leading-6 text-[#4E5566]">
            {assignment?.description || "Complete the assignment and submit your answer below."}
          </p>
        </div>

        {existingSubmission ? (
          <div className="rounded-[18px] bg-[#EAF8EC] px-4 py-3 text-sm font-bold text-[#15803D]">
            Submitted
            {typeof existingSubmission.score === "number" ? ` · ${existingSubmission.score} pts` : ""}
          </div>
        ) : null}
      </div>

      {assignment?.attachments?.length ? (
        <div className="mt-7 grid gap-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Resources</h3>
          {assignment.attachments.map((attachment) => (
            <a
              key={attachment.id || attachment.attachmentUrl || attachment.fileName}
              href={attachment.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm font-semibold text-[#1D2026] transition hover:border-[#D8D6FF] hover:bg-[#F9FAFB]"
            >
              <span>{attachment.fileName || "Assignment resource"}</span>
              <ExternalLink className="size-4 text-[#564FFD]" />
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-7">
        <label htmlFor="assignment-content" className="text-sm font-bold text-[#1D2026]">
          Your submission
        </label>
        <textarea
          id="assignment-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-3 min-h-56 w-full rounded-[18px] border border-[#E9EAF0] px-5 py-4 text-sm font-medium leading-6 text-[#1D2026] outline-none transition focus:border-[#564FFD] focus:ring-4 focus:ring-[#EBEBFF]"
          placeholder="Write your answer, links, repository URL, or explanation here..."
        />
      </div>

      {message ? (
        <div className="mt-5 rounded-[16px] bg-[#F4F3FF] px-4 py-3 text-sm font-semibold text-[#564FFD]">
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={submitAssignment}
        disabled={isPending || !content.trim()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#564FFD] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit assignment
      </button>
    </section>
  );
}
