"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, MessageSquare, ThumbsUp, ArrowLeft, Send, Trash2, PlusCircle, User, Calendar, Loader2, HelpCircle } from "lucide-react";
import { getQuestionsAction, createQuestionAction, upvoteQuestionAction, deleteQuestionAction, getAnswersForQuestionAction, createAnswerAction, upvoteAnswerAction, deleteAnswerAction } from "@/services/actions/social";
import { UserApi } from "@/services/api/user-api";
import type { QuestionDto, AnswerDto, UserDto } from "@/types";
import { cn } from "@/lib/utils";

interface LearningQnAPanelProps {
  courseId: string;
  lessonId: string;
}

export function LearningQnAPanel({ courseId, lessonId }: LearningQnAPanelProps) {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Filtering & Search
  const [filterMode, setFilterMode] = useState<"this-lesson" | "all-lessons">("this-lesson");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Q&A detail thread state
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDto | null>(null);
  const [answers, setAnswers] = useState<AnswerDto[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState("");
  
  // Create question state
  const [isAsking, setIsAsking] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  
  // Hydrated user details
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; avatarUrl?: string }>>({});
  
  const [isPending, startTransition] = useTransition();

  // Fetch current user details on mount
  useEffect(() => {
    UserApi.getCurrentUser()
      .then((res) => {
        if (res.data) setCurrentUser(res.data);
      })
      .catch(() => undefined);
  }, []);

  // Fetch questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const activeLessonId = filterMode === "this-lesson" ? lessonId : undefined;
      const res = await getQuestionsAction(courseId, activeLessonId);
      if (res.success && res.data) {
        setQuestions(res.data);
        
        // Collect user ids to hydrate
        const userIds = res.data.map((q) => q.userId).filter(Boolean) as string[];
        hydrateUsers(userIds);
      }
    } catch (err) {
      console.error("Failed to load Q&A questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId, lessonId, filterMode]);

  // Fetch answers when a question is selected
  useEffect(() => {
    if (!selectedQuestion?.id) {
      setAnswers([]);
      return;
    }

    async function fetchAnswers() {
      setLoadingAnswers(true);
      try {
        const res = await getAnswersForQuestionAction(selectedQuestion!.id!);
        if (res.success && res.data) {
          setAnswers(res.data);
          
          // Hydrate user ids
          const userIds = res.data.map((a) => a.userId).filter(Boolean) as string[];
          hydrateUsers(userIds);
        }
      } catch (err) {
        console.error("Failed to load answers:", err);
      } finally {
        setLoadingAnswers(false);
      }
    }

    fetchAnswers();
  }, [selectedQuestion]);

  // Hydrate user profiles
  const hydrateUsers = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    const missingIds = uniqueIds.filter((id) => !userProfiles[id]);
    if (missingIds.length === 0) return;

    try {
      const res = await UserApi.getUsersByIds(missingIds.join(","));
      const users = res.data || [];
      const newEntries = users.reduce((acc, user) => {
        if (user.userId) {
          acc[user.userId] = {
            name: user.name || "Lumina learner",
            avatarUrl: user.avatarUrl,
          };
        }
        return acc;
      }, {} as Record<string, { name: string; avatarUrl?: string }>);

      missingIds.forEach((id) => {
        if (!newEntries[id]) {
          newEntries[id] = {
            name: "Lumina learner",
            avatarUrl: undefined,
          };
        }
      });

      setUserProfiles((prev) => ({ ...prev, ...newEntries }));
    } catch (err) {
      console.error("Failed to hydrate users:", err);
    }
  };

  // Actions
  const handleCreateQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;

    startTransition(async () => {
      const res = await createQuestionAction({
        courseId,
        lessonId: filterMode === "this-lesson" ? lessonId : undefined,
        title: newQuestionTitle.trim(),
        content: newQuestionContent.trim(),
      });

      if (res.success && res.data) {
        setNewQuestionTitle("");
        setNewQuestionContent("");
        setIsAsking(false);
        fetchQuestions();
      }
    });
  };

  const handleCreateAnswer = () => {
    if (!selectedQuestion?.id || !newAnswerText.trim()) return;

    startTransition(async () => {
      const res = await createAnswerAction({
        questionId: selectedQuestion.id!,
        content: newAnswerText.trim(),
      });

      if (res.success && res.data) {
        setNewAnswerText("");
        // Reload answers
        const freshAnswers = await getAnswersForQuestionAction(selectedQuestion.id!);
        if (freshAnswers.success && freshAnswers.data) {
          setAnswers(freshAnswers.data);
          const uIds = freshAnswers.data.map((a) => a.userId).filter(Boolean) as string[];
          hydrateUsers(uIds);
        }
        // Update question answer count locally
        setSelectedQuestion((prev) => prev ? { ...prev, answersCount: (prev.answersCount || 0) + 1 } : null);
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === selectedQuestion.id ? { ...q, answersCount: (q.answersCount || 0) + 1 } : q
          )
        );
      }
    });
  };

  const handleUpvoteQuestion = async (qId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const res = await upvoteQuestionAction(qId);
      if (res.success) {
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === qId) {
              const hasUpvoted = !q.hasUpvoted;
              const upvoteCount = (q.upvoteCount || 0) + (hasUpvoted ? 1 : -1);
              return { ...q, hasUpvoted, upvoteCount };
            }
            return q;
          })
        );
        if (selectedQuestion?.id === qId) {
          setSelectedQuestion((prev) => {
            if (!prev) return null;
            const hasUpvoted = !prev.hasUpvoted;
            const upvoteCount = (prev.upvoteCount || 0) + (hasUpvoted ? 1 : -1);
            return { ...prev, hasUpvoted, upvoteCount };
          });
        }
      }
    } catch (err) {
      console.error(err);
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

  const handleDeleteQuestion = async (qId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      const res = await deleteQuestionAction(qId);
      if (res.success) {
        if (selectedQuestion?.id === qId) {
          setSelectedQuestion(null);
        }
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnswer = async (ansId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu trả lời này?")) return;
    try {
      const res = await deleteAnswerAction(ansId);
      if (res.success) {
        setAnswers((prev) => prev.filter((a) => a.id !== ansId));
        if (selectedQuestion) {
          setSelectedQuestion((prev) => prev ? { ...prev, answersCount: Math.max(0, (prev.answersCount || 1) - 1) } : null);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === selectedQuestion.id ? { ...q, answersCount: Math.max(0, (q.answersCount || 1) - 1) } : q
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (val?: string) => {
    if (!val) return "--";
    try {
      const date = new Date(val);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = searchQuery
      ? [q.title, q.content].some((s) => s?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesSearch;
  });

  return (
    <div className="mt-12 rounded-[22px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
      {selectedQuestion ? (
        /* ───────────────── Q&A THREAD DETAIL VIEW ───────────────── */
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setSelectedQuestion(null)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary-600 transition-colors select-none cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Quay lại danh sách câu hỏi
          </button>

          {/* Question detail */}
          <div className="border-b border-zinc-150 pb-5 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-950 leading-snug">{selectedQuestion.title}</h3>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-600">
                  <User className="size-3.5 text-zinc-400" />
                  {selectedQuestion.userId ? (userProfiles[selectedQuestion.userId]?.name || "Đang tải...") : "Ẩn danh"}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {formatDate(selectedQuestion.createdAt)}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-wrap">
              {selectedQuestion.content}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleUpvoteQuestion(selectedQuestion.id!, e)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition cursor-pointer select-none",
                  selectedQuestion.hasUpvoted
                    ? "bg-primary-50 border-primary-300 text-primary-700 shadow-2xs"
                    : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <ThumbsUp className="size-3.5" />
                <span>{selectedQuestion.upvoteCount || 0} Hữu ích</span>
              </button>
              
              {currentUser?.userId === selectedQuestion.userId && (
                <button
                  onClick={(e) => handleDeleteQuestion(selectedQuestion.id!, e)}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition cursor-pointer select-none"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>

          {/* Answers title */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-450">
              {answers.length} câu trả lời
            </h4>
          </div>

          {/* Answers list */}
          {loadingAnswers ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 animate-spin text-primary-500" />
            </div>
          ) : answers.length === 0 ? (
            <p className="text-xs text-zinc-450 font-medium italic py-2">Chưa có câu trả lời nào cho câu hỏi này. Bạn hãy là người đầu tiên trả lời!</p>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => {
                const profile = answer.userId ? userProfiles[answer.userId] : undefined;
                const isInstructor = answer.isInstructorAnswer;
                
                return (
                  <div
                    key={answer.id}
                    className={cn(
                      "rounded-2xl border p-4.5 space-y-3.5 shadow-2xs transition-all",
                      isInstructor
                        ? "bg-primary-50/20 border-primary-200/50"
                        : "bg-zinc-50/30 border-zinc-150 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-zinc-950">
                          {profile?.name || answer.userId || "Lumina Learner"}
                        </span>
                        {isInstructor && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-850 border border-primary-200">
                            Giảng viên
                          </span>
                        )}
                        <span className="text-zinc-300 font-normal">•</span>
                        <span className="text-zinc-400 font-medium">{formatDate(answer.createdAt)}</span>
                      </div>

                      {currentUser?.userId === answer.userId && (
                        <button
                          onClick={() => handleDeleteAnswer(answer.id!)}
                          className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer select-none"
                          title="Xóa câu trả lời"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {answer.content}
                    </p>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpvoteAnswer(answer.id!)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer select-none",
                          answer.hasUpvoted
                            ? "bg-primary-100/50 border-primary-250 text-primary-700"
                            : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650"
                        )}
                      >
                        <ThumbsUp className="size-3" />
                        <span>{answer.upvoteCount || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer input */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Viết câu trả lời</p>
            <div className="relative">
              <textarea
                value={newAnswerText}
                onChange={(e) => setNewAnswerText(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full min-h-24 rounded-2xl border border-zinc-250 bg-white p-4.5 text-xs text-zinc-900 outline-none transition focus:border-primary-500 pr-12 leading-relaxed"
              />
              <button
                onClick={handleCreateAnswer}
                disabled={isPending || !newAnswerText.trim()}
                className="absolute right-4.5 bottom-4.5 flex size-9 items-center justify-center rounded-xl bg-[#564FFD] text-white hover:bg-[#4338CA] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Gửi câu trả lời"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ───────────────── QUESTIONS LIST VIEW ───────────────── */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-950">Hỏi & Đáp (Q&A)</h3>
              <p className="mt-1 text-xs text-zinc-450 font-medium">Thảo luận cùng giảng viên và học viên khác trong khóa học.</p>
            </div>
            
            <button
              onClick={() => setIsAsking(!isAsking)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#564FFD] px-5 text-xs font-bold text-white hover:bg-[#4338CA] transition select-none cursor-pointer"
            >
              <PlusCircle className="size-4" />
              Đặt câu hỏi mới
            </button>
          </div>

          {/* Ask question form */}
          {isAsking && (
            <div className="rounded-2xl border border-primary-200 bg-primary-50/10 p-5 space-y-4 animate-in slide-in-from-top-1 duration-200">
              <h4 className="text-sm font-bold text-primary-950">Đặt câu hỏi cho bài học này</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-650" htmlFor="q-title">Tiêu đề câu hỏi</label>
                  <input
                    id="q-title"
                    type="text"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn câu hỏi của bạn (e.g. Không chạy được code ở phút 3:15)"
                    className="mt-1.5 w-full rounded-xl border border-zinc-250 bg-white px-4 py-2.5 font-medium text-zinc-900 outline-none focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="font-semibold text-zinc-650" htmlFor="q-content">Chi tiết câu hỏi</label>
                  <textarea
                    id="q-content"
                    value={newQuestionContent}
                    onChange={(e) => setNewQuestionContent(e.target.value)}
                    placeholder="Mô tả chi tiết lỗi gặp phải hoặc câu hỏi bạn cần làm rõ..."
                    className="mt-1.5 w-full min-h-32 rounded-xl border border-zinc-250 bg-white p-4 font-medium text-zinc-900 outline-none focus:border-primary-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-150/50 pt-3">
                <button
                  onClick={() => setIsAsking(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition select-none cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateQuestion}
                  disabled={isPending || !newQuestionTitle.trim() || !newQuestionContent.trim()}
                  className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold text-white hover:bg-primary-750 transition shadow-sm disabled:opacity-50 select-none cursor-pointer"
                >
                  Gửi câu hỏi
                </button>
              </div>
            </div>
          )}

          {/* Filtering and search controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex shrink-0 rounded-xl bg-zinc-100 p-1 select-none text-xs font-bold text-zinc-500">
              <button
                onClick={() => setFilterMode("this-lesson")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 transition-all cursor-pointer",
                  filterMode === "this-lesson" ? "bg-white text-zinc-950 shadow-2xs" : "hover:text-zinc-800"
                )}
              >
                Bài học này
              </button>
              <button
                onClick={() => setFilterMode("all-lessons")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 transition-all cursor-pointer",
                  filterMode === "all-lessons" ? "bg-white text-zinc-950 shadow-2xs" : "hover:text-zinc-800"
                )}
              >
                Tất cả bài học
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-10 pr-4 text-xs font-medium text-zinc-900 outline-none transition focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Questions list container */}
          {loadingQuestions ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
              <Loader2 className="size-7 animate-spin text-primary-500" />
              <p className="text-xs font-bold">Đang tải câu hỏi...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center">
              <HelpCircle className="size-8 mx-auto text-zinc-300" />
              <p className="mt-2 text-sm text-zinc-400 font-medium">Chưa có câu hỏi nào phù hợp.</p>
              <p className="text-xs text-zinc-300 font-medium">Hãy là người đầu tiên đặt câu hỏi cho bài học này!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-150">
              {filteredQuestions.map((q) => {
                const author = q.userId ? userProfiles[q.userId] : undefined;
                
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="group flex items-start gap-4 py-4.5 cursor-pointer first:pt-0 last:pb-0 transition-colors"
                  >
                    {/* Upvote side button */}
                    <button
                      onClick={(e) => handleUpvoteQuestion(q.id!, e)}
                      className={cn(
                        "flex flex-col items-center justify-center w-12 rounded-xl border py-2.5 transition select-none cursor-pointer shrink-0",
                        q.hasUpvoted
                          ? "bg-primary-50/60 border-primary-250 text-primary-700"
                          : "bg-zinc-50/30 border-zinc-150 text-zinc-400 hover:border-zinc-250 hover:bg-white"
                      )}
                    >
                      <ThumbsUp className="size-3.5" />
                      <span className="mt-1 text-xs font-bold tracking-tight font-general">{q.upvoteCount || 0}</span>
                    </button>

                    {/* Question summary text */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="text-sm font-extrabold text-zinc-950 group-hover:text-primary-650 transition-colors line-clamp-1 leading-snug">
                        {q.title}
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                        {q.content}
                      </p>
                      
                      <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 tracking-wider">
                        <span className="font-extrabold text-zinc-650">{author?.name || q.userId || "Ẩn danh"}</span>
                        <span>•</span>
                        <span>{formatDate(q.createdAt)}</span>
                      </div>
                    </div>

                    {/* Reply count icon */}
                    <div className="flex items-center gap-1 rounded-lg bg-zinc-50 border border-zinc-150 px-2 py-1 text-zinc-450 shrink-0 select-none">
                      <MessageSquare className="size-3.5 shrink-0" />
                      <span className="text-xs font-extrabold font-general leading-none">{q.answersCount || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
