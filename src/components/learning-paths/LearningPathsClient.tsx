"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LearningPathApi, LearningProgressApi } from "@/services/api/learning-api";
import { CourseApi } from "@/services/api/course-api";
import type { LearningPathResponse, LearningPathItemResponse } from "@/types";
import { Award, BookOpen, Calendar, ChevronRight, Loader2, PlayCircle, Plus, Trash2, CheckCircle } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import { useToastStore } from "@/stores/toast-store";

interface LearningPathsClientProps {
  header: React.ReactNode;
  footer: React.ReactNode;
}

type LearningPathItemWithDetails = LearningPathItemResponse & {
  courseTitle: string;
  lessonTitle: string;
};

type LearningPathWithDetails = LearningPathResponse & {
  itemsWithDetails?: LearningPathItemWithDetails[];
};

export function LearningPathsClient({ header, footer }: LearningPathsClientProps) {
  const addToast = useToastStore((state) => state.addToast);
  const [activePath, setActivePath] = useState<LearningPathWithDetails | null>(null);
  const [allPaths, setAllPaths] = useState<LearningPathResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropConfirm, setShowDropConfirm] = useState(false);
  const [dropping, setDropping] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all paths and active path in parallel
      const [allRes, activeRes] = await Promise.all([
        LearningPathApi.getLearningPaths().catch(() => ({ data: [] })),
        LearningPathApi.getActiveLearningPath().catch(() => ({ data: null })),
      ]);

      setAllPaths(allRes.data || []);

      const rawActive = activeRes.data;
      if (rawActive && rawActive.id) {
        // Resolve course and lesson names for active path
        const resolved = await resolvePathDetails(rawActive);
        setActivePath(resolved);
      } else {
        setActivePath(null);
      }
    } catch (err: any) {
      console.error("Failed to load learning paths data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu lộ trình học tập.");
    } finally {
      setLoading(false);
    }
  }

  async function resolvePathDetails(path: LearningPathResponse): Promise<LearningPathWithDetails> {
    if (!path.items || path.items.length === 0) {
      return { ...path, itemsWithDetails: [] };
    }

    const uniqueCourseIds = Array.from(new Set(path.items.map((i) => i.courseId).filter(Boolean)));

    try {
      const courseDetails = await Promise.all(
        uniqueCourseIds.map(async (courseId) => {
          try {
            const [courseRes, curriculumRes, progressRes] = await Promise.all([
              CourseApi.getReadableCourseById(courseId!),
              CourseApi.getReadableCurriculum(courseId!),
              LearningProgressApi.getLearningItemProgressByCourseId(courseId!).catch(() => ({ data: [] }))
            ]);
            return {
              courseId,
              course: courseRes.data,
              curriculum: curriculumRes.data,
              progress: progressRes.data || [],
            };
          } catch (err) {
            console.error(`Failed to fetch details for course ${courseId}:`, err);
            return { courseId, course: null, curriculum: null, progress: [] };
          }
        })
      );

      const itemsWithDetails = path.items.map((item) => {
        const detail = courseDetails.find((d) => d.courseId === item.courseId);
        let lessonTitle = `Bài học ID: ${item.lessonId?.substring(0, 8)}...`;
        if (detail?.curriculum?.sections) {
          for (const section of detail.curriculum.sections) {
            const lesson = section.lessons?.find((l: any) => l.id === item.lessonId);
            if (lesson) {
              lessonTitle = lesson.title || lessonTitle;
              break;
            }
          }
        }

        const isCompleted = detail?.progress?.find((p: any) => p.itemId === item.lessonId)?.isCompleted || item.isCompleted || false;

        return {
          ...item,
          isCompleted,
          courseTitle: detail?.course?.title || "Khóa học không tên",
          lessonTitle,
        };
      });

      const completedItems = itemsWithDetails.filter((i) => i.isCompleted).length;
      const totalItems = itemsWithDetails.length;
      const currentProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...path,
        completedItems,
        totalItems,
        currentProgress,
        itemsWithDetails,
      };
    } catch (err) {
      console.error("Error resolving path details:", err);
      return {
        ...path,
        itemsWithDetails: path.items.map((item) => ({
          ...item,
          courseTitle: `Khóa học ID: ${item.courseId?.substring(0, 8)}...`,
          lessonTitle: `Bài học ID: ${item.lessonId?.substring(0, 8)}...`,
        })),
      };
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDropActivePath() {
    try {
      setDropping(true);
      await LearningPathApi.dropActiveLearningPath();
      setShowDropConfirm(false);
      await loadData();
    } catch (err) {
      console.error("Failed to drop learning path:", err);
      addToast("Hủy lộ trình thất bại. Vui lòng thử lại.", "error", "Lỗi");
    } finally {
      setDropping(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      {header}

      <div className="mx-auto max-w-[1320px] px-6 py-10 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-[#6E7485]">
          <Link href="/my-learning" className="hover:text-[#564FFD] transition">My Learning</Link>
          <ChevronRight className="size-4" />
          <span className="text-[#1D2026]">Learning Paths</span>
        </nav>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D2026]">Lộ trình học tập cá nhân</h1>
            <p className="mt-2 text-[#6E7485]">Tự thiết kế lộ trình học riêng theo bài học và tiến độ của bạn.</p>
          </div>
          <Link
            href="/learning-paths/create"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-6 text-base font-semibold text-white hover:bg-[#433EE8] shadow-md transition duration-300"
          >
            <Plus className="size-5" />
            <span>Tạo lộ trình mới</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="size-10 animate-spin text-[#564FFD]" />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[18px] border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-base font-semibold text-red-800">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[18px] bg-red-100 px-4 text-sm font-semibold text-red-800 hover:bg-red-200 transition"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Left/Middle: Active Path and History */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Path Section */}
              <section>
                <h2 className="text-xl font-semibold text-[#1D2026]">Lộ trình đang thực hiện</h2>

                {activePath ? (
                  <div className="mt-4 overflow-hidden rounded-[18px] border border-[#D8D6FF] bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-[#EBEBFF] px-3 py-1 text-xs font-semibold text-[#564FFD]">
                          Đang hoạt động
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold text-[#1D2026]">{activePath.title}</h3>
                        {activePath.description && (
                          <p className="mt-2 text-sm leading-relaxed text-[#6E7485]">{activePath.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => setShowDropConfirm(true)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Hủy lộ trình này"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#4E5566]">Tiến độ học tập</span>
                        <span className="font-semibold text-[#23BD33]">
                          {activePath.completedItems} / {activePath.totalItems} bài học ({activePath.currentProgress}%)
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#F5F7FA]">
                        <div
                          className="h-full rounded-full bg-[#23BD33] transition-all duration-500"
                          style={{ width: `${activePath.currentProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Lesson Timeline */}
                    <div className="mt-8 border-t border-[#E9EAF0] pt-6">
                      <h4 className="font-semibold text-[#1D2026]">Các bước trong lộ trình</h4>
                      <div className="mt-4 relative pl-6 border-l-2 border-dashed border-[#EBEBFF] space-y-6">
                        {activePath.itemsWithDetails?.map((item, index) => {
                          const isCompleted = item.isCompleted;
                          return (
                            <div key={item.id || index} className="relative">
                              {/* Step dot */}
                              <div
                                className={`absolute -left-[31px] top-1.5 flex size-4 items-center justify-center rounded-full border-2 ${
                                  isCompleted
                                    ? "border-[#23BD33] bg-[#23BD33] text-white"
                                    : "border-[#7872FD] bg-white"
                                }`}
                              >
                                {isCompleted && <span className="block size-1.5 rounded-full bg-white" />}
                              </div>

                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                  <span className="text-[11px] font-semibold text-[#8C94A3] uppercase">
                                    Bước {index + 1}: {item.courseTitle}
                                  </span>
                                  <h5 className="text-base font-semibold text-[#1D2026] mt-0.5">{item.lessonTitle}</h5>
                                </div>

                                <Link
                                  href={`/learning/${item.courseId}?lessonId=${item.lessonId}`}
                                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold tracking-normal transition ${
                                    isCompleted
                                      ? "bg-[#E6FBD9] text-[#1E7E34] hover:bg-[#d4f7c5]"
                                      : "bg-[#564FFD] text-white hover:bg-[#433EE8]"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="size-4" />
                                      <span>Học lại</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="size-4" />
                                      <span>Học ngay</span>
                                    </>
                                  )}
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[18px] border border-dashed border-[#D8D6FF] bg-white p-10 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
                      <BookOpen className="size-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#1D2026]">Chưa kích hoạt lộ trình nào</h3>
                    <p className="mt-2 text-sm text-[#6E7485] max-w-sm mx-auto">
                      Hãy tự tạo một lộ trình học tập cá nhân hóa để liên kết các bài học theo thứ tự mong muốn của bạn.
                    </p>
                    <Link
                      href="/learning-paths/create"
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#EBEBFF] px-5 text-sm font-semibold text-[#564FFD] hover:bg-[#DEDDFF] transition"
                    >
                      Bắt đầu tạo lộ trình
                    </Link>
                  </div>
                )}
              </section>

              {/* History Section */}
              <section>
                <h2 className="text-xl font-semibold text-[#1D2026]">Lịch sử lộ trình học</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {allPaths.filter(p => p.id !== activePath?.id).length > 0 ? (
                    allPaths
                      .filter(p => p.id !== activePath?.id)
                      .map((path) => {
                        const status = path.status || "ACTIVE";
                        const isCompleted = status === "COMPLETED";
                        const isDropped = status === "DROPPED";
                        
                        let badgeBg = "bg-[#E6FBD9] text-[#1E7E34]"; // COMPLETED
                        let badgeText = "Đã hoàn thành";
                        if (isDropped) {
                          badgeBg = "bg-gray-100 text-gray-600";
                          badgeText = "Đã hủy";
                        } else if (status === "ACTIVE") {
                          badgeBg = "bg-blue-50 text-blue-600";
                          badgeText = "Đang chạy";
                        }

                        return (
                          <div
                            key={path.id}
                            className="rounded-[18px] border border-[#E9EAF0] bg-white p-5 hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeBg}`}>
                                  {badgeText}
                                </span>
                                <span className="text-xs text-[#8C94A3] flex items-center gap-1">
                                  <Calendar className="size-3.5" />
                                  {path.totalItems} bài học
                                </span>
                              </div>
                              <h3 className="mt-3 text-lg font-semibold text-[#1D2026] line-clamp-1">{path.title}</h3>
                              {path.description && (
                                <p className="mt-1.5 text-xs text-[#6E7485] line-clamp-2 leading-relaxed">{path.description}</p>
                              )}
                            </div>

                            <div className="mt-5 border-t border-[#E9EAF0] pt-4">
                              <div className="flex items-center justify-between text-xs text-[#4E5566] mb-1.5">
                                <span>Tiến độ</span>
                                <span className="font-semibold">{path.currentProgress}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F5F7FA] mb-4">
                                <div
                                  className="h-full rounded-full bg-[#23BD33]"
                                  style={{ width: `${path.currentProgress}%` }}
                                />
                              </div>

                              <Link
                                href={`/learning-paths/${path.id}`}
                                className="inline-flex w-full h-9 items-center justify-center rounded-xl border border-[#EBEBFF] text-xs font-semibold text-[#564FFD] hover:bg-[#EBEBFF] transition"
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="col-span-2 rounded-[18px] border border-dashed border-[#E9EAF0] bg-white p-8 text-center text-sm text-[#6E7485]">
                      Không có lộ trình cũ nào trong lịch sử.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Studio Sidebar / Information */}
            <div className="space-y-6">
              <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-6">
                <h3 className="font-semibold text-lg text-[#1D2026] flex items-center gap-2">
                  <Award className="size-5 text-[#564FFD]" />
                  <span>Roadmap Studio</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6E7485]">
                  Lộ trình học tập giúp bạn tổ chức học tập có định hướng rõ ràng. Bằng cách gom các bài học từ nhiều khóa học khác nhau lại, bạn có thể:
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-[#4E5566]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-[#564FFD]" />
                    <span>Lên kế hoạch học tập theo chủ đề riêng biệt (Ví dụ: React Basic, Next.js Advanced, Docker Deploy).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-[#564FFD]" />
                    <span>Không bị phân tâm bởi các chương học chưa cần thiết.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-[#564FFD]" />
                    <span>Theo dõi tiến trình trực quan ngay trên Dashboard.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDropConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-[fadeIn_150ms_ease-out]">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-xl animate-[scaleIn_200ms_ease-out]">
            <h3 className="text-lg font-bold text-[#1D2026]">Xác nhận hủy lộ trình</h3>
            <p className="mt-3 text-sm text-[#6E7485] leading-relaxed">
              Bạn có chắc chắn muốn hủy lộ trình &ldquo;{activePath?.title}&rdquo; không? Trạng thái của lộ trình sẽ được đổi thành đã hủy, tuy nhiên bạn vẫn có thể xem lại trong lịch sử.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDropConfirm(false)}
                className="h-11 rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDropActivePath}
                disabled={dropping}
                className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 transition"
              >
                {dropping && <Loader2 className="size-4 animate-spin" />}
                <span>Đồng ý hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {footer}
    </main>
  );
}
