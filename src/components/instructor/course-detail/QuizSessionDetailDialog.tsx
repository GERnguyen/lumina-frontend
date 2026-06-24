"use client";

import React, { useState, useEffect, useTransition } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2, HelpCircle, Save } from "lucide-react";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { getQuizSessionQuestionsAction, gradeQuizEssayAction } from "@/services/actions/learning";
import type { QuizSessionResponse, QuizSessionQuestionResponse, EssayQuestionScore } from "@/types";

interface QuizSessionDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: QuizSessionResponse | null;
  studentName: string;
  studentEmail?: string;
  onGradeSuccess?: () => void;
}

function decodeJsonArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [String(parsed)];
  } catch {
    return [value];
  }
}

interface MatchItem {
  optionId: string;
  matchText: string;
}

function decodeMatches(value?: string): MatchItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function QuizSessionDetailDialog({
  isOpen,
  onClose,
  session,
  studentName,
  studentEmail,
  onGradeSuccess,
}: QuizSessionDetailDialogProps) {
  const [questions, setQuestions] = useState<QuizSessionQuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string>();

  // Fetch session questions when dialog opens/session changes
  useEffect(() => {
    if (!isOpen || !session?.id) {
      setQuestions([]);
      setEssayScores({});
      setErrorMsg(undefined);
      return;
    }

    async function fetchQuestions() {
      setLoading(true);
      setErrorMsg(undefined);
      try {
        const payload = await getQuizSessionQuestionsAction(session!.id!);
        if (payload.success && payload.data) {
          setQuestions(payload.data);
          
          // Pre-populate essay scores if already graded
          const initialScores: Record<string, number> = {};
          payload.data.forEach((q) => {
            if (q.questionType === "ESSAY" && q.id && typeof q.score === "number") {
              initialScores[q.id] = q.score;
            }
          });
          setEssayScores(initialScores);
        } else {
          setErrorMsg(payload.error || "Không thể tải chi tiết câu hỏi.");
        }
      } catch (err) {
        console.error("Failed to load quiz session questions:", err);
        setErrorMsg("Có lỗi xảy ra khi tải chi tiết câu hỏi.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [isOpen, session]);

  const handleGradeEssay = () => {
    if (!session?.id) return;
    setErrorMsg(undefined);
    
    // Format payload for grading
    const scoresArray: EssayQuestionScore[] = Object.entries(essayScores).map(([qId, scoreVal]) => ({
      questionId: qId,
      score: scoreVal,
    }));

    startTransition(async () => {
      try {
        const payload = await gradeQuizEssayAction(session.id!, { scores: scoresArray });
        if (payload.success) {
          onGradeSuccess?.();
          onClose();
        } else {
          setErrorMsg(payload.error || "Không thể lưu điểm chấm.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Lỗi khi gửi kết quả chấm.");
      }
    });
  };

  const hasEssayQuestions = questions.some((q) => q.questionType === "ESSAY");
  const isPendingGrade = session?.status === "PENDING_GRADE";

  return (
    <InstructorDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết bài làm Quiz"
      description={`Học viên: ${studentName} (${studentEmail || "Chưa có email"})`}
      className="max-w-3xl border-zinc-200 shadow-2xl rounded-xl"
    >
      <div className="space-y-6 pt-2">
        {/* Attempt overview summary */}
        {session && (
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 sm:grid-cols-4 text-xs">
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider">Trạng thái</p>
              <span
                className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  session.status === "GRADED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                    : session.status === "SUBMITTED"
                      ? "bg-primary-50 text-primary-700 border-primary-200/50"
                      : session.status === "PENDING_GRADE"
                        ? "bg-amber-50 text-amber-700 border-amber-200/50"
                        : "bg-zinc-100 text-zinc-500 border-zinc-200"
                }`}
              >
                {session.status === "GRADED"
                  ? "Đã chấm"
                  : session.status === "SUBMITTED"
                    ? "Đã nộp"
                    : session.status === "PENDING_GRADE"
                      ? "Chờ chấm tự luận"
                      : "Đang làm"}
              </span>
            </div>
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider">Điểm số</p>
              <p className="mt-1.5 text-base font-extrabold text-zinc-900 font-general">
                {typeof session.quizSessionSubmission?.score === "number"
                  ? `${session.quizSessionSubmission.score.toFixed(1)} / 10`
                  : "-- / 10"}
              </p>
            </div>
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider">Số câu đúng</p>
              <p className="mt-1.5 text-base font-extrabold text-zinc-900 font-general">
                {typeof session.quizSessionSubmission?.totalCorrectAnswers === "number"
                  ? `${session.quizSessionSubmission.totalCorrectAnswers} / ${questions.length}`
                  : "--"}
              </p>
            </div>
            <div>
              <p className="font-bold text-zinc-400 uppercase tracking-wider">Thời gian nộp</p>
              <p className="mt-1.5 text-zinc-700 font-medium leading-normal">
                {session.endTime
                  ? new Date(session.endTime).toLocaleString("vi-VN")
                  : session.startTime
                    ? new Date(session.startTime).toLocaleString("vi-VN")
                    : "--"}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Questions list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400">
            <Loader2 className="size-8 animate-spin text-primary-500" />
            <p className="text-sm font-bold animate-pulse">Đang tải chi tiết bài làm...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-zinc-200">
            <HelpCircle className="size-8 mx-auto text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-400 font-medium">Không tìm thấy thông tin câu hỏi.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {questions.map((question, index) => {
              const isCorrect = typeof question.score === "number" ? question.score > 0 : false;
              const userAnsList = decodeJsonArray(question.userAnswer);
              const correctAnsList = decodeJsonArray(question.correctAnswer);
              const isEssay = question.questionType === "ESSAY";

              return (
                <div key={question.id || index} className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Câu {index + 1} • {question.questionType}
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-zinc-900 leading-relaxed">
                        {question.questionText}
                      </h4>
                    </div>
                    {!isEssay && (
                      <span className={`shrink-0 flex items-center gap-1 text-xs font-bold ${
                        isCorrect ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="size-4 shrink-0" />
                            Đúng
                          </>
                        ) : (
                          <>
                            <XCircle className="size-4 shrink-0" />
                            Sai
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Question Answers Details based on types */}
                  {question.questionType === "MATCHING" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-zinc-400">Kết quả ghép đôi của học viên:</p>
                      {(() => {
                        const studentMatches = decodeMatches(question.userAnswer);
                        const correctMatches = decodeMatches(question.correctAnswer);
                        const leftOptions = (question.options || []).filter((o) => o.side !== "RIGHT");
                        
                        return (
                          <div className="grid gap-2">
                            {leftOptions.map((leftOpt) => {
                              const leftOptId = leftOpt.id || "";
                              const studentMatchText = studentMatches.find((m) => m.optionId === leftOptId)?.matchText || "(Chưa chọn)";
                              const correctMatchText = correctMatches.find((m) => m.optionId === leftOptId)?.matchText || "";
                              const isMatchCorrect = studentMatchText === correctMatchText;

                              return (
                                <div key={leftOptId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-zinc-150 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-semibold text-zinc-800 shrink-0">{leftOpt.optionText}</span>
                                    <span className="text-zinc-400">→</span>
                                    <span className={`px-2 py-0.5 rounded font-bold truncate ${
                                      isMatchCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                    }`}>
                                      {studentMatchText}
                                    </span>
                                  </div>
                                  {!isMatchCorrect && (
                                    <span className="text-zinc-450 text-[10px] font-semibold">
                                      Đáp án đúng: <strong className="text-emerald-600 font-bold">{correctMatchText}</strong>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : question.questionType === "ORDERING" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-zinc-400 font-medium">Thứ tự sắp xếp của học viên:</p>
                      <div className="space-y-1.5">
                        {userAnsList.map((optId, idx) => {
                          const optionObj = (question.options || []).find((o) => (o.id || o.optionText) === optId);
                          const correctOptId = correctAnsList[idx];
                          const isPosCorrect = optId === correctOptId;

                          return (
                            <div key={optId} className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-medium ${
                              isPosCorrect ? "border-emerald-250 bg-emerald-50/20 text-emerald-800" : "border-red-200 bg-red-50/20 text-red-800"
                            }`}>
                              <span className="font-bold font-general shrink-0">{idx + 1}.</span>
                              <span className="flex-1 truncate">{optionObj?.optionText || optId}</span>
                              <span className="shrink-0">
                                {isPosCorrect ? (
                                  <CheckCircle2 className="size-4 text-emerald-600" />
                                ) : (
                                  <span className="text-[10px] font-bold text-zinc-400">
                                    (Vị trí đúng: {correctAnsList.indexOf(optId) + 1})
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (question.questionType === "SINGLE_CHOICE" || question.questionType === "MULTI_CHOICE") ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-zinc-400">Danh sách lựa chọn:</p>
                      <div className="grid gap-2">
                        {(question.options || []).map((option) => {
                          const optionId = option.id || "";
                          const isSelected = userAnsList.includes(optionId);
                          const isCorrectOpt = correctAnsList.includes(optionId);
                          
                          let cardStyle = "border-zinc-200 bg-white text-zinc-700";
                          let badgeText = "";
                          let badgeStyle = "";

                          if (isSelected && isCorrectOpt) {
                            cardStyle = "border-emerald-350 bg-emerald-50/40 text-emerald-950 font-semibold";
                            badgeText = "Học viên chọn & Chính xác";
                            badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
                          } else if (isSelected && !isCorrectOpt) {
                            cardStyle = "border-red-300 bg-red-50/40 text-red-950 font-semibold";
                            badgeText = "Học viên chọn - Sai";
                            badgeStyle = "bg-red-100 text-red-800 border-red-200";
                          } else if (!isSelected && isCorrectOpt) {
                            cardStyle = "border-emerald-200 border-dashed bg-zinc-50/30 text-zinc-800";
                            badgeText = "Đáp án đúng";
                            badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                          }

                          return (
                            <div key={optionId} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-xs leading-normal transition-all ${cardStyle}`}>
                              <span>{option.optionText}</span>
                              {badgeText && (
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                  {badgeText}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : question.questionType === "SHORT_TEXT" ? (
                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/30">
                        <p className="font-bold text-zinc-450 uppercase text-[9px]">Câu trả lời của học viên</p>
                        <p className="mt-1 text-zinc-800 font-medium">{userAnsList[0] || "(Bỏ trống)"}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 p-3 bg-emerald-50/10">
                        <p className="font-bold text-emerald-600 uppercase text-[9px]">Đáp án đúng</p>
                        <p className="mt-1 text-emerald-950 font-semibold">{correctAnsList[0] || "--"}</p>
                      </div>
                    </div>
                  ) : question.questionType === "ESSAY" ? (
                    <div className="space-y-3 text-xs">
                      <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/30">
                        <p className="font-bold text-zinc-450 uppercase text-[9px]">Bài viết của học viên</p>
                        <p className="mt-2 text-zinc-800 whitespace-pre-wrap leading-relaxed font-medium">
                          {userAnsList[0] || "(Bỏ trống)"}
                        </p>
                      </div>

                      {question.correctAnswer && (
                        <div className="rounded-lg border border-zinc-150 p-3 bg-white">
                          <p className="font-bold text-zinc-450 uppercase text-[9px]">Hướng dẫn chấm điểm</p>
                          <p className="mt-1.5 text-zinc-650 leading-relaxed font-medium">
                            {question.correctAnswer}
                          </p>
                        </div>
                      )}

                      {/* Grading interface */}
                      <div className="rounded-lg border border-primary-100 bg-primary-50/10 p-3.5 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <label className="font-bold text-primary-950" htmlFor={`score-${question.id}`}>
                            Điểm cho câu tự luận này (Thang điểm: 0 - 10)
                          </label>
                          <input
                            id={`score-${question.id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            disabled={!isPendingGrade && session?.status !== "GRADED"}
                            value={typeof essayScores[question.id || ""] !== "undefined" ? essayScores[question.id || ""] : ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setEssayScores((prev) => ({
                                ...prev,
                                [question.id || ""]: isNaN(val) ? 0 : val,
                              }));
                            }}
                            className="w-24 rounded-lg border border-zinc-250 bg-white px-2.5 py-1 text-center font-bold text-zinc-950 outline-none focus:border-primary-500"
                            placeholder="e.g. 8.5"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer actions for grading */}
        {hasEssayQuestions && isPendingGrade && questions.length > 0 && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4.5">
            <InstructorButton
              variant="ghost"
              onClick={onClose}
              className="rounded-lg text-zinc-500 hover:bg-zinc-100"
            >
              Hủy
            </InstructorButton>
            <InstructorButton
              loading={isPending}
              onClick={handleGradeEssay}
              className="rounded-lg shadow-sm font-bold flex items-center gap-1"
            >
              <Save className="size-4" />
              Lưu & Hoàn thành chấm
            </InstructorButton>
          </div>
        )}
      </div>
    </InstructorDialog>
  );
}
