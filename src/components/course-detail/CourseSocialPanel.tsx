"use client";

import { Loader2, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ReviewApi, SocialStatisticsApi } from "@/services/api/social-api";
import { UserApi } from "@/services/api/user-api";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { ReviewResponse, ReviewStatisticsResponse } from "@/types";
import { CourseReviews } from "./CourseReviews";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { useToastStore } from "@/stores/toast-store";

type CourseSocialPanelProps = {
  courseId: string;
  initialReviews: ReviewResponse[];
  initialReviewStats?: ReviewStatisticsResponse;
  isAuthenticated: boolean;
  isEnrolled: boolean;
};

type ReviewUserMeta = {
  name: string;
  avatarUrl?: string;
};

function RatingPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        return (
          <button key={rating} type="button" onClick={() => onChange(rating)} aria-label={`${rating} star`}>
            <Star className={cn("size-6 transition", rating <= value ? "fill-[#FD8E1F] text-[#FD8E1F]" : "fill-[#E9EAF0] text-[#C6CAD1] hover:text-[#FD8E1F]")} />
          </button>
        );
      })}
    </div>
  );
}

export function CourseSocialPanel({
  courseId,
  initialReviews,
  initialReviewStats,
  isAuthenticated,
  isEnrolled,
}: CourseSocialPanelProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewStats, setReviewStats] = useState(initialReviewStats);
  const [reviewUserProfiles, setReviewUserProfiles] = useState<Record<string, ReviewUserMeta>>({});
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [pendingAction, setPendingAction] = useState<string>();
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Report states
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (isAuthenticated) {
      UserApi.getCurrentUser()
        .then((res) => {
          if (res.data?.userId) setCurrentUserId(res.data.userId);
        })
        .catch(() => undefined);
    }
  }, [isAuthenticated]);

  async function loadReviews() {
    const [reviewsRes, statsRes] = await Promise.all([
      ReviewApi.getReviewsByCourseId({ courseId, page: 1, size: 6, sort: '{"createdAt":"DESC"}' }).catch(() => undefined),
      SocialStatisticsApi.getReviewStatistics(courseId).catch(() => undefined),
    ]);
    if (reviewsRes?.data) setReviews(reviewsRes.data);
    if (statsRes?.data) setReviewStats(statsRes.data);
    await hydrateReviewUsers(reviewsRes?.data || reviews);
  }

  async function hydrateReviewUsers(items: ReviewResponse[]) {
    const userIds = Array.from(new Set(items.map((review) => review.userId).filter(Boolean))) as string[];
    if (!userIds.length) return;

    const missingIds = userIds.filter((userId) => !reviewUserProfiles[userId]);
    if (!missingIds.length) return;

    try {
      const response = await UserApi.getUsersByIds(missingIds.join(",")).catch(() => undefined);
      const users = response?.data || [];
      const newEntries = users.reduce((acc, user) => {
        if (user.userId) {
          acc[user.userId] = {
            name: user.name || "Cinx learner",
            avatarUrl: user.avatarUrl,
          };
        }
        return acc;
      }, {} as Record<string, ReviewUserMeta>);

      // Fallback for any IDs that weren't returned by the API
      missingIds.forEach((id) => {
        if (!newEntries[id]) {
          newEntries[id] = {
            name: "Cinx learner",
            avatarUrl: undefined,
          };
        }
      });

      setReviewUserProfiles((current) => ({ ...current, ...newEntries }));
    } catch (err) {
      console.error("Failed to fetch reviewer profiles:", err);
    }
  }

  useEffect(() => {
    hydrateReviewUsers(initialReviews);
  }, [courseId]);

  async function submitReview() {
    const content = reviewContent.trim();
    if (!content) return;
    setPendingAction("review");
    setMessage("");
    try {
      await ReviewApi.createReview({ courseId, rating, content });
      setReviewContent("");
      addToast("Đăng đánh giá thành công.", "success");
      await loadReviews();
    } catch (error) {
      addToast(getErrorMessage(error, "Could not post review."), "error");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function handleReactReview(reviewId: string) {
    if (!isAuthenticated) return;
    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) return;
      const reactions = review.reactions || [];
      const hasLiked = currentUserId ? reactions.some((r) => r.userId === currentUserId && r.liked) : false;

      await ReviewApi.reactReview(reviewId, { liked: !hasLiked });
      await loadReviews();
      addToast(hasLiked ? "Đã bỏ hữu ích." : "Đã đánh dấu hữu ích.", "success");
    } catch (error) {
      console.error("Failed to react to review:", error);
      addToast("Không thể thực hiện tương tác.", "error");
    }
  }

  async function handleReportReview(reviewId: string) {
    if (!isAuthenticated) return;
    setReportTargetId(reviewId);
    setReportReason("");
  }

  async function submitReport() {
    if (!reportTargetId || !reportReason.trim() || submittingReport) return;
    setSubmittingReport(true);
    try {
      await ReviewApi.reportReview(reportTargetId, { reason: reportReason.trim() });
      addToast("Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ xem xét đánh giá này.", "success");
      setReportTargetId(null);
      setReportReason("");
    } catch (error) {
      console.error("Failed to report review:", error);
      addToast("Đã xảy ra lỗi khi gửi báo cáo.", "error");
    } finally {
      setSubmittingReport(false);
    }
  }

  return (
    <section className="space-y-10">
      {isAuthenticated && isEnrolled ? (
        <section className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_10px_28px_rgba(29,32,38,0.04)]">
          <h2 className="text-2xl font-semibold text-[#1D2026]">Write a Review</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingPicker value={rating} onChange={setRating} />
            <span className="text-sm font-medium text-[#6E7485]">{rating} out of 5</span>
          </div>
          <textarea
            value={reviewContent}
            onChange={(event) => setReviewContent(event.target.value)}
            placeholder="Share what helped you learn..."
            className="mt-4 min-h-28 w-full rounded-[18px] border border-[#E9EAF0] px-4 py-3 text-sm text-[#1D2026] outline-none transition focus:border-[#7872FD]"
          />
          <button
            type="button"
            onClick={submitReview}
            disabled={pendingAction === "review" || !reviewContent.trim()}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-[18px] bg-[#7872FD] px-5 text-sm font-semibold text-white transition hover:bg-[#635BFF] active:scale-[0.98] disabled:opacity-60"
          >
            {pendingAction === "review" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Post review
          </button>
        </section>
      ) : null}

      <CourseReviews
        reviews={reviews}
        reviewStats={reviewStats}
        userProfiles={reviewUserProfiles}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        onReact={handleReactReview}
        onReport={handleReportReview}
      />

      {/* Report Modal */}
      <InstructorDialog
        isOpen={Boolean(reportTargetId)}
        onClose={() => setReportTargetId(null)}
        title="Báo cáo đánh giá vi phạm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Vui lòng cho biết lý do bạn báo cáo đánh giá này. Báo cáo của bạn sẽ được xem xét kỹ lưỡng.
          </p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
            className="w-full min-h-24 rounded-xl border border-zinc-200 p-3 text-sm outline-none transition focus:border-[#7872FD]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportTargetId(null)}
              className="h-10 px-4 rounded-xl border border-[#E9EAF0] bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={submitReport}
              disabled={!reportReason.trim() || submittingReport}
              className="h-10 px-4 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-650 transition disabled:opacity-50 cursor-pointer"
            >
              {submittingReport ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </div>
      </InstructorDialog>
    </section>
  );
}
