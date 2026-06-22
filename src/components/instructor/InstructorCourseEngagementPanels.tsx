"use client";

import { Award, CheckCircle2, Loader2, MessageCircle, Send, Star, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CertificateService } from "@/services/learningService";
import { CourseQnAService, ReviewService } from "@/services/socialService";
import { cn } from "@/lib/utils";
import type { AnswerDto, CertificateRequestResponse, QuestionDto, ReviewResponse } from "@/types";

type Props = {
  courseId: string;
};

type PendingAction = {
  type: "review" | "question" | "certificate";
  id: string;
};

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function Stars({ value = 0 }: { value?: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={cn("size-4", index < Math.round(value) ? "fill-[#FD8E1F] text-[#FD8E1F]" : "fill-[#E9EAF0] text-[#C6CAD1]")} />
      ))}
    </span>
  );
}

function PanelShell({ title, icon: Icon, children, isLoading }: { title: string; icon: typeof MessageCircle; children: React.ReactNode; isLoading: boolean }) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white">
      <div className="flex h-[58px] items-center justify-between border-b border-[#E9EAF0] px-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
            <Icon className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-[#1D2026]">{title}</h2>
        </div>
        {isLoading ? <Loader2 className="size-4 animate-spin text-[#564FFD]" /> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function InstructorCourseEngagementPanels({ courseId }: Props) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequestResponse[]>([]);
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, AnswerDto[]>>({});
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({});
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction>();
  const [message, setMessage] = useState("");

  const pendingCertificates = useMemo(() => certificates.filter((item) => item.status === "PENDING"), [certificates]);

  async function loadData() {
    setIsLoading(true);
    setMessage("");
    const [reviewsRes, questionsRes, certsRes] = await Promise.all([
      ReviewService.getReviewsByCourseId({ courseId, page: 1, size: 5, sort: '{"createdAt":"DESC"}' }).catch(() => undefined),
      CourseQnAService.getQuestions({ courseId, page: 1, size: 5, sort: '{"createdAt":"DESC"}' }).catch(() => undefined),
      CertificateService.getRequestsByCourse({ courseId, page: 1, size: 5, status: "PENDING" }).catch(() => undefined),
    ]);

    const nextReviews = reviewsRes?.data || [];
    const nextQuestions = questionsRes?.data || [];

    setReviews(nextReviews);
    setQuestions(nextQuestions);
    setCertificates(certsRes?.data || []);
    setReviewReplies(Object.fromEntries(nextReviews.map((review) => [review.id || "", review.reply?.content || ""])));

    const answerEntries = await Promise.all(
      nextQuestions
        .filter((question) => question.id)
        .map(async (question) => {
          const response = await CourseQnAService.getAnswersForQuestion({ questionId: question.id!, page: 1, size: 2, sort: '{"createdAt":"DESC"}' }).catch(() => undefined);
          return [question.id!, response?.data || []] as const;
        }),
    );
    setAnswersByQuestion(Object.fromEntries(answerEntries));
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function saveReviewReply(review: ReviewResponse) {
    if (!review.id) return;
    const content = reviewReplies[review.id]?.trim();
    if (!content) return;
    setPending({ type: "review", id: review.id });
    setMessage("");
    try {
      if (review.reply?.id) {
        await ReviewService.updateReviewReply({ replyId: review.reply.id, body: { content } });
      } else {
        await ReviewService.createReviewReply({ reviewId: review.id, body: { content } });
      }
      setMessage("Review reply saved.");
      await loadData();
    } catch {
      setMessage("Could not save review reply.");
    } finally {
      setPending(undefined);
    }
  }

  async function answerQuestion(question: QuestionDto) {
    if (!question.id) return;
    const content = questionAnswers[question.id]?.trim();
    if (!content) return;
    setPending({ type: "question", id: question.id });
    setMessage("");
    try {
      await CourseQnAService.createAnswer({ body: { questionId: question.id, content } });
      setQuestionAnswers((current) => ({ ...current, [question.id!]: "" }));
      setMessage("Answer posted.");
      await loadData();
    } catch {
      setMessage("Could not post answer.");
    } finally {
      setPending(undefined);
    }
  }

  async function updateCertificate(requestId: string | undefined, action: "approve" | "reject") {
    if (!requestId) return;
    setPending({ type: "certificate", id: requestId });
    setMessage("");
    try {
      if (action === "approve") await CertificateService.approveCertificate({ requestId });
      else await CertificateService.rejectCertificate({ requestId });
      setMessage(action === "approve" ? "Certificate approved." : "Certificate rejected.");
      await loadData();
    } catch {
      setMessage("Could not update certificate request.");
    } finally {
      setPending(undefined);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <PanelShell title="Review Replies" icon={Star} isLoading={isLoading}>
        <div className="space-y-4">
          {reviews.length ? reviews.map((review) => (
            <article key={review.id} className="rounded-[18px] border border-[#E9EAF0] p-4">
              <div className="flex items-center justify-between gap-3">
                <Stars value={review.rating} />
                <span className="text-xs font-semibold text-[#8C94A3]">Student review</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#4E5566]">{review.content || "No review content."}</p>
              <textarea
                value={reviewReplies[review.id || ""] || ""}
                onChange={(event) => setReviewReplies((current) => ({ ...current, [review.id || ""]: event.target.value }))}
                placeholder="Write an instructor reply..."
                className="mt-4 min-h-24 w-full rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm text-[#1D2026] outline-none transition focus:border-[#564FFD]"
              />
              <button
                type="button"
                onClick={() => saveReviewReply(review)}
                disabled={pending?.type === "review" && pending.id === review.id}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#564FFD] px-4 text-sm font-semibold text-white transition hover:bg-[#453FCA] active:scale-[0.98] disabled:opacity-60"
              >
                {pending?.type === "review" && pending.id === review.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {review.reply?.id ? "Update reply" : "Reply"}
              </button>
            </article>
          )) : <p className="rounded-[16px] bg-[#F5F7FA] p-5 text-sm text-[#6E7485]">No reviews yet.</p>}
        </div>
      </PanelShell>

      <PanelShell title="Course Q&A" icon={MessageCircle} isLoading={isLoading}>
        <div className="space-y-4">
          {questions.length ? questions.map((question) => (
            <article key={question.id} className="rounded-[18px] border border-[#E9EAF0] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-2 text-sm font-bold text-[#1D2026]">{question.title || "Untitled question"}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6E7485]">{question.content || "No question content."}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#F5F7FA] px-2.5 py-1 text-xs font-bold text-[#6E7485]">{question.answersCount || 0} answers</span>
              </div>
              {answersByQuestion[question.id || ""]?.length ? (
                <div className="mt-3 space-y-2">
                  {answersByQuestion[question.id || ""].map((answer) => (
                    <p key={answer.id} className={cn("rounded-[14px] px-3 py-2 text-xs leading-5", answer.isInstructorAnswer ? "bg-[#EBEBFF] text-[#342F98]" : "bg-[#F5F7FA] text-[#6E7485]")}>
                      {answer.content}
                    </p>
                  ))}
                </div>
              ) : null}
              <textarea
                value={questionAnswers[question.id || ""] || ""}
                onChange={(event) => setQuestionAnswers((current) => ({ ...current, [question.id || ""]: event.target.value }))}
                placeholder="Answer this question..."
                className="mt-4 min-h-20 w-full rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm text-[#1D2026] outline-none transition focus:border-[#564FFD]"
              />
              <button
                type="button"
                onClick={() => answerQuestion(question)}
                disabled={pending?.type === "question" && pending.id === question.id}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#564FFD] px-4 text-sm font-semibold text-white transition hover:bg-[#453FCA] active:scale-[0.98] disabled:opacity-60"
              >
                {pending?.type === "question" && pending.id === question.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Post answer
              </button>
            </article>
          )) : <p className="rounded-[16px] bg-[#F5F7FA] p-5 text-sm text-[#6E7485]">No course questions yet.</p>}
        </div>
      </PanelShell>

      <PanelShell title="Certificate Requests" icon={Award} isLoading={isLoading}>
        <div className="space-y-4">
          {pendingCertificates.length ? pendingCertificates.map((certificate) => (
            <article key={certificate.id} className="rounded-[18px] border border-[#E9EAF0] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#1D2026]">Student request</p>
                  <p className="mt-1 text-xs text-[#8C94A3]">Requested {formatDate(certificate.requestedAt)}</p>
                </div>
                <span className="rounded-full bg-[#FFF4E5] px-2.5 py-1 text-xs font-bold text-[#B4690E]">{certificate.status}</span>
              </div>
              <p className="mt-3 break-all text-xs leading-5 text-[#6E7485]">User ID: {certificate.userId || "Unknown"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateCertificate(certificate.id, "approve")}
                  disabled={pending?.type === "certificate" && pending.id === certificate.id}
                  className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#23BD33] px-4 text-sm font-semibold text-white transition hover:bg-[#159947] active:scale-[0.98] disabled:opacity-60"
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateCertificate(certificate.id, "reject")}
                  disabled={pending?.type === "certificate" && pending.id === certificate.id}
                  className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#FFF0F0] px-4 text-sm font-semibold text-[#E34444] transition hover:bg-[#FFE1E1] active:scale-[0.98] disabled:opacity-60"
                >
                  <XCircle className="size-4" />
                  Reject
                </button>
              </div>
            </article>
          )) : <p className="rounded-[16px] bg-[#F5F7FA] p-5 text-sm text-[#6E7485]">No pending certificate requests.</p>}
          {message ? <p className="rounded-[14px] bg-[#F8F8FF] px-4 py-3 text-sm font-semibold text-[#564FFD]">{message}</p> : null}
        </div>
      </PanelShell>
    </section>
  );
}
