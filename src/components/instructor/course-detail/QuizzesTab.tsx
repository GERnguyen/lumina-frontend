import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, BarChart3, PenLine, HelpCircle, ChevronDown, ChevronUp, Users } from "lucide-react";
import type { InstructorQuizLessonData } from "@/services/actions/instructor";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { Select, DataTableEmptyState } from "@/components/ui/shared";
import { UserApi } from "@/services/api/user-api";
import { QuizAttemptsList } from "./QuizAttemptsList";

interface QuizzesTabProps {
  quizzes: InstructorQuizLessonData[];
}

function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/40">
      <div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${width}%` }} />
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/70 bg-white p-4.5 shadow-2xs select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">{title}</p>
          <p className="mt-1.5 text-xl font-extrabold tracking-tight text-zinc-950 font-general">{value}</p>
          <p className="mt-0.5 text-xs text-zinc-400 font-medium">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-200/50 p-2 text-zinc-500">
          <Icon className="size-4.5 shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function QuizzesTab({ quizzes }: QuizzesTabProps) {
  const router = useRouter();
  const [lessonFilter, setLessonFilter] = useState("all");
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; email?: string }>>({});
  const [expandedAnalytics, setExpandedAnalytics] = useState<Record<string, boolean>>({});
  const [expandedAttempts, setExpandedAttempts] = useState<Record<string, boolean>>({});

  const visible = lessonFilter === "all" ? quizzes : quizzes.filter((quiz) => quiz.lessonId === lessonFilter);

  // Hydrate user profiles from student attempts
  useEffect(() => {
    async function hydrateUsers() {
      const studentIds = Array.from(
        new Set(
          quizzes.flatMap((q) => q.sessions.map((s) => s.userId || s.quizSessionSubmission?.userId).filter(Boolean))
        )
      ) as string[];

      if (!studentIds.length) return;

      const missingIds = studentIds.filter((id) => !userProfiles[id]);
      if (!missingIds.length) return;

      try {
        const res = await UserApi.getUsersByIds(missingIds.join(",")).catch(() => undefined);
        const users = res?.data || [];
        const newEntries = users.reduce((acc, user) => {
          if (user.userId) {
            acc[user.userId] = {
              name: user.name || "Lumina learner",
              email: user.email,
            };
          }
          return acc;
        }, {} as Record<string, { name: string; email?: string }>);

        missingIds.forEach((id) => {
          if (!newEntries[id]) {
            newEntries[id] = {
              name: "Lumina learner",
              email: undefined,
            };
          }
        });

        setUserProfiles((current) => ({ ...current, ...newEntries }));
      } catch (err) {
        console.error("Failed to fetch student profiles in quizzes tab:", err);
      }
    }

    hydrateUsers();
  }, [quizzes]);

  const toggleAnalytics = (lessonId: string) => {
    setExpandedAnalytics((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const toggleAttempts = (lessonId: string) => {
    setExpandedAttempts((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <InstructorCard
        title="Báo cáo Quiz"
        subtitle={`${quizzes.length} bài trắc nghiệm trong khóa học`}
        className="border-zinc-200/50 shadow-xs"
        headerAction={
          <Select
            value={lessonFilter}
            onValueChange={setLessonFilter}
            options={[
              { value: "all", label: "Tất cả bài quiz" },
              ...quizzes.map((quiz) => ({ value: quiz.lessonId, label: quiz.lessonTitle })),
            ]}
            className="w-56"
            triggerClassName="h-9 text-xs font-bold rounded-lg border-zinc-200 bg-transparent text-zinc-700"
          />
        }
      >
        {visible.length === 0 ? (
          <DataTableEmptyState
            icon={HelpCircle}
            title="Chưa có quiz"
            description="Số liệu thống kê sẽ xuất hiện khi khóa học có quiz lesson."
          />
        ) : (
          <div className="space-y-6">
            {visible.map((quiz) => {
              const submitted = quiz.sessions.filter(
                (session) => session.status === "SUBMITTED" || session.status === "GRADED"
              ).length;
              const pending = quiz.sessions.filter((session) => session.status === "PENDING_GRADE").length;

              // Calculate average accuracy correctly
              const avgAccuracy = quiz.analytics.length
                ? Math.round(
                  quiz.analytics.reduce((sum, item) => {
                    const total = item.totalAttempts || 0;
                    const correct = item.correctAttempts || 0;
                    const pct = total
                      ? (correct / total) * 100
                      : (typeof item.accuracy === "number" ? (item.accuracy <= 1 ? item.accuracy * 100 : item.accuracy) : 0);
                    return sum + pct;
                  }, 0) / quiz.analytics.length
                )
                : 0;

              return (
                <div key={quiz.lessonId} className="rounded-xl border border-zinc-200 bg-zinc-50/20 p-5 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-150 pb-3">
                    <div>
                      <p className="text-base font-bold text-zinc-950">{quiz.lessonTitle}</p>
                      <p className="mt-1 text-xs font-bold text-zinc-400">{quiz.sectionTitle || "Không rõ chương học"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 select-none">
                      <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-0.5 text-xs font-semibold text-zinc-600">
                        {quiz.questionCount} câu hỏi
                      </span>
                      <span className="rounded-full bg-primary-50 border border-primary-200/50 px-3 py-0.5 text-xs font-semibold text-primary-750">
                        {quiz.sessions.length} lượt làm
                      </span>
                      <span className="rounded-full bg-amber-50 border border-amber-200/50 px-3 py-0.5 text-xs font-semibold text-amber-750">
                        {pending} cần chấm
                      </span>
                    </div>
                  </div>

                  {/* Summary Metric widgets */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MetricCard title="Đã nộp / Đã chấm" value={submitted} subtitle="Phiên nộp bài hoàn thành" icon={CheckCircle2} />
                    <MetricCard title="Tỉ lệ đúng TB" value={`${avgAccuracy}%`} subtitle="Tổng hợp các câu hỏi" icon={BarChart3} />
                    <MetricCard title="Cần chấm tay" value={pending} subtitle="Câu tự luận chưa chấm" icon={PenLine} />
                  </div>

                  {/* Collapsible Question Details Accuracy (Default Collapsed) */}
                  <div className="border-t border-zinc-150 pt-4">
                    <button
                      onClick={() => toggleAnalytics(quiz.lessonId)}
                      className="flex w-full items-center justify-between py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-450 hover:text-zinc-700 transition-colors select-none outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="size-4 shrink-0" />
                        Chi tiết độ chính xác từng câu hỏi
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-zinc-400 capitalize">
                          {expandedAnalytics[quiz.lessonId] ? "Thu gọn" : "Mở rộng"}
                        </span>
                        {expandedAnalytics[quiz.lessonId] ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </div>
                    </button>

                    {expandedAnalytics[quiz.lessonId] && (
                      <div className="mt-3.5 space-y-3 animate-fade-down duration-200">
                        {quiz.analytics.length === 0 ? (
                          <p className="text-xs text-zinc-400 font-medium italic">Chưa có dữ liệu phân tích câu hỏi.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 animate-in fade-in slide-in-from-top-1">
                            {quiz.analytics.slice(0, 12).map((item, idx) => {
                              const questionText = quiz.questions?.find((q) => q.id === item.questionId)?.questionText || item.questionId;

                              // Correct accuracy percentage
                              const total = item.totalAttempts || 0;
                              const correct = item.correctAttempts || 0;
                              const accuracyPercent = total
                                ? Math.round((correct / total) * 100)
                                : (typeof item.accuracy === "number" ? Math.round(item.accuracy <= 1 ? item.accuracy * 100 : item.accuracy) : 0);

                              return (
                                <div key={item.questionId || idx} className="rounded-xl border border-zinc-200/70 bg-white p-3.5 space-y-2">
                                  <div className="flex items-center justify-between gap-3 text-xs font-bold text-zinc-500 font-general">
                                    <span className="truncate max-w-[70%]" title={questionText}>{questionText}</span>
                                    <span className="text-zinc-455 font-medium shrink-0">
                                      {correct}/{total} đúng
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <ProgressBar value={accuracyPercent} />
                                    <span className="text-xs font-bold text-zinc-650 font-general shrink-0">{accuracyPercent}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Collapsible Student Attempt History (Default Collapsed) */}
                  <div className="border-t border-zinc-150 pt-4">
                    <button
                      onClick={() => toggleAttempts(quiz.lessonId)}
                      className="flex w-full items-center justify-between py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-450 hover:text-zinc-700 transition-colors select-none outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="size-4 shrink-0" />
                        Kết quả và lượt làm bài của học viên
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-zinc-400 capitalize">
                          {expandedAttempts[quiz.lessonId] ? "Thu gọn" : "Mở rộng"}
                        </span>
                        {expandedAttempts[quiz.lessonId] ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </div>
                    </button>

                    {expandedAttempts[quiz.lessonId] && (
                      <div className="mt-3.5 space-y-3 animate-fade-down duration-200">
                        <QuizAttemptsList
                          sessions={quiz.sessions}
                          userProfiles={userProfiles}
                          onGradeSuccess={() => {
                            router.refresh();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </InstructorCard>
    </div>
  );
}
