import Image from "next/image";
import type { CourseDetail } from "@/data/course-detail";
import { CourseRatingStars } from "./CourseRatingStars";

export function CourseReviews({ course }: { course: CourseDetail }) {
  const hasReviews = Boolean(course.ratingValue && course.ratingValue > 0);

  return (
    <section id="review">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course Rating</h2>
      <div className="mt-5 grid gap-8 border border-[#E9EAF0] p-8 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center justify-center">
          {hasReviews ? (
            <strong className="text-center text-[40px] font-semibold leading-none text-[#1D2026] md:text-[56px]">{course.rating}</strong>
          ) : (
            <strong className="max-w-[140px] text-center text-lg font-semibold leading-6 text-[#1D2026]">No reviews yet</strong>
          )}
          <div className="mt-3">
            <CourseRatingStars rating={course.ratingValue || 0} size="md" />
          </div>
          <span className="mt-2 text-sm font-medium text-[#1D2026]">{course.ratingCount} {course.ratingCount === "1" ? "review" : "reviews"}</span>
        </div>
        <div className="space-y-3">
          {course.ratingBreakdown.map((item) => (
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
        {course.reviews.length ? course.reviews.map((review) => (
          <article key={review.id || `${review.name}-${review.time}`} className="flex gap-4 py-5">
            <Image src={review.avatar} alt={review.name} width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold text-[#1D2026]">{review.name}</h3>
                <span className="text-xs text-[#8C94A3]">{review.time}</span>
              </div>
              <div className="mt-1">
                <CourseRatingStars rating={review.rating} />
              </div>
              <p className="mt-2 text-sm leading-6 text-[#4E5566]">{review.text}</p>
              {review.reply ? (
                <div className="mt-3 border-l-2 border-[#7872FD] bg-[#F8F8FF] px-4 py-3 text-sm leading-6 text-[#4E5566]">
                  <strong className="text-[#1D2026]">Instructor reply:</strong> {review.reply}
                </div>
              ) : null}
            </div>
          </article>
        )) : (
          <div className="py-8 text-sm text-[#6E7485]">No student feedback yet. Reviews will appear here after learners rate this course.</div>
        )}
      </div>

      {course.reviews.length >= 6 ? <button type="button" className="mt-4 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-6 text-sm font-semibold text-[#7872FD]">
        Load More
      </button> : null}
    </section>
  );
}
