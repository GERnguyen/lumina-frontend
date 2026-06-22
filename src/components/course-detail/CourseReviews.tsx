import type { ReviewResponse, ReviewStatisticsResponse } from "@/types";
import { CourseRatingStars } from "./CourseRatingStars";
import { getCourseRating, fullNumber, getProfileAvatar } from "@/lib/format";

type ReviewUserMeta = {
  name: string;
  avatarUrl?: string;
};

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "L";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function CourseReviews({
  reviews,
  reviewStats,
  userProfiles,
}: {
  reviews: ReviewResponse[];
  reviewStats?: ReviewStatisticsResponse;
  userProfiles?: Record<string, ReviewUserMeta>;
}) {
  const ratingText = getCourseRating(reviewStats?.averageRating);
  const ratingValue = reviewStats?.averageRating || 0;
  const reviewCount = reviewStats?.reviewCount || 0;
  const hasReviews = reviewCount > 0;

  const distribution = reviewStats?.ratingDistribution || {};
  const totalDistribution = reviewCount || Object.values(distribution).reduce((sum, val) => sum + val, 0);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = distribution[String(rating)] || 0;
    const percent = totalDistribution > 0 ? Math.round((count / totalDistribution) * 100) : 0;
    return {
      label: String(rating),
      value: totalDistribution > 0 ? `${percent}%` : "0%",
      percent,
    };
  });

  return (
    <section id="review">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course Rating</h2>
      <div className="mt-5 grid gap-8 rounded-[18px] border border-[#E9EAF0] bg-white p-8 shadow-[0_10px_28px_rgba(29,32,38,0.04)] md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center justify-center">
          {hasReviews ? (
            <strong className="text-center text-[40px] font-semibold leading-none text-[#1D2026] md:text-[56px]">{ratingText}</strong>
          ) : (
            <strong className="max-w-[140px] text-center text-lg font-semibold leading-6 text-[#1D2026]">No reviews yet</strong>
          )}
          <div className="mt-3">
            <CourseRatingStars rating={ratingValue} size="md" />
          </div>
          <span className="mt-2 text-sm font-medium text-[#1D2026]">{fullNumber(reviewCount)} {reviewCount === 1 ? "review" : "reviews"}</span>
        </div>
        <div className="space-y-3">
          {ratingBreakdown.map((item) => (
            <div key={item.label} className="grid grid-cols-[92px_1fr_48px] items-center gap-3 text-sm font-medium text-[#363B47]">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 text-right font-medium text-[#1D2026]">{item.label}</span>
                <CourseRatingStars rating={Number(item.label)} />
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-[#D8D6FF]">
                <span className="block h-full rounded-full bg-[#7872FD]" style={{ width: `${item.percent}%` }} />
              </span>
              <span className="text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[#1D2026]">Students Feedback</h2>
      </div>

      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white divide-y divide-[#E9EAF0]">
        {reviews.length ? (
          reviews.map((review, index) => {
            const reviewer = review.userId ? userProfiles?.[review.userId] : undefined;
            const reviewerName = reviewer?.name || "Lumina learner";
            const avatar = reviewer?.avatarUrl ? getProfileAvatar({ avatarUrl: reviewer.avatarUrl, name: reviewerName }, reviewerName) : undefined;
            return (
              <article key={review.id || index} className="flex gap-4 p-5">
                {avatar ? (
                  <img src={avatar} alt={reviewerName} className="size-12 shrink-0 rounded-full object-cover ring-1 ring-[#D8D6FF]" />
                ) : (
                  <div
                    aria-label={reviewerName}
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-sm font-bold text-[#564FFD] ring-1 ring-[#D8D6FF]"
                  >
                    {getInitials(reviewerName)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold text-[#1D2026]">{reviewerName}</h3>
                    <span className="text-xs font-medium text-[#6E7485]">Recently</span>
                  </div>
                  <div className="mt-1">
                    <CourseRatingStars rating={review.rating || 0} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#363B47]">{review.content || "No written feedback."}</p>
                  {review.reply?.content ? (
                    <div className="mt-3 rounded-[14px] border-l-2 border-[#7872FD] bg-[#F8F8FF] px-4 py-3 text-sm leading-6 text-[#363B47]">
                      <strong className="text-[#1D2026]">Instructor reply:</strong> {review.reply.content}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="p-8 text-sm font-medium text-[#4E5566]">No student feedback yet. Reviews will appear here after learners rate this course.</div>
        )}
      </div>

      {reviews.length >= 6 ? (
        <button type="button" className="mt-4 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-6 text-sm font-semibold text-[#7872FD]">
          Load More
        </button>
      ) : null}
    </section>
  );
}
