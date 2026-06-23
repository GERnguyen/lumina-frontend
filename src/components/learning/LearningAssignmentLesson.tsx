"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, ExternalLink, FileText, Loader2, Send, Trash2, UploadCloud } from "lucide-react";
import type { AssignmentLessonResponse } from "@/types/course";
import type { AssignmentSubmissionResponse } from "@/types/learning";
import { getAssignmentSubmissionAction, submitAssignmentAction } from "@/services/actions/learning";
import { PresignedUrlApi } from "@/services/api/user-api";

type LearningAssignmentLessonProps = {
  lessonId: string;
  assignment?: AssignmentLessonResponse;
  submission?: unknown;
  onComplete: (lessonId: string) => void;
};

function isSubmission(value: unknown): value is AssignmentSubmissionResponse {
  return Boolean(value && typeof value === "object" && "id" in value);
}

async function uploadSubmissionFile(file: File) {
  const contentType = file.type || "application/octet-stream";
  const response = await PresignedUrlApi.getPresignedUrl({
    fileName: file.name,
    contentType,
  });

  const presignedUrl = response.data?.presignedUrl;
  const fileKey = response.data?.fileKey;
  if (!presignedUrl || !fileKey) {
    throw new Error(response.message || `Could not prepare upload for ${file.name}.`);
  }

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
      "x-amz-acl": "public-read",
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Could not upload ${file.name}.`);
  }

  return {
    fileKey,
    fileName: file.name,
    fileType: contentType,
    fileSize: Math.max(file.size, 1),
  };
}

function formatFileSize(size?: number) {
  if (!size) return "File";
  if (size < 1024 * 1024) return `${Math.max(size / 1024, 1).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function LearningAssignmentLesson({
  lessonId,
  assignment,
  submission,
}: LearningAssignmentLessonProps) {
  const existingSubmission = isSubmission(submission) ? submission : undefined;
  const [submittedWork, setSubmittedWork] = useState<AssignmentSubmissionResponse | undefined>(existingSubmission);
  const [content, setContent] = useState(existingSubmission?.content || "");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submitAssignment() {
    setMessage(undefined);
    startTransition(async () => {
      if (!files.length) {
        setMessage("Please attach at least one file before submitting.");
        return;
      }

      let attachments;
      try {
        attachments = await Promise.all(files.map(uploadSubmissionFile));
      } catch (error: any) {
        setMessage(error?.message || "Could not upload assignment files.");
        return;
      }

      const payload = await submitAssignmentAction(lessonId, { content: content.trim(), attachments });
      if (!payload.success) {
        setMessage(payload.error || "Could not submit assignment.");
        return;
      }

      const refreshedSubmission = await getAssignmentSubmissionAction(lessonId);
      setSubmittedWork(
        refreshedSubmission.success && refreshedSubmission.data
          ? refreshedSubmission.data
          : {
              id: `submitted-${lessonId}`,
              assignmentId: lessonId,
              content: content.trim(),
              submissionTime: new Date().toISOString(),
              attachments: attachments.map((attachment) => ({
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
              })),
            },
      );
      setFiles([]);
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

        {submittedWork ? (
          <div className="rounded-[18px] bg-[#EAF8EC] px-4 py-3 text-sm font-bold text-[#15803D]">
            Submitted
            {typeof submittedWork.score === "number" ? ` · ${submittedWork.score} pts` : ""}
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

      {submittedWork ? (
        <div className="mt-7 rounded-[18px] border border-[#D8F3DC] bg-[#F6FFF8] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1D2026]">Your submitted work</h3>
              <p className="mt-1 text-xs font-semibold text-[#6E7485]">
                {submittedWork.submissionTime ? `Submitted ${new Date(submittedWork.submissionTime).toLocaleString()}` : "Submission saved"}
              </p>
              {typeof submittedWork.score !== "number" ? (
                <p className="mt-1 text-xs font-semibold text-[#B4690E]">Waiting for instructor grading before this lesson is counted as complete.</p>
              ) : null}
            </div>
            {typeof submittedWork.score === "number" ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#15803D]">{submittedWork.score} pts</span>
            ) : null}
          </div>

          {submittedWork.content ? (
            <div className="mt-4 rounded-[16px] bg-white p-4 text-sm font-medium leading-6 text-[#1D2026]">
              <p className="whitespace-pre-line">{submittedWork.content}</p>
            </div>
          ) : null}

          {submittedWork.attachments?.length ? (
            <div className="mt-4 grid gap-2">
              {submittedWork.attachments.map((attachment, index) => {
                const key = attachment.id || attachment.attachmentUrl || `${attachment.fileName}-${index}`;
                const body = (
                  <>
                    <FileText className="size-4 shrink-0 text-[#564FFD]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1D2026]">{attachment.fileName || "Submitted file"}</p>
                      <p className="text-xs font-medium text-[#8C94A3]">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                    {attachment.attachmentUrl ? <ExternalLink className="size-4 shrink-0 text-[#564FFD]" /> : null}
                  </>
                );

                return attachment.attachmentUrl ? (
                  <a
                    key={key}
                    href={attachment.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-[14px] border border-[#E9EAF0] bg-white px-4 py-3 transition hover:border-[#D8D6FF] hover:bg-[#FCFCFF]"
                  >
                    {body}
                  </a>
                ) : (
                  <div key={key} className="flex items-center gap-3 rounded-[14px] border border-[#E9EAF0] bg-white px-4 py-3">
                    {body}
                  </div>
                );
              })}
            </div>
          ) : null}

          {submittedWork.feedback ? (
            <div className="mt-4 rounded-[16px] bg-white p-4 text-sm font-medium leading-6 text-[#4E5566]">
              <strong className="text-[#1D2026]">Instructor feedback: </strong>
              {submittedWork.feedback}
            </div>
          ) : null}
        </div>
      ) : (
        <>
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

      <div className="mt-5">
        <label className="text-sm font-bold text-[#1D2026]">Submission files</label>
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D8D6FF] bg-[#F8F8FF] px-5 py-8 text-center transition hover:border-[#564FFD] hover:bg-[#F4F3FF]">
          <UploadCloud className="size-8 text-[#564FFD]" />
          <span className="mt-3 text-sm font-bold text-[#1D2026]">Upload assignment files</span>
          <span className="mt-1 text-xs font-medium text-[#6E7485]">PDF, image, source file, or archive. At least one file is required.</span>
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files || []);
              setFiles((current) => [...current, ...nextFiles]);
              event.currentTarget.value = "";
            }}
          />
        </label>

        {files.length ? (
          <div className="mt-3 grid gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-[14px] border border-[#E9EAF0] px-4 py-3">
                <FileText className="size-4 shrink-0 text-[#564FFD]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1D2026]">{file.name}</p>
                  <p className="text-xs font-medium text-[#8C94A3]">{Math.max(file.size / 1024, 1).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                  className="flex size-9 items-center justify-center rounded-full text-[#8C94A3] transition hover:bg-[#FFF0F0] hover:text-[#E34444]"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="mt-5 rounded-[16px] bg-[#F4F3FF] px-4 py-3 text-sm font-semibold text-[#564FFD]">
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={submitAssignment}
        disabled={isPending || !content.trim() || !files.length}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#564FFD] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit assignment
      </button>
        </>
      )}
    </section>
  );
}
