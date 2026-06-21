"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, HelpCircle, Loader2, Send, Trophy, X } from "lucide-react";
import type { QuizLessonResponse } from "@/types/course";
import type { QuizSessionQuestionResponse, QuizSessionResponse } from "@/types/learning";
import {
  chooseQuizAnswerAction,
  createQuizSessionAction,
  getQuizSessionQuestionsAction,
  getQuizSessionsAction,
  submitQuizSessionAction,
} from "@/services/actions/learning";
import { cn } from "@/lib/utils";

type LearningQuizLessonProps = {
  courseId: string;
  lessonId: string;
  quiz?: QuizLessonResponse;
  onComplete: (lessonId: string) => void;
};

type MatchingAnswer = Array<{ optionId: string; matchText: string }>;
type QuizAnswerValue = string | string[] | MatchingAnswer;

export function LearningQuizLesson({ courseId, lessonId, quiz, onComplete }: LearningQuizLessonProps) {
  const [session, setSession] = useState<QuizSessionResponse>();
  const [questions, setQuestions] = useState<QuizSessionQuestionResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [message, setMessage] = useState<string>();
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function getRequestQuestionId(question: QuizSessionQuestionResponse) {
    return question.questionId || question.id || "";
  }

  function getDefaultAnswer(question: QuizSessionQuestionResponse): QuizAnswerValue {
    if (question.questionType === "ORDERING") return (question.options || []).map((option) => option.id || option.optionText || "").filter(Boolean);
    if (question.questionType === "MULTI_CHOICE") return [];
    if (question.questionType === "MATCHING") return [];
    return "";
  }

  function encodeUserAnswer(question: QuizSessionQuestionResponse, answer: QuizAnswerValue) {
    if (question.questionType === "MATCHING") return JSON.stringify(Array.isArray(answer) ? answer : []);
    if (question.questionType === "ORDERING" || question.questionType === "MULTI_CHOICE") return JSON.stringify(Array.isArray(answer) ? answer : []);
    return JSON.stringify([String(answer || "")]);
  }

  function decodeUserAnswer(question: QuizSessionQuestionResponse, answer?: string): QuizAnswerValue {
    if (!answer) return getDefaultAnswer(question);
    try {
      const parsed = JSON.parse(answer);
      if (question.questionType === "MATCHING") return Array.isArray(parsed) ? parsed : [];
      if (question.questionType === "ORDERING" || question.questionType === "MULTI_CHOICE") return Array.isArray(parsed) ? parsed.map(String) : [];
      return Array.isArray(parsed) ? String(parsed[0] || "") : answer;
    } catch {
      return answer;
    }
  }

  function getInitialAnswers(nextQuestions: QuizSessionQuestionResponse[]) {
    return nextQuestions.reduce<Record<string, QuizAnswerValue>>((acc, question) => {
      const requestQuestionId = getRequestQuestionId(question);
      if (requestQuestionId) {
        acc[requestQuestionId] = decodeUserAnswer(question, question.userAnswer);
      }
      return acc;
    }, {});
  }

  async function loadSessionQuestions(nextSession: QuizSessionResponse) {
    if (!nextSession.id) return false;

    setSession(nextSession);
    const questionPayload = await getQuizSessionQuestionsAction(nextSession.id);
    if (!questionPayload.success) {
      setMessage(questionPayload.error || "Could not load quiz questions.");
      return false;
    }

    const nextQuestions = questionPayload.data || [];
    setQuestions(nextQuestions);
    setAnswers(getInitialAnswers(nextQuestions));
    return true;
  }

  async function resumeInProgressSession() {
    const sessionsPayload = await getQuizSessionsAction(lessonId);
    if (!sessionsPayload.success) return undefined;
    return sessionsPayload.data?.find((item) => item.status === "IN_PROGRESS" && item.id);
  }

  function startQuiz() {
    setMessage(undefined);
    startTransition(async () => {
      const sessionPayload = await createQuizSessionAction(courseId, lessonId);
      if (!sessionPayload.success || !sessionPayload.data?.id) {
        const existingSession = await resumeInProgressSession();
        if (existingSession) {
          const didResume = await loadSessionQuestions(existingSession);
          if (didResume) setMessage("Resumed your in-progress quiz session.");
          return;
        }

        setMessage(sessionPayload.error || "Could not start quiz.");
        return;
      }

      await loadSessionQuestions(sessionPayload.data);
    });
  }

  function setAnswer(question: QuizSessionQuestionResponse, answer: QuizAnswerValue) {
    const requestQuestionId = getRequestQuestionId(question);
    if (!requestQuestionId) return;

    setAnswers((current) => ({ ...current, [requestQuestionId]: answer }));
    if (!session?.id) return;
    chooseQuizAnswerAction(session.id, { questionId: requestQuestionId, userAnswer: encodeUserAnswer(question, answer) }).catch(() => undefined);
  }

  function submitQuiz() {
    if (!session?.id) return;
    setMessage(undefined);
    startTransition(async () => {
      const payload = await submitQuizSessionAction(session.id!, {
        answers: questions
          .map((question) => {
            const questionId = getRequestQuestionId(question);
            const answer = answers[questionId];
            return questionId && answer ? { questionId, userAnswer: encodeUserAnswer(question, answer) } : undefined;
          })
          .filter((answer): answer is { questionId: string; userAnswer: string } => Boolean(answer)),
      });

      if (!payload.success) {
        setMessage(payload.error || "Could not submit quiz.");
        return;
      }

      setSession(payload.data);
      setIsResultOpen(true);
      onComplete(lessonId);
      const score = payload.data?.quizSessionSubmission?.score;
      setMessage(typeof score === "number" ? `Quiz submitted. Score: ${score}` : "Quiz submitted successfully.");
    });
  }

  const hasStarted = Boolean(session?.id);
  const isSubmitted = session?.status === "SUBMITTED" || session?.status === "GRADED" || session?.status === "PENDING_GRADE";
  const result = session?.quizSessionSubmission;
  const score = typeof result?.score === "number" ? result.score : undefined;
  const correctAnswers = typeof result?.totalCorrectAnswers === "number" ? result.totalCorrectAnswers : undefined;
  const isPassed = typeof score === "number" ? score >= 5 : undefined;

  function arrayAnswer(question: QuizSessionQuestionResponse) {
    const value = answers[getRequestQuestionId(question)];
    return Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : item.optionId)) : [];
  }

  function matchingAnswer(question: QuizSessionQuestionResponse): MatchingAnswer {
    const value = answers[getRequestQuestionId(question)];
    return Array.isArray(value) ? value.filter((item): item is { optionId: string; matchText: string } => typeof item === "object" && item !== null && "optionId" in item) : [];
  }

  function toggleMultiAnswer(question: QuizSessionQuestionResponse, optionId: string) {
    const current = arrayAnswer(question);
    setAnswer(question, current.includes(optionId) ? current.filter((item) => item !== optionId) : [...current, optionId]);
  }

  function setMatchingValue(question: QuizSessionQuestionResponse, optionId: string, matchText: string) {
    const current = matchingAnswer(question).filter((item) => item.optionId !== optionId);
    setAnswer(question, [...current, { optionId, matchText }]);
  }

  function moveOrderAnswer(question: QuizSessionQuestionResponse, fromIndex: number, direction: -1 | 1) {
    const current = arrayAnswer(question);
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= current.length) return;
    const next = [...current];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    setAnswer(question, next);
  }

  return (
    <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_18px_48px_rgba(29,32,38,0.06)] lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex size-12 items-center justify-center rounded-[16px] bg-[#EBEBFF] text-[#564FFD]">
            <HelpCircle className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[#1D2026]">Quiz</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6E7485]">
            Answer the questions and submit when you are ready.
          </p>
        </div>
        <div className="rounded-[18px] bg-[#F9FAFB] p-4 text-sm font-semibold text-[#4E5566]">
          <p>{quiz?.numberOfQuestionPerQuizSession || questions.length || 0} questions</p>
          <p className="mt-1 text-[#8C94A3]">{quiz?.duration ? `${quiz.duration} minutes` : "Self-paced"}</p>
        </div>
      </div>

      {!hasStarted ? (
        <button
          type="button"
          onClick={startQuiz}
          disabled={isPending}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#564FFD] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <HelpCircle className="size-4" />}
          Start quiz
        </button>
      ) : (
        <div className="mt-8 space-y-5">
          {questions.map((question, index) => (
            <div key={question.id || index} className="rounded-[18px] border border-[#E9EAF0] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Question {index + 1}</p>
              <h3 className="mt-2 text-lg font-bold text-[#1D2026]">{question.questionText || "Untitled question"}</h3>

              {question.questionType === "SHORT_TEXT" ? (
                <textarea
                  value={String(answers[getRequestQuestionId(question)] || "")}
                  onChange={(event) => setAnswer(question, event.target.value)}
                  className="mt-4 min-h-32 w-full rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#564FFD]"
                  placeholder="Type your answer"
                />
              ) : question.questionType === "MATCHING" ? (
                <div className="mt-4 grid gap-3">
                  {(question.options || [])
                    .filter((option) => option.side !== "RIGHT")
                    .map((option) => {
                      const value = option.id || "";
                      const rightOptions = (question.options || []).filter((item) => item.side === "RIGHT").map((item) => item.optionText || "");
                      const current = matchingAnswer(question).find((item) => item.optionId === value)?.matchText || "";
                      return (
                        <div key={value || option.optionText} className="grid gap-3 rounded-[16px] border border-[#E9EAF0] p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                          <div className="rounded-[12px] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#1D2026]">{option.optionText || "Match item"}</div>
                          <select
                            value={current}
                            onChange={(event) => setMatchingValue(question, value, event.target.value)}
                            className="h-12 rounded-[12px] border border-[#E9EAF0] bg-white px-4 text-sm font-semibold text-[#1D2026] outline-none transition focus:border-[#564FFD]"
                          >
                            <option value="">Choose match</option>
                            {rightOptions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                </div>
              ) : question.questionType === "ORDERING" ? (
                <div className="mt-4 grid gap-3">
                  {arrayAnswer(question).map((optionId, optionIndex) => {
                    const option = (question.options || []).find((item) => (item.id || item.optionText) === optionId);
                    return (
                      <div key={`${optionId}-${optionIndex}`} className="flex items-center gap-3 rounded-[16px] border border-[#E9EAF0] p-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#EBEBFF] text-sm font-black text-[#564FFD]">{optionIndex + 1}</span>
                        <p className="min-w-0 flex-1 text-sm font-semibold text-[#1D2026]">{option?.optionText || optionId}</p>
                        <button type="button" onClick={() => moveOrderAnswer(question, optionIndex, -1)} className="rounded-full px-3 py-2 text-xs font-bold text-[#564FFD] hover:bg-[#F7F7FF]">
                          Up
                        </button>
                        <button type="button" onClick={() => moveOrderAnswer(question, optionIndex, 1)} className="rounded-full px-3 py-2 text-xs font-bold text-[#564FFD] hover:bg-[#F7F7FF]">
                          Down
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : question.options?.length ? (
                <div className="mt-4 grid gap-3">
                  {question.options.map((option) => {
                    const value = option.id || option.optionText || "";
                    const requestQuestionId = getRequestQuestionId(question);
                    const isSelected = question.questionType === "MULTI_CHOICE" ? arrayAnswer(question).includes(value) : answers[requestQuestionId] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => (question.questionType === "MULTI_CHOICE" ? toggleMultiAnswer(question, value) : setAnswer(question, value))}
                        className={cn(
                          "rounded-[16px] border px-4 py-3 text-left text-sm font-semibold transition",
                          isSelected ? "border-[#564FFD] bg-[#EBEBFF] text-[#1D2026]" : "border-[#E9EAF0] text-[#4E5566] hover:border-[#D8D6FF] hover:bg-[#F9FAFB]"
                        )}
                      >
                        {option.optionText || value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={String(answers[getRequestQuestionId(question)] || "")}
                  onChange={(event) => setAnswer(question, event.target.value)}
                  className="mt-4 min-h-32 w-full rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#564FFD]"
                  placeholder="Type your answer"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {message ? (
        <div className="mt-5 flex items-center gap-2 rounded-[16px] bg-[#F4F3FF] px-4 py-3 text-sm font-semibold text-[#564FFD]">
          <CheckCircle2 className="size-4" />
          {message}
        </div>
      ) : null}

      {hasStarted && !isSubmitted ? (
        <button
          type="button"
          onClick={submitQuiz}
          disabled={isPending || questions.length === 0}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1D2026] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Submit quiz
        </button>
      ) : null}

      {isResultOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111033]/55 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white p-7 text-center shadow-[0_28px_90px_rgba(17,16,51,0.28)]">
            <button
              type="button"
              onClick={() => setIsResultOpen(false)}
              className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full bg-[#F5F7FA] text-[#6E7485] transition hover:bg-[#EBEBFF] hover:text-[#564FFD]"
              aria-label="Close quiz result"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto flex size-20 items-center justify-center rounded-[26px] bg-[#EBEBFF] text-[#564FFD]">
              <Trophy className="size-10" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-[#8C94A3]">Quiz result</p>
            <h3 className="mt-2 text-3xl font-black text-[#1D2026]">
              {isPassed === undefined ? "Submitted" : isPassed ? "Great work" : "Keep practicing"}
            </h3>

            <div className="mt-6 rounded-[22px] bg-[#F7F7FF] p-5">
              <p className="text-sm font-semibold text-[#6E7485]">Your score</p>
              <p className="mt-2 text-5xl font-black text-[#564FFD]">{typeof score === "number" ? score.toFixed(1) : "--"}</p>
              <p className="mt-2 text-sm font-medium text-[#8C94A3]">out of 10</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#E9EAF0] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Correct answers</p>
                <p className="mt-2 text-2xl font-black text-[#1D2026]">
                  {typeof correctAnswers === "number" ? `${correctAnswers}/${questions.length}` : "--"}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E9EAF0] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Status</p>
                <p className={cn("mt-2 text-2xl font-black", isPassed ? "text-[#16A34A]" : "text-[#E34444]")}>
                  {isPassed === undefined ? "Done" : isPassed ? "Passed" : "Try again"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsResultOpen(false)}
              className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
            >
              Continue learning
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
