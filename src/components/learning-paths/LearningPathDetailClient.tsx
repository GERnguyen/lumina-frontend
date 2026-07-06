"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearningPathApi, LearningProgressApi } from "@/services/api/learning-api";
import { CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { CartApi } from "@/services/api/cart-api";
import type { LearningPathResponse, LearningPathItemResponse } from "@/types";
import { ArrowLeft, Award, Calendar, Loader2, PlayCircle, CheckCircle } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import { useToastStore } from "@/stores/toast-store";

interface LearningPathDetailClientProps {
  id: string;
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

export function LearningPathDetailClient({ id, header, footer }: LearningPathDetailClientProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [path, setPath] = useState<LearningPathWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingCourseId, setCheckingCourseId] = useState<string | null>(null);

  async function handleGoToStudy(courseId: string, lessonId: string, e: React.MouseEvent) {
    e.preventDefault();
    if (checkingCourseId) return;

    try {
      setCheckingCourseId(courseId);
      const res = await EnrollmentApi.checkEnrollmentStatus([courseId]);
      const status = res?.data?.[0];

      if (status?.isEnrolled) {
        router.push(`/learning/${courseId}?lessonId=${lessonId}`);
      } else {
        addToast("Khóa học chưa được đăng ký. Đang chuyển đến giỏ hàng...", "info", "Thông báo");
        try {
          await CartApi.addToCart({ courseId });
        } catch (cartErr) {
          console.error("Failed to add course to cart", cartErr);
        }
        router.push("/cart");
      }
    } catch (err) {
      console.error("Failed to check enrollment status", err);
      addToast("Có lỗi xảy ra khi kiểm tra trạng thái khóa học.", "error", "Lỗi");
    } finally {
      setCheckingCourseId(null);
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const res = await LearningPathApi.getLearningPath(id);
      if (res?.data) {
        const resolved = await resolvePathDetails(res.data);
        setPath(resolved);
      } else {
        setError("Không tìm thấy thông tin lộ trình.");
      }
    } catch (err: any) {
      console.error("Failed to load learning path details:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu lộ trình học tập.");
    } finally {
      setLoading(false);
    }
  }

  async function resolvePathDetails(pathData: LearningPathResponse): Promise<LearningPathWithDetails> {
    if (!pathData.items || pathData.items.length === 0) {
      return { ...pathData, itemsWithDetails: [] };
    }

    const uniqueCourseIds = Array.from(new Set(pathData.items.map((i) => i.courseId).filter(Boolean)));

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

      const itemsWithDetails = pathData.items.map((item) => {
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
        ...pathData,
        completedItems,
        totalItems,
        currentProgress,
        itemsWithDetails,
      };
    } catch (err) {
      console.error("Error resolving path details:", err);
      return {
        ...pathData,
        itemsWithDetails: pathData.items.map((item) => ({
          ...item,
          courseTitle: `Khóa học ID: ${item.courseId?.substring(0, 8)}...`,
          lessonTitle: `Bài học ID: ${item.lessonId?.substring(0, 8)}...`,
        })),
      };
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FB]">
        {header}
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="size-10 animate-spin text-[#564FFD]" />
        </div>
        {footer}
      </main>
    );
  }

  if (error || !path) {
    return (
      <main className="min-h-screen bg-[#F8F9FB]">
        {header}
        <div className="mx-auto max-w-[800px] px-6 py-10 text-center">
          <div className="rounded-[18px] border border-red-100 bg-red-50 p-6">
            <p className="text-base font-semibold text-red-800">{error || "Có lỗi xảy ra"}</p>
            <Link
              href="/learning-paths"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[18px] bg-red-100 px-4 text-sm font-semibold text-red-800 hover:bg-red-200 transition"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
        {footer}
      </main>
    );
  }

  const status = path.status || "ACTIVE";
  const isCompleted = status === "COMPLETED";
  const isDropped = status === "DROPPED";
  const isActive = status === "ACTIVE";

  let badgeBg = "bg-blue-50 text-blue-600";
  let badgeText = "Đang chạy";
  if (isCompleted) {
    badgeBg = "bg-[#E6FBD9] text-[#1E7E34]";
    badgeText = "Đã hoàn thành";
  } else if (isDropped) {
    badgeBg = "bg-gray-100 text-gray-600";
    badgeText = "Đã hủy";
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      {header}

      <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-8">
        <Link
          href="/learning-paths"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#564FFD] hover:text-[#433EE8] transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại lộ trình của tôi</span>
        </Link>

        {/* Path Info Card */}
        <div className="mt-6 rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeBg}`}>
                {badgeText}
              </span>
              <h1 className="mt-3 text-3xl font-semibold text-[#1D2026]">{path.title}</h1>
              {path.description && (
                <p className="mt-2 text-sm leading-relaxed text-[#6E7485]">{path.description}</p>
              )}
            </div>
            
            <span className="text-xs text-[#8C94A3] flex items-center gap-1 mt-1 shrink-0">
              <Calendar className="size-4" />
              {path.totalItems} bài học
            </span>
          </div>

          {/* Progress */}
          <div className="mt-6 border-t border-[#E9EAF0] pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#4E5566]">Tiến độ học tập</span>
              <span className="font-semibold text-[#23BD33]">
                {path.completedItems} / {path.totalItems} bài học ({path.currentProgress}%)
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#F5F7FA]">
              <div
                className="h-full rounded-full bg-[#23BD33] transition-all duration-500"
                style={{ width: `${path.currentProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="mt-8 rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1D2026] mb-6">Chi tiết các bước trong lộ trình</h2>
          
          <div className="relative pl-6 border-l-2 border-dashed border-[#EBEBFF] space-y-6">
            {path.itemsWithDetails?.map((item, index) => {
              const itemCompleted = item.isCompleted;
              return (
                <div key={item.id || index} className="relative">
                  {/* Step dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 flex size-4 items-center justify-center rounded-full border-2 ${
                      itemCompleted
                        ? "border-[#23BD33] bg-[#23BD33] text-white"
                        : "border-[#7872FD] bg-white"
                    }`}
                  >
                    {itemCompleted && <span className="block size-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-[11px] font-bold text-[#8C94A3] uppercase">
                        Bước {index + 1}: {item.courseTitle}
                      </span>
                      <h4 className="text-base font-semibold text-[#1D2026] mt-0.5">{item.lessonTitle}</h4>
                    </div>

                    <button
                      onClick={(e) => handleGoToStudy(item.courseId || "", item.lessonId || "", e)}
                      disabled={checkingCourseId !== null}
                      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold tracking-normal transition ${
                        itemCompleted
                          ? "bg-[#E6FBD9] text-[#1E7E34] hover:bg-[#d4f7c5]"
                          : "bg-[#564FFD] text-white hover:bg-[#433EE8]"
                      } ${checkingCourseId !== null ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {checkingCourseId === item.courseId ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Đang kiểm tra...</span>
                        </>
                      ) : itemCompleted ? (
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
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {footer}
    </main>
  );
}
