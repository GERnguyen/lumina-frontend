"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, GripVertical, HelpCircle, Loader2, RefreshCw, Send, Trophy, X } from "lucide-react";
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
import { QuizReviewMode } from "./QuizReviewMode";

type LearningQuizLessonProps = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  quiz?: QuizLessonResponse;
  onComplete: (lessonId: string) => Promise<void> | void;
};

type MatchingAnswer = Array<{ optionId: string; matchText: string }>;
type QuizAnswerValue = string | string[] | MatchingAnswer;

function shuffleValues<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function formatTimeLeft(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function parseUtcDate(dateStr: string) {
  if (!dateStr) return 0;
  const formatted = dateStr.endsWith("Z") || dateStr.includes("+") || /-\d{2}:\d{2}$/.test(dateStr)
    ? dateStr
    : `${dateStr}Z`;
  return new Date(formatted).getTime();
}

export function LearningQuizLesson({ courseId, lessonId, lessonTitle, quiz, onComplete }: LearningQuizLessonProps) {
  const router = useRouter();
  const [session, setSession] = useState<QuizSessionResponse>();
  const [questions, setQuestions] = useState<QuizSessionQuestionResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [message, setMessage] = useState<string>();
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [reviewSession, setReviewSession] = useState<QuizSessionResponse>();
  const [reviewQuestions, setReviewQuestions] = useState<QuizSessionQuestionResponse[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const submitQuizRef = useRef<() => void>(() => {});
  
  // Attempt tracking from server
  const [sessions, setSessions] = useState<QuizSessionResponse[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(true);

  const maxAttempt = quiz?.maxAttempt ?? 0; // 0 = unlimited
  const attemptsLeft = maxAttempt > 0 ? Math.max(0, maxAttempt - attemptCount) : null;
  const hasAttemptsLeft = attemptsLeft === null || attemptsLeft > 0;

  // Derived properties from quiz sessions
  const submittedSessions = sessions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "GRADED" || s.status === "PENDING_GRADE",
  );

  const bestSession = submittedSessions.reduce<QuizSessionResponse | undefined>((best, current) => {
    if (!best) return current;
    const bestScore = best.quizSessionSubmission?.score ?? 0;
    const currentScore = current.quizSessionSubmission?.score ?? 0;
    return currentScore > bestScore ? current : best;
  }, undefined);

  const highestScore = bestSession?.quizSessionSubmission?.score;
  const isQuizPassed = typeof highestScore === "number" ? highestScore >= 5 : false;
  const hasAttempted = submittedSessions.length > 0;

  // Helper to check if a session is active and not expired
  function isSessionActive(s: QuizSessionResponse, durationMinutes?: number) {
    if (s.status !== "IN_PROGRESS") return false;
    if (!durationMinutes) return true; // self-paced
    if (!s.startTime) return true;
    const startTimeMs = parseUtcDate(s.startTime);
    const deadline = s.endTime ? parseUtcDate(s.endTime) : startTimeMs + durationMinutes * 60 * 1000;
    return deadline > Date.now();
  }

  // Load attempts/sessions from server on mount
  useEffect(() => {
    setIsLoadingAttempts(true);
    getQuizSessionsAction(lessonId)
      .then(async (payload) => {
        if (payload.success && payload.data) {
          setSessions(payload.data);
          const submitted = payload.data.filter(
            (s) => s.status === "SUBMITTED" || s.status === "GRADED" || s.status === "PENDING_GRADE",
          );
          setAttemptCount(submitted.length);

          // Auto-resume active in-progress session if exists and not expired
          const activeSession = payload.data.find(
            (s) => s.status === "IN_PROGRESS" && isSessionActive(s, quiz?.duration)
          );
          if (activeSession) {
            const didResume = await loadSessionQuestions(activeSession);
            if (didResume) {
              setMessage("Resumed your in-progress quiz session.");
            }
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoadingAttempts(false));
  }, [lessonId, quiz?.duration]);

  function getRequestQuestionId(question: QuizSessionQuestionResponse) {
    return question.questionId || question.id || "";
  }

  function getDefaultAnswer(question: QuizSessionQuestionResponse): QuizAnswerValue {
    if (question.questionType === "ORDERING") return shuffleValues((question.options || []).map((option) => option.id || option.optionText || "").filter(Boolean));
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
    setIsResultOpen(false);
    setSession(undefined);
    setQuestions([]);
    setAnswers({});
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
    if (!session?.id || isPending) return;
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
      setAttemptCount((c) => c + 1);
      if (payload.data) {
        setSessions((prev) => [payload.data!, ...prev]);
      }

      const sessionScore = payload.data?.quizSessionSubmission?.score;
      const passed = typeof sessionScore === "number" ? sessionScore >= 5 : false;

      // Only mark lesson complete when passed
      if (passed) {
        await onComplete(lessonId);
      }
      router.refresh();
    });
  }

  function startReview(sessionToReview: QuizSessionResponse) {
    if (!sessionToReview.id) return;
    setMessage(undefined);
    startTransition(async () => {
      const payload = await getQuizSessionQuestionsAction(sessionToReview.id!);
      if (!payload.success) {
        setMessage(payload.error || "Could not load quiz review questions.");
        return;
      }
      setReviewSession(sessionToReview);
      setReviewQuestions(payload.data || []);
      setIsReviewing(true);
    });
  }

  const hasStarted = Boolean(session?.id);
  const isSubmitted = session?.status === "SUBMITTED" || session?.status === "GRADED" || session?.status === "PENDING_GRADE";
  const result = session?.quizSessionSubmission;
  const score = typeof result?.score === "number" ? result.score : undefined;
  const correctAnswers = typeof result?.totalCorrectAnswers === "number" ? result.totalCorrectAnswers : undefined;
  const isPassed = typeof score === "number" ? score >= 5 : undefined;
  // After submit attemptCount already incremented
  const attemptsLeftAfterSubmit = maxAttempt > 0 ? Math.max(0, maxAttempt - attemptCount) : null;
  const canRetry = isPassed === false && (attemptsLeftAfterSubmit === null || attemptsLeftAfterSubmit > 0);

  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  // Countdown timer effect
  useEffect(() => {
    if (!hasStarted || isSubmitted || !quiz?.duration || !session?.startTime) {
      return;
    }

    const durationMs = quiz.duration * 60 * 1000;
    const startTimeMs = parseUtcDate(session.startTime);
    const deadlineMs = session.endTime ? parseUtcDate(session.endTime) : startTimeMs + durationMs;

    // Calculate initial remaining seconds immediately to prevent flicker
    const initialMs = deadlineMs - Date.now();
    setTimeLeftSeconds(Math.max(0, Math.floor(initialMs / 1000)));

    function updateTimer() {
      const remainingMs = deadlineMs - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSec);

      if (remainingSec <= 0) {
        submitQuizRef.current();
      }
    }

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isSubmitted, quiz?.duration, session?.startTime, session?.endTime]);

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

  function moveOrderAnswerTo(question: QuizSessionQuestionResponse, fromIndex: number, toIndex: number) {
    const current = arrayAnswer(question);
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) return;
    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setAnswer(question, next);
  }

  if (isReviewing && reviewSession) {
    return (
      <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_18px_48px_rgba(29,32,38,0.06)] lg:p-8">
        <QuizReviewMode
          session={reviewSession}
          questions={reviewQuestions}
          title={lessonTitle}
          onExit={() => {
            setIsReviewing(false);
            setReviewSession(undefined);
            setReviewQuestions([]);
          }}
        />
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_18px_48px_rgba(29,32,38,0.06)] lg:p-8">
      {/* Header */}
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
        <div className="rounded-[18px] bg-[#F9FAFB] p-4 text-sm font-semibold text-[#4E5566] min-w-[160px] text-center">
          <p>{quiz?.numberOfQuestionPerQuizSession || questions.length || 0} questions</p>
          {quiz?.duration ? (
            hasStarted && !isSubmitted ? (
              <div className="mt-2 border-t border-[#E9EAF0] pt-2">
                <p className="text-[10px] text-[#8C94A3] font-bold uppercase tracking-wider">Time Remaining</p>
                <p className={cn(
                  "mt-1 text-xl font-black tabular-nums transition-colors",
                  timeLeftSeconds < 60 ? "text-[#E34444] animate-pulse" : "text-[#564FFD]"
                )}>
                  {formatTimeLeft(timeLeftSeconds)}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-[#8C94A3]">{quiz.duration} minutes</p>
            )
          ) : (
            <p className="mt-1 text-[#8C94A3]">Self-paced</p>
          )}
          {/* Attempts remaining — from DB */}
          {isLoadingAttempts ? (
            <p className="mt-2 text-xs text-[#8C94A3]">Loading attempts...</p>
          ) : maxAttempt > 0 ? (
            <p className={cn("mt-2 text-xs font-bold", attemptsLeft === 0 ? "text-[#E34444]" : "text-[#16A34A]")}>
              {attemptsLeft === 0
                ? "No attempts left"
                : `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining`}
            </p>
          ) : (
            <p className="mt-2 text-xs font-bold text-[#16A34A]">Unlimited attempts</p>
          )}
        </div>
      </div>

      {/* Pre-quiz start button */}
      {!hasStarted ? (
        <div className="mt-8 space-y-6">
          {/* Status Banner */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[#E9EAF0] p-5 bg-[#F9FAFB]">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Quiz Status</p>
              <div className="mt-2 flex items-center gap-2">
                {isQuizPassed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                    <CheckCircle2 className="size-4" /> Passed (Đạt)
                  </span>
                ) : hasAttempted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                    <X className="size-4" /> Failed (Chưa đạt)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                    <AlertCircle className="size-4" /> Not Attempted
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#E9EAF0] p-5 bg-[#F9FAFB]">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Highest Score</p>
              <p className="mt-1 text-2xl font-black text-[#1D2026]">
                {highestScore !== undefined ? `${highestScore.toFixed(1)} / 10` : "-- / 10"}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E9EAF0] p-5 bg-[#F9FAFB]">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Attempts Taken</p>
              <p className="mt-1 text-2xl font-black text-[#1D2026]">
                {attemptCount} / {maxAttempt > 0 ? maxAttempt : "∞"}
              </p>
            </div>
          </div>

          {/* Past Attempts History */}
          {hasAttempted && (
            <div className="rounded-[18px] border border-[#E9EAF0] p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#8C94A3] mb-3">Attempt History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#4E5566]">
                  <thead>
                    <tr className="border-b border-[#E9EAF0] text-xs font-bold uppercase text-[#8C94A3]">
                      <th className="py-2.5">Attempt</th>
                      <th className="py-2.5">Time</th>
                      <th className="py-2.5">Score</th>
                      <th className="py-2.5">Result</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EAF0]">
                    {submittedSessions.map((s, idx) => {
                      const attemptScore = s.quizSessionSubmission?.score;
                      const attemptPassed = typeof attemptScore === "number" ? attemptScore >= 5 : false;
                      const dateStr = s.endTime ? new Date(parseUtcDate(s.endTime)).toLocaleString() : s.startTime ? new Date(parseUtcDate(s.startTime)).toLocaleString() : "Unknown";

                      return (
                        <tr key={s.id || idx} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-[#1D2026]">#{submittedSessions.length - idx}</td>
                          <td className="py-3 text-[#6E7485]">{dateStr}</td>
                          <td className="py-3 font-bold text-[#1D2026]">
                            {attemptScore !== undefined ? attemptScore.toFixed(1) : "--"}
                          </td>
                          <td className="py-3">
                            {attemptPassed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                                <CheckCircle2 className="size-3.5" /> Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                                <X className="size-3.5" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {s.isReviewAllowed ? (
                              <button
                                type="button"
                                onClick={() => startReview(s)}
                                disabled={isPending}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#564FFD] hover:text-[#4338CA] hover:underline disabled:opacity-50"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-xs text-[#8C94A3]">Not Allowed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={startQuiz}
              disabled={isPending || isLoadingAttempts || !hasAttemptsLeft}
              className="inline-flex items-center gap-2 rounded-full bg-[#564FFD] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <HelpCircle className="size-4" />}
              {hasAttemptsLeft ? "Start quiz" : "No attempts remaining"}
            </button>
          </div>
        </div>
      ) : (
        /* Questions */
        <div className="mt-8 space-y-5">
          {questions.map((question, index) => (
            <div key={question.id || index} className="rounded-[18px] border border-[#E9EAF0] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#8C94A3]">Question {index + 1}</p>
              <h3 className="mt-2 text-lg font-bold text-[#1D2026]">{question.questionText || "Untitled question"}</h3>

              {question.questionType === "MATCHING" ? (
                <div className="mt-4 grid gap-3">
                  {(question.options || [])
                    .filter((option) => option.side !== "RIGHT")
                    .map((option) => {
                      const optionId = option.id || "";
                      const rightOptions = (question.options || []).filter((o) => o.side === "RIGHT");
                      const currentMatch = matchingAnswer(question).find((item) => item.optionId === optionId)?.matchText || "";
                      return (
                        <div key={optionId} className="flex items-center gap-3">
                          <span className="flex-1 rounded-[12px] border border-[#E9EAF0] px-3 py-2 text-sm font-medium text-[#1D2026]">
                            {option.optionText}
                          </span>
                          <span className="text-[#8C94A3]">→</span>
                          <select
                            value={currentMatch}
                            onChange={(event) => setMatchingValue(question, optionId, event.target.value)}
                            className="flex-1 rounded-[12px] border border-[#E9EAF0] px-3 py-2 text-sm font-medium text-[#1D2026] outline-none transition focus:border-[#564FFD]"
                          >
                            <option value="">Select match</option>
                            {rightOptions.map((rightOption) => (
                              <option key={rightOption.id} value={rightOption.optionText || ""}>
                                {rightOption.optionText}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                </div>
              ) : question.questionType === "ORDERING" ? (
                <div className="mt-4 space-y-2">
                  {arrayAnswer(question).map((optionId, idx) => {
                    const option = (question.options || []).find((o) => (o.id || o.optionText) === optionId);
                    return (
                      <div
                        key={optionId}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", String(idx))}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
                          if (!Number.isNaN(fromIndex)) moveOrderAnswerTo(question, fromIndex, idx);
                        }}
                        className="flex cursor-grab items-center gap-3 rounded-[14px] border border-[#E9EAF0] bg-white px-4 py-3 active:cursor-grabbing"
                      >
                        <GripVertical className="size-4 shrink-0 text-[#CED1D9]" />
                        <span className="text-sm font-medium text-[#1D2026]">{option?.optionText || optionId}</span>
                        <div className="ml-auto flex gap-1">
                          <button type="button" onClick={() => moveOrderAnswer(question, idx, -1)} disabled={idx === 0} className="size-7 rounded-full text-[#8C94A3] hover:bg-[#F5F7FA] disabled:opacity-40" aria-label="Move up">↑</button>
                          <button type="button" onClick={() => moveOrderAnswer(question, idx, 1)} disabled={idx === arrayAnswer(question).length - 1} className="size-7 rounded-full text-[#8C94A3] hover:bg-[#F5F7FA] disabled:opacity-40" aria-label="Move down">↓</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : question.questionType === "MULTI_CHOICE" ? (
                <div className="mt-4 space-y-2">
                  {(question.options || []).map((option) => {
                    const optionId = option.id || "";
                    const checked = arrayAnswer(question).includes(optionId);
                    return (
                      <label key={optionId} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#E9EAF0] px-4 py-3 transition hover:border-[#D8D6FF] hover:bg-[#FAFAFE]">
                        <input type="checkbox" checked={checked} onChange={() => toggleMultiAnswer(question, optionId)} className="size-4 accent-[#564FFD]" />
                        <span className="text-sm font-medium text-[#1D2026]">{option.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              ) : question.questionType === "SHORT_TEXT" ? (
                <textarea
                  value={String(answers[getRequestQuestionId(question)] || "")}
                  onChange={(event) => setAnswer(question, event.target.value)}
                  className="mt-4 min-h-32 w-full rounded-[16px] border border-[#E9EAF0] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#564FFD]"
                  placeholder="Type your answer"
                />
              ) : (
                <div className="mt-4 space-y-2">
                  {(question.options || []).map((option) => {
                    const optionId = option.id || "";
                    const selected = answers[getRequestQuestionId(question)] === optionId;
                    return (
                      <label key={optionId} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#E9EAF0] px-4 py-3 transition hover:border-[#D8D6FF] hover:bg-[#FAFAFE]">
                        <input type="radio" name={getRequestQuestionId(question)} checked={selected} onChange={() => setAnswer(question, optionId)} className="size-4 accent-[#564FFD]" />
                        <span className="text-sm font-medium text-[#1D2026]">{option.optionText}</span>
                      </label>
                    );
                  })}
                </div>
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

      {/* ── Result popup ── */}
      {isResultOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111033]/55 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white p-7 text-center shadow-[0_28px_90px_rgba(17,16,51,0.28)]">
            {/* X — always */}
            <button
              type="button"
              onClick={() => setIsResultOpen(false)}
              className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full bg-[#F5F7FA] text-[#6E7485] transition hover:bg-[#EBEBFF] hover:text-[#564FFD]"
              aria-label="Close quiz result"
            >
              <X className="size-5" />
            </button>

            {/* Icon */}
            <div className={cn(
              "mx-auto flex size-20 items-center justify-center rounded-[26px]",
              isPassed ? "bg-[#EBEBFF] text-[#564FFD]" : "bg-red-50 text-red-500",
            )}>
              {isPassed ? <Trophy className="size-10" /> : <AlertCircle className="size-10" />}
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-[#8C94A3]">Quiz result</p>
            <h3 className="mt-2 text-3xl font-black text-[#1D2026]">
              {isPassed === undefined ? "Submitted" : isPassed ? "Great work!" : "Keep practicing"}
            </h3>

            {/* Score */}
            <div className="mt-6 rounded-[22px] bg-[#F7F7FF] p-5">
              <p className="text-sm font-semibold text-[#6E7485]">Your score</p>
              <p className={cn("mt-2 text-5xl font-black", isPassed ? "text-[#564FFD]" : "text-[#E34444]")}>
                {typeof score === "number" ? score.toFixed(1) : "--"}
              </p>
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
                  {isPassed === undefined ? "Done" : isPassed ? "Passed ✓" : "Failed"}
                </p>
              </div>
            </div>

            {/* Attempts remaining (only when failed) */}
            {isPassed === false ? (
              maxAttempt > 0 ? (
                <div className={cn(
                  "mt-4 rounded-[14px] px-4 py-3 text-sm font-semibold",
                  attemptsLeftAfterSubmit === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700",
                )}>
                  {attemptsLeftAfterSubmit === 0
                    ? "You have used all your attempts."
                    : `${attemptsLeftAfterSubmit} attempt${attemptsLeftAfterSubmit === 1 ? "" : "s"} remaining — you can try again.`}
                </div>
              ) : (
                <div className="mt-4 rounded-[14px] bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Unlimited attempts — feel free to try again.
                </div>
              )
            ) : null}

            {/* CTA buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isPassed ? (
                /* Passed → Continue learning */
                <button
                  type="button"
                  onClick={() => setIsResultOpen(false)}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
                >
                  <CheckCircle2 className="size-4" />
                  Continue learning
                </button>
              ) : (
                /* Failed → Try Again (if has attempts) + Close */
                <>
                  {canRetry ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResultOpen(false);
                        startQuiz();
                      }}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#564FFD] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
                    >
                      <RefreshCw className="size-4" />
                      Try again
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsResultOpen(false)}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#E9EAF0] px-6 text-sm font-bold text-[#4E5566] transition hover:border-[#D8D6FF] hover:bg-[#F8F8FF]"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
