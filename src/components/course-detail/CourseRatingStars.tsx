import { Star } from "lucide-react";

export function CourseRatingStars({ rating = 5, size = "sm" }: { rating?: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "size-5" : "size-4";
  const roundedRating = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-0.5 text-[#7872FD]" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${iconClass} ${index < roundedRating ? "fill-current" : "fill-transparent text-[#B7B3FF]"}`}
        />
      ))}
    </span>
  );
}
