import Image from "next/image";
import type { ReviewResponse, ReviewStatisticsResponse } from "@/types";
import { CourseRatingStars } from "./CourseRatingStars";
import { getCourseRating, fullNumber } from "@/lib/format";

export function CourseReviews({
  reviews,
  reviewStats,
}: {
  reviews: ReviewResponse[];
  reviewStats?: ReviewStatisticsResponse;
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
      <div className="mt-5 grid gap-8 border border-[#E9EAF0] p-8 md:grid-cols-[180px_1fr]">
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
            <div key={item.label} className="grid grid-cols-[92px_1fr_48px] items-center gap-3 text-sm text-[#4E5566]">
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

      <div className="mt-5 divide-y divide-[#E9EAF0]">
        {reviews.length ? (
          reviews.map((review, index) => {
            const reviewerName = review.userId ? `Learner ${review.userId.slice(0, 8)}` : "Lumina learner";
            const avatar = `/course-detail/person-${(index % 6) + 3}.png`;
            return (
              <article key={review.id || index} className="flex gap-4 py-5">
                <Image src={avatar} alt={reviewerName} width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold text-[#1D2026]">{reviewerName}</h3>
                    <span className="text-xs text-[#8C94A3]">Recently</span>
                  </div>
                  <div className="mt-1">
                    <CourseRatingStars rating={review.rating || 0} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4E5566]">{review.content || "No written feedback."}</p>
                  {review.reply?.content ? (
                    <div className="mt-3 border-l-2 border-[#7872FD] bg-[#F8F8FF] px-4 py-3 text-sm leading-6 text-[#4E5566]">
                      <strong className="text-[#1D2026]">Instructor reply:</strong> {review.reply.content}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-8 text-sm text-[#6E7485]">No student feedback yet. Reviews will appear here after learners rate this course.</div>
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
