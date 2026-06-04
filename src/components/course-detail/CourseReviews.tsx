import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";
import { CourseRatingStars } from "./CourseRatingStars";

export function CourseReviews({ course }: { course: CourseDetail }) {
  return (
    <section id="review">
      <h2 className="text-2xl font-semibold text-[#1D2026]">Course Rating</h2>
      <div className="mt-5 grid gap-8 border border-[#E9EAF0] p-8 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center justify-center">
          <strong className="text-[56px] font-semibold leading-none text-[#1D2026]">{course.rating}</strong>
          <div className="mt-3">
            <CourseRatingStars rating={5} size="md" />
          </div>
          <span className="mt-2 text-sm font-medium text-[#1D2026]">Course Rating</span>
        </div>
        <div className="space-y-3">
          {course.ratingBreakdown.map((item) => (
            <div key={item.label} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-sm text-[#4E5566]">
              <span className="inline-flex items-center gap-1.5">
                <CourseRatingStars rating={Number(item.label[0])} />
                {item.label}
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
        <button type="button" className="inline-flex h-12 items-center gap-3 border border-[#E9EAF0] px-4 text-sm font-medium text-[#4E5566]">
          5 Star Rating <ChevronDown className="size-4" />
        </button>
      </div>

      <div className="mt-5 divide-y divide-[#E9EAF0]">
        {course.reviews.map((review) => (
          <article key={`${review.name}-${review.time}`} className="flex gap-4 py-5">
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
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="mt-4 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-6 text-sm font-semibold text-[#7872FD]">
        Load More
      </button>
    </section>
  );
}
