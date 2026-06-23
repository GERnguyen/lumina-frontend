import React from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Star,
  Users,
} from "lucide-react";
import type {
  CourseCurriculumResponse,
  CourseResponse,
  CourseEngagementOverviewResponse,
  CourseStatisticsResponse,
  ReviewStatisticsResponse,
  CourseQnAStatisticsResponse,
} from "@/types";
import { formatMoney } from "@/lib/format";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";
import { DataTableEmptyState } from "@/components/ui/shared";

interface OverviewData {
  statistics: CourseStatisticsResponse | null;
  engagement: CourseEngagementOverviewResponse | null;
  reviewStats: ReviewStatisticsResponse | null;
  qnaStats: CourseQnAStatisticsResponse | null;
}

interface OverviewTabProps {
  course: CourseResponse | null;
  curriculum: CourseCurriculumResponse | null;
  overview: OverviewData;
}

function percent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0%";
  return `${Math.round(value)}%`;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "primary",
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "emerald" | "blue" | "amber";
}) {
  const bgMap = {
    primary: "bg-primary-50 border-primary-100/50 text-primary-650",
    emerald: "bg-emerald-50 border-emerald-100/50 text-emerald-650",
    blue: "bg-blue-50 border-blue-100/50 text-blue-650",
    amber: "bg-amber-50 border-amber-100/50 text-amber-650",
  };

  return (
    <div className="rounded-xl border border-zinc-200/70 bg-white p-5 shadow-xs select-none hover:shadow-md/5 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950 font-general">{value}</p>
          <p className="mt-1 text-xs text-zinc-400 font-medium">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-2.5 border ${bgMap[variant]}`}>
          <Icon className="size-5 shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function OverviewTab({ course, curriculum, overview }: OverviewTabProps) {
  const isDraft = course?.status === "DRAFT";
  const sections = curriculum?.sections || [];
  const lessons = sections.flatMap((section) => section.lessons || []);
  const videoCount = lessons.filter((lesson) => lesson.lessonType === "VIDEO").length;
  const quizCount = lessons.filter((lesson) => lesson.lessonType === "QUIZ").length;
  const assignmentCount = lessons.filter((lesson) => lesson.lessonType === "ASSIGNMENT").length;

  return (
    <div className="space-y-6">
      {/* Overview Statistics Metrics Grid (hidden for Draft courses) */}
      {!isDraft && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Doanh thu gross"
            value={formatMoney(overview.statistics?.totalGrossRevenue)}
            subtitle="Tổng doanh thu khóa học"
            icon={BarChart3}
            variant="primary"
          />
          <MetricCard
            title="Doanh thu net"
            value={formatMoney(overview.statistics?.totalNetRevenue)}
            subtitle="Sau phí nền tảng"
            icon={CheckCircle2}
            variant="emerald"
          />
          <MetricCard
            title="Tiến độ TB"
            value={percent(overview.engagement?.averageProgressPercent)}
            subtitle="Trung bình trong khóa"
            icon={GraduationCap}
            variant="blue"
          />
          <MetricCard
            title="Hoàn thành"
            value={percent(overview.engagement?.completionRate)}
            subtitle="Tỷ lệ hoàn thành"
            icon={Award}
            variant="amber"
          />
        </section>
      )}

      {/* Main content section */}
      <section className={isDraft ? "block" : "grid grid-cols-1 gap-6 xl:grid-cols-3"}>
        {/* Left column: Curriculum structure */}
        <InstructorCard
          title="Cấu trúc nội dung"
          subtitle="Tổng hợp từ curriculum hiện tại"
          className={isDraft ? "w-full border-zinc-200/50" : "xl:col-span-2 border-zinc-200/50"}
          bodyClassName="space-y-5"
        >
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <MetricCard title="Section" value={sections.length} subtitle="Chương học" icon={BookOpen} variant="primary" />
            <MetricCard title="Lesson" value={lessons.length} subtitle="Tổng nội dung" icon={FileText} variant="blue" />
            <MetricCard title="Video" value={videoCount} subtitle="Bài video" icon={Eye} variant="emerald" />
            <MetricCard
              title="Quiz/Bài tập"
              value={`${quizCount}/${assignmentCount}`}
              subtitle="Đánh giá học viên"
              icon={ClipboardCheck}
              variant="amber"
            />
          </div>

          <div className="mt-5 space-y-3.5">
            {sections.length === 0 ? (
              <DataTableEmptyState
                icon={BookOpen}
                title="Chưa có curriculum"
                description="Nội dung khóa học sẽ xuất hiện ở đây sau khi được tạo."
              />
            ) : (
              sections.map((section, idx) => (
                <div key={section.id || section.title || idx} className="rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 hover:border-zinc-200 transition-all duration-200">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2">
                    <p className="font-bold text-zinc-900 text-sm">Chương {idx + 1}: {section.title || "Chưa đặt tên"}</p>
                    <span className="text-[10px] font-bold uppercase bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-0.5 rounded-md">
                      {section.lessons?.length || 0} bài học
                    </span>
                  </div>
                  {section.description && (
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-medium">{section.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(section.lessons || []).map((lesson) => (
                      <span
                        key={lesson.id || lesson.title}
                        className="inline-flex items-center rounded-md bg-white border border-zinc-200/70 px-2.5 py-1 text-xs font-semibold text-zinc-650 shadow-2xs select-none"
                      >
                        {lesson.title || "Untitled"} · {lesson.lessonType || "--"}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </InstructorCard>

        {/* Right column: Unpublished stats or review details */}
        {!isDraft && (
          <InstructorCard
            title="Tương tác"
            subtitle="Review, Q&A và hoạt động học"
            className="border-zinc-200/50"
            bodyClassName="space-y-4"
          >
            <MetricCard
              title="Rating TB"
              value={overview.reviewStats?.averageRating?.toFixed(1) || "--"}
              subtitle={`${overview.reviewStats?.reviewCount || 0} review`}
              icon={Star}
              variant="amber"
            />
            <MetricCard
              title="Câu hỏi chưa trả lời"
              value={overview.qnaStats?.unansweredQuestionCount || 0}
              subtitle={`Tỷ lệ phản hồi ${percent(overview.qnaStats?.instructorAnswerRate)}`}
              icon={HelpCircle}
              variant="primary"
            />
            <MetricCard
              title="Học viên active"
              value={overview.engagement?.activeLearnersInRange || 0}
              subtitle="Trong khoảng thống kê"
              icon={Users}
              variant="blue"
            />
          </InstructorCard>
        )}
      </section>

      {/* Publication detail row */}
      <InstructorCard
        title="Thông tin xuất bản"
        subtitle="Trạng thái khóa học và cấu hình chứng chỉ"
        className="border-zinc-200/50 shadow-xs"
      >
        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4 select-none">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Giá khóa học</p>
            <p className="font-extrabold text-zinc-950 font-general text-base">
              {formatMoney(course?.discountedPrice ?? course?.price)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Chứng chỉ</p>
            <p className="font-bold text-zinc-800 text-sm truncate">
              {course?.hasCertificate ? course.certificateTitle || "Có chứng chỉ" : "Không bật"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ngày tạo khóa</p>
            <p className="font-bold text-zinc-800 text-sm">
              {course?.createdAt ? new Date(course.createdAt).toLocaleDateString("vi-VN") : "--"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cập nhật lần cuối</p>
            <p className="font-bold text-zinc-800 text-sm">
              {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString("vi-VN") : "--"}
            </p>
          </div>
        </div>
      </InstructorCard>
    </div>
  );
}
