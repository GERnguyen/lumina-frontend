import React, { useState } from "react";
import { CheckCircle2, BarChart3, PenLine, HelpCircle } from "lucide-react";
import type { InstructorQuizLessonData } from "@/services/actions/instructor";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { Select, DataTableEmptyState } from "@/components/ui/shared";

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
  const [lessonFilter, setLessonFilter] = useState("all");
  const visible = lessonFilter === "all" ? quizzes : quizzes.filter((quiz) => quiz.lessonId === lessonFilter);

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
              const avgAccuracy = quiz.analytics.length
                ? Math.round(
                    quiz.analytics.reduce((sum, item) => sum + (item.accuracy || 0), 0) /
                      quiz.analytics.length
                  )
                : 0;

              return (
                <div key={quiz.lessonId} className="rounded-xl border border-zinc-200 bg-zinc-50/20 p-5 space-y-4">
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

                  {/* Question details accuracy items */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">Chi tiết độ chính xác từng câu hỏi</p>
                    {quiz.analytics.length === 0 ? (
                      <p className="text-xs text-zinc-400 font-medium italic">Chưa có dữ liệu phân tích câu hỏi.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {quiz.analytics.slice(0, 6).map((item, idx) => {
                          const questionText = quiz.questions?.find((q) => q.id === item.questionId)?.questionText || item.questionId;
                          return (
                            <div key={item.questionId || idx} className="rounded-xl border border-zinc-200/70 bg-white p-3.5 space-y-2">
                              <div className="flex items-center justify-between gap-3 text-xs font-bold text-zinc-500 font-general">
                                <span className="truncate max-w-[70%]" title={questionText}>{questionText}</span>
                                <span className="text-zinc-400">
                                  {item.correctAttempts || 0}/{item.totalAttempts || 0} đúng
                                </span>
                              </div>
                            <div className="flex items-center gap-3">
                              <ProgressBar value={item.accuracy || 0} />
                              <span className="text-xs font-bold text-zinc-650 font-general shrink-0">{Math.round(item.accuracy || 0)}%</span>
                            </div>
                          </div>
                        );
                      })}
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
