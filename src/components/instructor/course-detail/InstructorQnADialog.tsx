"use client";

import React, { useState, useEffect, useTransition } from "react";
import { User, Calendar, Loader2, Trash2, Send, ThumbsUp, AlertCircle } from "lucide-react";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { getAnswersForQuestionAction, createAnswerAction, deleteAnswerAction, upvoteAnswerAction } from "@/services/actions/social";
import { UserApi } from "@/services/api/user-api";
import type { QuestionDto, AnswerDto } from "@/types";
import { cn } from "@/lib/utils";

interface InstructorQnADialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionDto | null;
  onAnswerAdded?: () => void;
}

export function InstructorQnADialog({ isOpen, onClose, question, onAnswerAdded }: InstructorQnADialogProps) {
  const [answers, setAnswers] = useState<AnswerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; avatarUrl?: string }>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string>();

  // Fetch answers
  const fetchAnswers = async () => {
    if (!question?.id) return;
    setLoading(true);
    setErrorMsg(undefined);
    try {
      const res = await getAnswersForQuestionAction(question.id);
      if (res.success && res.data) {
        setAnswers(res.data);

        // Hydrate usernames
        const userIds = [
          question.userId,
          ...res.data.map((a) => a.userId)
        ].filter(Boolean) as string[];

        hydrateUsers(userIds);
      } else {
        setErrorMsg(res.error || "Không thể tải danh sách phản hồi.");
      }
    } catch (err) {
      console.error("Failed to load answers for instructor Q&A dialog:", err);
      setErrorMsg("Lỗi xảy ra khi tải câu trả lời.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && question?.id) {
      setNewAnswer("");
      fetchAnswers();
    } else {
      setAnswers([]);
    }
  }, [isOpen, question]);

  const hydrateUsers = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    const missingIds = uniqueIds.filter((id) => !userProfiles[id]);
    if (missingIds.length === 0) return;

    try {
      const res = await UserApi.getUsersByIds(missingIds.join(",")).catch(() => undefined);
      const users = res?.data || [];
      const newEntries = users.reduce((acc, user) => {
        if (user.userId) {
          acc[user.userId] = {
            name: user.name || "Cinx learner",
            avatarUrl: user.avatarUrl,
          };
        }
        return acc;
      }, {} as Record<string, { name: string; avatarUrl?: string }>);

      missingIds.forEach((id) => {
        if (!newEntries[id]) {
          newEntries[id] = {
            name: "Cinx learner",
            avatarUrl: undefined,
          };
        }
      });

      setUserProfiles((prev) => ({ ...prev, ...newEntries }));
    } catch (err) {
      console.error("Failed to fetch user profiles inside Q&A dialog:", err);
    }
  };

  const handlePostAnswer = () => {
    if (!question?.id || !newAnswer.trim()) return;

    startTransition(async () => {
      setErrorMsg(undefined);
      const res = await createAnswerAction({
        questionId: question.id!,
        content: newAnswer.trim(),
      });

      if (res.success) {
        setNewAnswer("");
        fetchAnswers();
        onAnswerAdded?.();
      } else {
        setErrorMsg(res.error || "Không thể gửi câu trả lời.");
      }
    });
  };

  const handleDeleteAnswer = async (ansId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;
    try {
      setErrorMsg(undefined);
      const res = await deleteAnswerAction(ansId);
      if (res.success) {
        setAnswers((prev) => prev.filter((a) => a.id !== ansId));
        onAnswerAdded?.();
      } else {
        setErrorMsg(res.error || "Không thể xóa phản hồi.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Lỗi khi xóa phản hồi.");
    }
  };

  const handleUpvoteAnswer = async (ansId: string) => {
    try {
      const res = await upvoteAnswerAction(ansId);
      if (res.success) {
        setAnswers((prev) =>
          prev.map((a) => {
            if (a.id === ansId) {
              const hasUpvoted = !a.hasUpvoted;
              const upvoteCount = (a.upvoteCount || 0) + (hasUpvoted ? 1 : -1);
              return { ...a, hasUpvoted, upvoteCount };
            }
            return a;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (val?: string) => {
    if (!val) return "--";
    try {
      return new Date(val).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return val;
    }
  };

  return (
    <InstructorDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết luồng Q&A"
      description="Xem và quản lý tất cả các câu trả lời từ học viên"
      className="max-w-2xl border-zinc-200 shadow-2xl rounded-xl"
    >
      <div className="space-y-6 pt-2">
        {/* Question Content */}
        {question && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/20 p-4 space-y-3">
            <h3 className="text-base font-extrabold text-zinc-950 leading-snug">{question.title}</h3>
            <p className="text-xs text-zinc-700 font-medium whitespace-pre-wrap leading-relaxed">
              {question.content}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400 border-t border-zinc-100 pt-2.5 uppercase tracking-wider select-none">
              <span className="flex items-center gap-1">
                <User className="size-3 text-zinc-400" />
                {question.userId ? (userProfiles[question.userId]?.name || "Đang tải...") : "Ẩn danh"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(question.createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/50 px-4 py-3 text-xs font-semibold text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Replies Section */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">
            {answers.length} phản hồi
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-zinc-400">
              <Loader2 className="size-6 animate-spin text-primary-500" />
              <p className="text-[10px] font-bold animate-pulse">Đang tải phản hồi...</p>
            </div>
          ) : answers.length === 0 ? (
            <p className="text-xs text-zinc-400 font-medium italic text-center py-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-150">
              Chưa có phản hồi nào cho câu hỏi này.
            </p>
          ) : (
            <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
              {answers.map((answer) => {
                const profile = answer.userId ? userProfiles[answer.userId] : undefined;
                const isInstructor = answer.isInstructorAnswer;

                return (
                  <div
                    key={answer.id}
                    className={cn(
                      "rounded-xl border p-3.5 space-y-2 text-xs relative group",
                      isInstructor
                        ? "bg-primary-50/20 border-primary-200/50"
                        : "bg-white border-zinc-200 hover:bg-zinc-50/30"
                    )}
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-900">{profile?.name || answer.userId || "Cinx Learner"}</span>
                        {isInstructor && (
                          <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-primary-850 tracking-wider">
                            Giảng viên
                          </span>
                        )}
                        <span className="text-zinc-300 font-normal">•</span>
                        <span className="text-zinc-400 font-medium text-[10px]">{formatDate(answer.createdAt)}</span>
                      </div>

                      {/* Delete is allowed for instructor on all posts */}
                      <button
                        onClick={() => handleDeleteAnswer(answer.id!)}
                        className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer opacity-80 hover:opacity-100 select-none"
                        title="Xóa phản hồi"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {answer.content}
                    </p>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpvoteAnswer(answer.id!)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold transition cursor-pointer select-none",
                          answer.hasUpvoted
                            ? "bg-primary-100/50 border-primary-250 text-primary-700"
                            : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650"
                        )}
                      >
                        <ThumbsUp className="size-2.5" />
                        <span>{answer.upvoteCount || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="space-y-3 pt-2.5 border-t border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Viết câu trả lời với tư cách giảng viên</p>
          <div className="relative">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Nhập phản hồi giải đáp thắc mắc của học viên..."
              className="w-full min-h-20 rounded-xl border border-zinc-250 bg-white p-3.5 pr-12 text-xs text-zinc-950 outline-none focus:border-primary-500 leading-relaxed"
            />
            <button
              onClick={handlePostAnswer}
              disabled={isPending || !newAnswer.trim()}
              className="absolute right-3.5 bottom-3.5 flex size-8 items-center justify-center rounded-lg bg-[#564FFD] text-white hover:bg-[#4338CA] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Gửi phản hồi"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </InstructorDialog>
  );
}
