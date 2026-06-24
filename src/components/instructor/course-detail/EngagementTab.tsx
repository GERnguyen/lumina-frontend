import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, HelpCircle, MessageSquare, Star } from "lucide-react";
import { UserApi } from "@/services/api/user-api";
import type { ReviewResponse, QuestionDto, CertificateRequestResponse } from "@/types";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { Button } from "@/components/ui/Button";
import { Textarea, DataTableEmptyState } from "@/components/ui/shared";
import { InstructorQnADialog } from "./InstructorQnADialog";

interface EngagementData {
  reviews: ReviewResponse[];
  questions: QuestionDto[];
  certificateRequests: CertificateRequestResponse[];
}

interface EngagementTabProps {
  courseId?: string;
  data: EngagementData;
}

export function EngagementTab({ courseId, data }: EngagementTabProps) {
  const router = useRouter();
  const [target, setTarget] = useState<{ type: "review" | "question"; id: string; review?: ReviewResponse } | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; avatarUrl?: string }>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDto | null>(null);

  useEffect(() => {
    async function hydrateUsers() {
      const reviewUserIds = (data.reviews || []).map((r) => r.userId);
      const questionUserIds = (data.questions || []).map((q) => q.userId);
      const certUserIds = (data.certificateRequests || []).map((c) => c.userId);

      const allUserIds = Array.from(new Set([...reviewUserIds, ...questionUserIds, ...certUserIds].filter(Boolean))) as string[];
      if (!allUserIds.length) return;

      const missingIds = allUserIds.filter((id) => !userProfiles[id]);
      if (!missingIds.length) return;

      try {
        const res = await UserApi.getUsersByIds(missingIds.join(",")).catch(() => undefined);
        const users = res?.data || [];
        const newEntries = users.reduce((acc, user) => {
          if (user.userId) {
            acc[user.userId] = {
              name: user.name || "Lumina learner",
              avatarUrl: user.avatarUrl,
            };
          }
          return acc;
        }, {} as Record<string, { name: string; avatarUrl?: string }>);

        // Fallback for any IDs that weren't returned by the API
        missingIds.forEach((id) => {
          if (!newEntries[id]) {
            newEntries[id] = {
              name: "Lumina learner",
              avatarUrl: undefined,
            };
          }
        });

        setUserProfiles((current) => ({ ...current, ...newEntries }));
      } catch (err) {
        console.error("Failed to fetch reviewer profiles in engagement tab:", err);
      }
    }

    hydrateUsers();
  }, [data.reviews, data.questions, data.certificateRequests]);

  const submitText = async () => {
    if (!courseId || !target) return;
    setSaving(true);
    try {
      await fetch(`/api/instructor/courses/${courseId}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          target.type === "review"
            ? { action: "save-review-reply", review: target.review, content }
            : { action: "answer-question", questionId: target.id, content }
        ),
      });
      setTarget(null);
      setContent("");
      router.refresh();
    } catch (err) {
      console.error("Failed to submit engagement response:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateCertificate = async (requestId: string, certificateAction: "approve" | "reject") => {
    if (!courseId) return;
    try {
      await fetch(`/api/instructor/courses/${courseId}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-certificate", requestId, certificateAction }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update certificate request status:", err);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Review list */}
        <InstructorCard
          title="Đánh giá của học viên"
          subtitle={`${data.reviews.length} đánh giá gần đây`}
          className="border-zinc-200/50 shadow-xs"
          bodyClassName="space-y-4 max-h-[600px] overflow-y-auto pr-1"
        >
          {data.reviews.length === 0 ? (
            <DataTableEmptyState
              icon={Star}
              title="Chưa có đánh giá"
              description="Đánh giá và cảm nhận của học viên sẽ hiển thị tại đây."
            />
          ) : (
            data.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-zinc-150 bg-zinc-50/30 p-4 hover:bg-white hover:border-zinc-200 hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                  <p className="text-xs font-bold text-zinc-950 font-general">
                    {review.userId ? (userProfiles[review.userId]?.name || "Loading...") : "Học viên ẩn danh"}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                    <Star className="size-3 mr-0.5 fill-amber-500 text-amber-500" />
                    {review.rating || 0}/5
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-700 leading-relaxed font-medium">{review.content || "--"}</p>

                {review.reply ? (
                  <div className="mt-3.5 rounded-lg bg-primary-50/50 border border-primary-100/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary-750">Phản hồi của bạn</p>
                    <p className="mt-1 text-xs text-primary-950 font-medium leading-relaxed">{review.reply.content}</p>
                  </div>
                ) : null}

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={() => {
                      setTarget({ type: "review", id: review.id || "", review });
                      setContent(review.reply?.content || "");
                    }}
                  >
                    <MessageSquare className="size-3.5 mr-1 shrink-0" />
                    {review.reply ? "Chỉnh sửa phản hồi" : "Phản hồi đánh giá"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </InstructorCard>

        {/* Q&A list */}
        <InstructorCard
          title="Hỏi & Đáp (Q&A)"
          subtitle={`${data.questions.length} câu hỏi gần đây`}
          className="border-zinc-200/50 shadow-xs"
          bodyClassName="space-y-4 max-h-[600px] overflow-y-auto pr-1"
        >
          {data.questions.length === 0 ? (
            <DataTableEmptyState
              icon={HelpCircle}
              title="Chưa có câu hỏi"
              description="Câu hỏi của học viên trong bài học sẽ xuất hiện ở đây."
            />
          ) : (
            data.questions.map((question) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className="rounded-xl border border-zinc-150 bg-zinc-50/30 p-4 hover:bg-white hover:border-zinc-200 hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <p className="text-sm font-extrabold text-zinc-950 leading-snug">{question.title || "Câu hỏi không tiêu đề"}</p>
                <p className="mt-2 text-xs text-zinc-600 line-clamp-3 leading-relaxed font-medium">{question.content || "--"}</p>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-[10px] font-bold text-zinc-400">
                    {question.answersCount || 0} câu trả lời · {formatDate(question.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuestion(question);
                    }}
                  >
                    <MessageSquare className="size-3.5 mr-1 shrink-0" />
                    Xem & Trả lời
                  </Button>
                </div>
              </div>
            ))
          )}
        </InstructorCard>

        {/* Certificate Request list */}
        <InstructorCard
          title="Yêu cầu cấp chứng chỉ"
          subtitle={`${data.certificateRequests.length} yêu cầu đang xử lý`}
          className="border-zinc-200/50 shadow-xs"
          bodyClassName="space-y-4 max-h-[600px] overflow-y-auto pr-1"
        >
          {data.certificateRequests.length === 0 ? (
            <DataTableEmptyState
              icon={Award}
              title="Chưa có yêu cầu"
              description="Yêu cầu cấp chứng nhận hoàn thành khóa học của học viên."
            />
          ) : (
            data.certificateRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-zinc-150 bg-zinc-50/30 p-4 hover:bg-white hover:border-zinc-200 hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                  <p className="text-xs font-bold text-zinc-950 font-general">
                    {request.userId ? (userProfiles[request.userId]?.name || "Loading...") : "Học viên ẩn danh"}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                      request.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200/50"
                        : request.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                        : "bg-red-50 text-red-700 border-red-200/50"
                    }`}
                  >
                    {request.status || "--"}
                  </span>
                </div>
                <p className="mt-2.5 text-xs font-semibold text-zinc-400">
                  Ngày yêu cầu: {formatDate(request.requestedAt)}
                </p>

                {request.status === "PENDING" ? (
                  <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 rounded-lg w-full transition-all"
                      onClick={() => request.id && updateCertificate(request.id, "approve")}
                    >
                      Duyệt cấp
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs font-bold bg-red-50 text-red-650 hover:bg-red-100/70 border border-red-200 rounded-lg w-full transition-all"
                      onClick={() => request.id && updateCertificate(request.id, "reject")}
                    >
                      Từ chối
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </InstructorCard>
      </div>

      {/* Engagement Response Dialog */}
      <InstructorDialog
        isOpen={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target?.type === "review" ? "Phản hồi đánh giá học viên" : "Gửi câu trả lời hỏi đáp"}
        className="border-zinc-200 shadow-2xl rounded-xl"
      >
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung phản hồi của bạn..."
            rows={5}
            className="border-zinc-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl"
          />
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
            <InstructorButton variant="ghost" onClick={() => setTarget(null)} className="rounded-lg text-zinc-500">
              Hủy
            </InstructorButton>
            <InstructorButton
              loading={saving}
              onClick={submitText}
              disabled={!content.trim()}
              className="rounded-lg shadow-sm"
            >
              Gửi phản hồi
            </InstructorButton>
          </div>
        </div>
      </InstructorDialog>

      {/* Q&A Thread Management Dialog */}
      <InstructorQnADialog
        isOpen={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion}
        onAnswerAdded={() => {
          router.refresh();
        }}
      />
    </>
  );
}
