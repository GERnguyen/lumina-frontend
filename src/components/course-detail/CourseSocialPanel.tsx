"use client";

import { Loader2, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ReviewService, SocialStatisticsService } from "@/services/socialService";
import { UserService } from "@/services/userService";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { ReviewResponse, ReviewStatisticsResponse } from "@/types";
import { CourseReviews } from "./CourseReviews";

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

  async function loadReviews() {
    const [reviewsRes, statsRes] = await Promise.all([
      ReviewService.getReviewsByCourseId({ courseId, page: 1, size: 6, sort: '{"createdAt":"DESC"}' }).catch(() => undefined),
      SocialStatisticsService.getReviewStatistics({ courseId }).catch(() => undefined),
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

    const entries = await Promise.all(
      missingIds.map(async (userId) => {
        const response = await UserService.getUserById({ id: userId }).catch(() => undefined);
        return [
          userId,
          {
            name: response?.data?.name || "Lumina learner",
            avatarUrl: response?.data?.avatarUrl,
          },
        ] as const;
      }),
    );
    setReviewUserProfiles((current) => ({ ...current, ...Object.fromEntries(entries) }));
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
      await ReviewService.createReview({ body: { courseId, rating, content } });
      setReviewContent("");
      setMessage("Review posted.");
      await loadReviews();
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not post review."));
    } finally {
      setPendingAction(undefined);
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

      <CourseReviews reviews={reviews} reviewStats={reviewStats} userProfiles={reviewUserProfiles} />
    </section>
  );
}
