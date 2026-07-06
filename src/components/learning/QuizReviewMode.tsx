"use client";

import { ArrowLeft, Check, CheckCircle2, AlertCircle, X } from "lucide-react";
import type { QuizSessionQuestionResponse, QuizSessionResponse } from "@/types/learning";
import { cn } from "@/lib/utils";

type QuizReviewModeProps = {
  session: QuizSessionResponse;
  questions: QuizSessionQuestionResponse[];
  onExit: () => void;
  title?: string;
};

type MatchingAnswer = Array<{ optionId: string; matchText: string }>;

export function QuizReviewMode({ session, questions, onExit, title }: QuizReviewModeProps) {
  const score = session.quizSessionSubmission?.score;
  const isPassed = typeof score === "number" ? score >= 5 : false;

  function decodeJsonAnswer(answerStr?: string): any {
    if (!answerStr) return null;
    try {
      return JSON.parse(answerStr);
    } catch {
      return answerStr;
    }
  }

  function getDecodeArray(answerStr?: string): string[] {
    const decoded = decodeJsonAnswer(answerStr);
    if (Array.isArray(decoded)) return decoded.map(String);
    if (typeof decoded === "string") return [decoded];
    return [];
  }

  function getDecodeMatching(answerStr?: string): MatchingAnswer {
    const decoded = decodeJsonAnswer(answerStr);
    return Array.isArray(decoded) ? decoded : [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E9EAF0] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="flex size-11 items-center justify-center rounded-full border border-[#E9EAF0] bg-white text-[#1D2026] transition hover:bg-[#F5F7FA] hover:text-[#564FFD]"
            aria-label="Back to quiz attempts"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#1D2026]">Review Attempt</h2>
            <p className="text-sm font-medium text-[#6E7485]">
              {title || "Quiz Review"} • {session.endTime ? new Date(session.endTime).toLocaleString() : "Date unknown"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-[18px] border border-[#E9EAF0] bg-[#F9FAFB] px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C94A3]">Final Score</p>
            <p className={cn("text-xl font-black mt-1", isPassed ? "text-[#16A34A]" : "text-[#E34444]")}>
              {typeof score === "number" ? score.toFixed(1) : "--"} / 10
            </p>
          </div>
          <div className="rounded-[18px] border border-[#E9EAF0] bg-[#F9FAFB] px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C94A3]">Result</p>
            <div className="mt-1 flex items-center gap-1.5 justify-center">
              {isPassed ? (
                <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                  <CheckCircle2 className="size-3.5" /> Passed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                  <X className="size-3.5" /> Failed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((question, idx) => {
          const userAnsArr = getDecodeArray(question.userAnswer);
          const correctAnsArr = getDecodeArray(question.correctAnswer);
          const isCorrect = typeof question.score === "number" && question.score > 0;
          
          return (
            <div
              key={question.id || idx}
              className={cn(
                "rounded-[20px] border p-6 transition duration-300 bg-white",
                isCorrect ? "border-green-100 shadow-[0_4px_16px_rgba(22,163,74,0.02)]" : "border-red-100 shadow-[0_4px_16px_rgba(227,68,68,0.02)]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Question {idx + 1}</span>
                  <h3 className="mt-2 text-lg font-bold text-[#1D2026]">{question.questionText || "Untitled question"}</h3>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold leading-5",
                    isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}>
                    {isCorrect ? `Correct (+${question.score})` : `Incorrect (${question.score || 0})`}
                  </span>
                  <p className="mt-1 text-[10px] text-[#8C94A3] font-semibold uppercase">{question.questionType}</p>
                </div>
              </div>

              {/* Single Choice / Radio buttons review */}
              {(question.questionType === "SINGLE_CHOICE" || !question.questionType) && (
                <div className="mt-5 space-y-3">
                  {(question.options || []).map((option) => {
                    const optionId = option.id || "";
                    const isSelected = userAnsArr.includes(optionId);
                    const isCorrectOption = correctAnsArr.includes(optionId);

                    return (
                      <div
                        key={optionId}
                        className={cn(
                          "flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium",
                          isSelected && isCorrectOption
                            ? "border-green-300 bg-green-50/50 text-green-900"
                            : isSelected && !isCorrectOption
                            ? "border-red-300 bg-red-50/50 text-red-900"
                            : isCorrectOption
                            ? "border-green-200 bg-green-50/20 text-green-800"
                            : "border-[#E9EAF0] text-[#1D2026]"
                        )}
                      >
                        <input
                          type="radio"
                          disabled
                          checked={isSelected}
                          className="size-4 accent-[#564FFD] opacity-60"
                        />
                        <span className="flex-1">{option.optionText}</span>
                        {isSelected && isCorrectOption && <Check className="size-4 text-green-600 shrink-0" />}
                        {isSelected && !isCorrectOption && <X className="size-4 text-red-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Multi Choice review */}
              {question.questionType === "MULTI_CHOICE" && (
                <div className="mt-5 space-y-3">
                  {(question.options || []).map((option) => {
                    const optionId = option.id || "";
                    const isSelected = userAnsArr.includes(optionId);
                    const isCorrectOption = correctAnsArr.includes(optionId);

                    return (
                      <div
                        key={optionId}
                        className={cn(
                          "flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium",
                          isSelected && isCorrectOption
                            ? "border-green-300 bg-green-50/50 text-green-900"
                            : isSelected && !isCorrectOption
                            ? "border-red-300 bg-red-50/50 text-red-900"
                            : isCorrectOption
                            ? "border-green-200 bg-green-50/20 text-green-800"
                            : "border-[#E9EAF0] text-[#1D2026]"
                        )}
                      >
                        <input
                          type="checkbox"
                          disabled
                          checked={isSelected}
                          className="size-4 accent-[#564FFD] opacity-60"
                        />
                        <span className="flex-1">{option.optionText}</span>
                        {isSelected && isCorrectOption && <Check className="size-4 text-green-600 shrink-0" />}
                        {isSelected && !isCorrectOption && <X className="size-4 text-red-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Text review */}
              {question.questionType === "SHORT_TEXT" && (
                <div className="mt-5 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#8C94A3] uppercase font-general">Your Answer</p>
                    <p className="mt-1 rounded-[14px] border border-[#E9EAF0] bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1D2026]">
                      {userAnsArr[0] || "(Empty answer)"}
                    </p>
                  </div>
                  {correctAnsArr[0] && (
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase font-general">Correct Answer</p>
                      <p className="mt-1 rounded-[14px] border border-green-200 bg-green-50/20 px-4 py-3 text-sm font-semibold text-green-800">
                        {correctAnsArr[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Essay review */}
              {question.questionType === "ESSAY" && (
                <div className="mt-5 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#8C94A3] uppercase font-general">Your Submission</p>
                    <p className="mt-1 rounded-[14px] border border-[#E9EAF0] bg-gray-50 px-4 py-3 text-sm whitespace-pre-wrap text-[#1D2026]">
                      {userAnsArr[0] || "(No submission)"}
                    </p>
                  </div>
                </div>
              )}

              {/* Ordering review */}
              {question.questionType === "ORDERING" && (
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-bold text-[#8C94A3] uppercase font-general">Your Order</p>
                  {userAnsArr.map((optionId, oIdx) => {
                    const option = (question.options || []).find((o) => (o.id || o.optionText) === optionId);
                    const correctOptionId = correctAnsArr[oIdx];
                    const isCorrectPos = optionId === correctOptionId;

                    return (
                      <div
                        key={optionId}
                        className={cn(
                          "flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium",
                          isCorrectPos
                            ? "border-green-300 bg-green-50/50 text-green-900"
                            : "border-red-300 bg-red-50/50 text-red-900"
                        )}
                      >
                        <span className="grid size-6 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">{oIdx + 1}</span>
                        <span className="flex-1">{option?.optionText || optionId}</span>
                        {isCorrectPos ? (
                          <Check className="size-4 text-green-600 shrink-0" />
                        ) : (
                          <span className="text-xs text-red-600 font-bold shrink-0">
                            (Correct was: {(question.options || []).find((o) => (o.id || o.optionText) === correctOptionId)?.optionText || correctOptionId})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Matching review */}
              {question.questionType === "MATCHING" && (
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-bold text-[#8C94A3] uppercase font-general">Your Matchings</p>
                  {((question.options || []).filter(o => o.side !== "RIGHT")).map((option) => {
                    const optionId = option.id || "";
                    const userMatchVal = getDecodeMatching(question.userAnswer).find(m => m.optionId === optionId)?.matchText || "";
                    const correctMatchVal = getDecodeMatching(question.correctAnswer).find(m => m.optionId === optionId)?.matchText || "";
                    const isMatchCorrect = userMatchVal === correctMatchVal;

                    return (
                      <div
                        key={optionId}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium",
                          isMatchCorrect
                            ? "border-green-300 bg-green-50/50 text-green-900"
                            : "border-red-300 bg-red-50/50 text-red-900"
                        )}
                      >
                        <span className="flex-1 bg-white border border-[#E9EAF0] px-3 py-2 rounded-lg">{option.optionText}</span>
                        <span className="text-gray-400 text-center sm:rotate-0 rotate-90">&rarr;</span>
                        <span className="flex-1 bg-white border border-[#E9EAF0] px-3 py-2 rounded-lg">{userMatchVal || "(No match)"}</span>
                        {!isMatchCorrect && (
                          <span className="text-xs text-red-600 font-bold sm:ml-4">
                            (Correct was: {correctMatchVal || "None"})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#E9EAF0] pt-6">
        <button
          type="button"
          onClick={onExit}
          className="w-full sm:w-auto rounded-full bg-[#1D2026] px-6 py-3 text-sm font-bold text-white transition hover:bg-black"
        >
          Exit Review
        </button>
      </div>
    </div>
  );
}
