"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Trophy,
  Loader2,
  Trash2,
  CheckCircle2,
  Circle,
  PlayCircle,
  HelpCircle,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningPathApi } from "@/services/api/learning-api";
import { CourseApi } from "@/services/api/course-api";
import type { LearningPathResponse, CourseResponse, CourseCurriculumResponse } from "@/types";
import { useConfirmStore } from "@/stores/confirm-store";
import { useToastStore } from "@/stores/toast-store";

interface ResolvedPathItem {
  id?: string;
  courseId?: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle: string;
  lessonType?: "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT" | string;
  isCompleted?: boolean;
  isSuggested?: boolean;
  orderIndex?: number;
}

export function LearningPathsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreatedAlert = searchParams.get("created") === "true";
  const confirm = useConfirmStore((state) => state.confirm);
  const addToast = useToastStore((state) => state.addToast);

  const [activePath, setActivePath] = useState<LearningPathResponse | null>(null);
  const [historyPaths, setHistoryPaths] = useState<LearningPathResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolved active path items with titles and types
  const [resolvedItems, setResolvedItems] = useState<ResolvedPathItem[]>([]);
  const [resolvingItems, setResolvingItems] = useState(false);

  const [isDropPending, startDropTransition] = useTransition();

  // Load active and history paths
  const loadPathsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeRes, historyRes] = await Promise.all([
        LearningPathApi.getActiveLearningPath().catch(() => ({ data: undefined })),
        LearningPathApi.getLearningPaths().catch(() => ({ data: [] })),
      ]);

      const activeData = activeRes.data;
      setActivePath(activeData || null);

      if (historyRes.data) {
        // Exclude the active pathway from history
        const filteredHistory = historyRes.data.filter((p) => p.id !== activeData?.id);
        setHistoryPaths(filteredHistory);
      }
    } catch (err: any) {
      console.error(err);
      setError("Không thể tải thông tin lộ trình học tập.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPathsData();
  }, []);

  // Resolve titles and types for active path items
  useEffect(() => {
    if (!activePath || !activePath.items || activePath.items.length === 0) {
      setResolvedItems([]);
      return;
    }

    let isSubscribed = true;
    const resolveItems = async () => {
      setResolvingItems(true);
      try {
        const uniqueCourseIds = Array.from(
          new Set(activePath.items?.map((item) => item.courseId).filter(Boolean) as string[])
        );

        if (uniqueCourseIds.length === 0) {
          setResolvedItems([]);
          setResolvingItems(false);
          return;
        }

        // Fetch all course details and curriculums parallelly
        const [coursesRes, curriculumsRes] = await Promise.all([
          CourseApi.getCoursesByIds(uniqueCourseIds.join(",")).catch(() => ({ data: [] })),
          Promise.all(
            uniqueCourseIds.map((cId) =>
              CourseApi.getReadableCurriculum(cId)
                .then((res) => ({ courseId: cId, curriculum: res.data }))
                .catch(() => ({ courseId: cId, curriculum: undefined }))
            )
          ),
        ]);

        const coursesList = coursesRes.data || [];

        // Build map of lesson titles by lessonId
        const lessonMap = new Map<string, { title: string; type: string }>();
        curriculumsRes.forEach(({ curriculum }) => {
          if (!curriculum || !curriculum.sections) return;
          curriculum.sections.forEach((section) => {
            if (!section.lessons) return;
            section.lessons.forEach((lesson) => {
              if (lesson.id && lesson.title) {
                lessonMap.set(lesson.id, {
                  title: lesson.title,
                  type: lesson.lessonType || "VIDEO",
                });
              }
            });
          });
        });

        // Map path items to resolved items
        const resolved = (activePath.items || []).map((item) => {
          const course = coursesList.find((c) => c.id === item.courseId);
          const lessonDetails = item.lessonId ? lessonMap.get(item.lessonId) : undefined;

          return {
            id: item.id,
            courseId: item.courseId,
            courseTitle: course?.title || "Khóa học đã lưu",
            lessonId: item.lessonId,
            lessonTitle: lessonDetails?.title || "Bài học đã lưu",
            lessonType: lessonDetails?.type || "VIDEO",
            isCompleted: item.isCompleted,
            isSuggested: item.isSuggested,
            orderIndex: item.orderIndex,
          };
        });

        // Sort items by orderIndex
        resolved.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

        if (isSubscribed) {
          setResolvedItems(resolved);
        }
      } catch (err) {
        console.error("Failed to resolve path items details", err);
      } finally {
        if (isSubscribed) {
          setResolvingItems(false);
        }
      }
    };

    resolveItems();
    return () => {
      isSubscribed = false;
    };
  }, [activePath]);

  // Drop active learning path
  const handleDropActivePath = async () => {
    if (!activePath) return;

    const confirmed = await confirm({
      title: "Xóa lộ trình học tập",
      message: "Bạn có chắc chắn muốn xóa lộ trình học tập đang hoạt động này không? Hành động này không thể hoàn tác.",
      confirmText: "Xóa lộ trình",
      cancelText: "Không",
      type: "danger",
    });
    if (!confirmed) return;

    startDropTransition(async () => {
      try {
        await LearningPathApi.dropActiveLearningPath();
        setActivePath(null);
        setResolvedItems([]);
        // Reload details
        loadPathsData();
      } catch (err) {
        console.error("Failed to drop learning path", err);
        addToast("Có lỗi xảy ra khi xóa lộ trình học tập.", "error", "Lỗi");
      }
    });
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="size-4 text-[#7872FD]" />;
      case "ARTICLE":
        return <FileText className="size-4 text-[#FD8E1F]" />;
      case "QUIZ":
        return <Trophy className="size-4 text-[#27ae60]" />;
      case "ASSIGNMENT":
        return <Award className="size-4 text-[#8E94A3]" />;
      default:
        return <HelpCircle className="size-4 text-[#8E94A3]" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
        <Loader2 className="size-10 animate-spin text-[#7872FD]" />
        <p className="mt-4 text-sm text-[#6E7485]">Đang tải lộ trình học tập của bạn...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-10 lg:px-8">
      {/* Alert toast for path creation */}
      {showCreatedAlert && (
        <div className="mb-8 flex items-center gap-3 rounded-[18px] bg-[#E7F7ED] border border-[#BBF7D0] p-4 text-sm text-[#19703E] animate-note-pop">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <strong className="font-semibold">Lộ trình mới đã được tạo thành công!</strong>
            <span className="ml-1">Bắt đầu học tập ngay bây giờ theo kế hoạch của AI.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-[18px] bg-[#FEEFF0] border border-[#FECACA] p-4 text-sm text-[#EB5757]">
          <AlertCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase text-[#7872FD]">Learning Hub</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#1D2026] sm:text-4xl">
            My Learning Pathways
          </h1>
          <p className="mt-3 text-base text-[#6E7485]">
            Theo dõi tiến độ, hoàn thành bài học, và tối ưu hóa lộ trình sự nghiệp công nghệ của bạn.
          </p>
        </div>

        {/* ACTIVE PATHWAY SECTION */}
        {activePath ? (
          <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
            {/* Left: Path checklist */}
            <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9EAF0] pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2026]">
                    {activePath.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#6E7485] leading-relaxed">
                    {activePath.description}
                  </p>
                </div>
                <button
                  onClick={handleDropActivePath}
                  disabled={isDropPending}
                  className="h-10 rounded-xl border border-[#FECACA] bg-[#FEEFF0] px-4 text-xs font-semibold text-[#EB5757] hover:bg-[#FDD5D7] transition inline-flex items-center gap-1.5 shrink-0"
                >
                  {isDropPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Hủy lộ trình
                </button>
              </div>

              {/* Progress visual */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-[#1D2026]">Tiến độ lộ trình học tập</span>
                  <span className="text-[#564FFD]">
                    {activePath.currentProgress?.toFixed(1) || 0}% ({activePath.completedItems} / {activePath.totalItems} bài)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#EBEBFF]">
                  <div
                    className="h-full rounded-full bg-[#564FFD] transition-all duration-500"
                    style={{ width: `${activePath.currentProgress || 0}%` }}
                  />
                </div>
              </div>

              {/* Items checklist timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C94A3]">
                  Danh sách bài học
                </h3>

                {resolvingItems ? (
                  <div className="flex py-10 items-center justify-center gap-2 text-sm text-[#6E7485]">
                    <Loader2 className="size-4 animate-spin text-[#7872FD]" /> Đang giải mã tiêu đề bài học...
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[#EBEBFF] ml-3 pl-6 space-y-6">
                    {resolvedItems.map((item, idx) => {
                      const isCompleted = item.isCompleted;

                      return (
                        <div key={item.id || idx} className="relative group">
                          {/* Stepper icon/node */}
                          <span className="absolute -left-[35px] top-0.5 flex size-[18px] items-center justify-center rounded-full bg-white">
                            {isCompleted ? (
                              <CheckCircle2 className="size-5 text-[#27ae60] shrink-0 bg-white" />
                            ) : (
                              <Circle className="size-5 text-[#C6CAD1] shrink-0 bg-white group-hover:text-[#7872FD] transition" />
                            )}
                          </span>

                          <div className="flex items-start justify-between gap-4 border border-[#E9EAF0] p-4 rounded-[16px] hover:border-[#D8D6FF] transition bg-[#FAFAFD] group-hover:bg-white group-hover:shadow-[0_8px_20px_rgba(29,32,38,0.04)]">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8C94A3]">
                                  {getLessonIcon(item.lessonType)}
                                  {item.lessonType}
                                </span>
                                {item.isSuggested && (
                                  <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[9px] font-semibold text-[#B85C00]">
                                    Gợi ý từ AI
                                  </span>
                                )}
                              </div>
                              <h4 className={cn("text-sm font-semibold text-[#1D2026]", isCompleted && "text-[#8E94A3] line-through")}>
                                {item.lessonTitle}
                              </h4>
                              <p className="text-xs text-[#6E7485] mt-1">
                                {item.courseTitle}
                              </p>
                            </div>

                            {/* Go to study link */}
                            <Link
                              href={`/learning/${item.courseId}?lessonId=${item.lessonId}`}
                              className="h-9 rounded-lg bg-white border border-[#E9EAF0] hover:border-[#7872FD] px-3.5 text-xs font-semibold text-[#1D2026] hover:text-[#564FFD] transition flex items-center gap-1 shrink-0"
                            >
                              Vào học <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: quick stats / tips */}
            <div className="space-y-6">
              {/* Stats card */}
              <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1D2026] mb-4">Pathway Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FAFAFD] border border-[#E9EAF0] p-4 rounded-[18px]">
                    <p className="text-2xl font-bold text-[#564FFD]">
                      {resolvedItems.filter((i) => i.isSuggested).length}
                    </p>
                    <p className="text-[11px] text-[#6E7485] mt-1 font-semibold">Bài học đề xuất</p>
                  </div>
                  <div className="bg-[#FAFAFD] border border-[#E9EAF0] p-4 rounded-[18px]">
                    <p className="text-2xl font-bold text-[#27ae60]">
                      {resolvedItems.filter((i) => i.isCompleted).length}
                    </p>
                    <p className="text-[11px] text-[#6E7485] mt-1 font-semibold">Bài đã hoàn thành</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#E9EAF0] pt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6E7485]">
                    <span>Tổng số khóa học tích hợp:</span>
                    <strong className="font-semibold text-[#1D2026]">
                      {Array.from(new Set(resolvedItems.map((i) => i.courseId))).length} khóa
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6E7485]">
                    <span>Trạng thái:</span>
                    <span className="rounded-full bg-[#E7F7ED] px-2 py-0.5 text-[10px] font-semibold text-[#19703E]">
                      {activePath.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation invitation */}
              <div className="rounded-[24px] bg-gradient-to-br from-[#564FFD] to-[#7872FD] p-6 text-white shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-lg font-bold">Cần tùy chỉnh lộ trình?</h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Bạn có thể thay đổi, xóa bớt bài học, reorder thứ tự học, hoặc thêm các gợi ý khóa học liên quan bằng cách nói chuyện lại với AI assistant.
                  </p>
                  <Link
                    href="/ai-assistant"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-[#564FFD] transition hover:bg-[#EBEBFF]"
                  >
                    Mở AI Assistant <ArrowRight className="size-3.5" />
                  </Link>
                </div>
                <Compass className="absolute -right-6 -bottom-6 size-32 text-white/10" />
              </div>
            </div>
          </section>
        ) : (
          /* EMPTY STATE */
          <div className="rounded-[24px] border border-dashed border-[#C6CAD1] bg-[#F8F8FF] py-14 px-6 text-center max-w-xl mx-auto">
            <Compass className="size-12 text-[#7872FD] mx-auto animate-soft-float" />
            <h3 className="mt-4 text-lg font-bold text-[#1D2026]">Bạn chưa có lộ trình đang hoạt động</h3>
            <p className="mt-2 text-sm text-[#6E7485] leading-relaxed">
              Bạn có thể dễ dàng thiết kế một lộ trình học tập cá nhân hóa thông qua AI Assistant của Cinx, giúp bạn tập trung vào bài học cốt lõi theo thời gian định trước.
            </p>
            <Link
              href="/ai-assistant"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#564FFD] px-6 text-sm font-semibold text-white transition hover:bg-[#4338CA] shadow-[0_4px_12px_rgba(86,79,253,0.2)]"
            >
              Thiết kế lộ trình với AI
            </Link>
          </div>
        )}

        {/* HISTORICAL PATHWAYS LIST */}
        {historyPaths.length > 0 && (
          <section className="mt-6 border-t border-[#E9EAF0] pt-10">
            <h3 className="text-xl font-bold text-[#1D2026] mb-6 flex items-center gap-2">
              <Award className="size-5 text-[#564FFD]" /> Historical Pathways
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {historyPaths.map((path) => (
                <div
                  key={path.id}
                  className="rounded-[20px] border border-[#E9EAF0] bg-white p-5 hover:border-[#D8D6FF] transition flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          path.status === "COMPLETED"
                            ? "bg-[#E7F7ED] text-[#19703E]"
                            : "bg-[#F1F2F4] text-[#717684]"
                        )}
                      >
                        {path.status}
                      </span>
                      <span className="text-xs text-[#8C94A3]">
                        {path.completedItems}/{path.totalItems} bài học
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#1D2026] line-clamp-1">
                      {path.title}
                    </h4>
                    <p className="text-xs text-[#6E7485] mt-1.5 line-clamp-2 leading-relaxed">
                      {path.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#E1E2E6] pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-[#8C94A3] uppercase">Tiến trình</p>
                      <p className="text-xs font-bold text-[#1D2026] mt-0.5">
                        {path.currentProgress?.toFixed(1) || 0}%
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        // Make this pathway active (we can request confirmation or call endpoint)
                        // If endpoint supports activating a path, we do that. For now we fetch its details
                        // or link to its components.
                      }}
                      className="text-xs font-semibold text-[#7872FD] hover:text-[#564FFD] flex items-center gap-1 hover:underline"
                    >
                      Chi tiết <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
