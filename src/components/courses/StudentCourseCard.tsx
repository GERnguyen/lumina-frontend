import Image from "next/image";
import Link from "next/link";
import { Star, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudentCourseCardProps = {
  href: string;
  title: string;
  image: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating?: string;
  ratingValue?: number;
  students?: string;
  instructor?: string;
  duration?: string;
  className?: string;
  imageSizes?: string;
};

export function StudentCourseCard({
  href,
  title,
  image,
  category,
  price,
  originalPrice,
  rating,
  ratingValue,
  students,
  instructor,
  duration,
  className,
  imageSizes = "(min-width: 1280px) 312px, (min-width: 768px) 33vw, 100vw",
}: StudentCourseCardProps) {
  const hasRating = typeof ratingValue === "number" && ratingValue > 0;
  const ratingText = hasRating ? rating || ratingValue?.toFixed(1) : rating || "No rating";

  return (
    <article
      className={cn(
        "group flex min-h-[390px] flex-col overflow-hidden rounded-[18px] bg-white pb-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(29,32,38,0.12)]",
        className,
      )}
    >
      <Link href={href} className="relative h-[196px] overflow-hidden rounded-t-[18px] bg-[#F5F7FA]">
        <Image
          src={image}
          alt={title}
          fill
          sizes={imageSizes}
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 h-px bg-[#E9EAF0]" />
      </Link>

      <div className="flex flex-1 flex-col gap-4 px-[18px] pt-4">
        <div className="space-y-2">
          <span className="inline-flex max-w-full bg-[#EBEBFF] px-1.5 py-1 text-[10px] font-medium uppercase leading-3 text-[#342F98]">
            <span className="truncate">{category}</span>
          </span>
          <Link href={href} className="line-clamp-2 min-h-11 text-base font-medium leading-[22px] text-[#1D2026] transition hover:text-[#564FFD]">
            {title}
          </Link>
          {instructor ? (
            <p className="line-clamp-1 text-xs text-[#6E7485]">
              By <span className="font-medium text-[#1D2026]">{instructor}</span>
            </p>
          ) : null}
        </div>

        {(ratingText || students) ? (
          <>
            <div className="-mx-[18px] h-px bg-[#E9EAF0]" />
            <div className="flex items-center justify-between gap-3 text-sm tracking-[-0.14px]">
              <div className="flex min-w-0 items-center gap-1.5 text-[#4E5566]">
                <Star className={cn("size-5 shrink-0", hasRating ? "fill-[#FD8E1F] text-[#FD8E1F]" : "fill-[#E9EAF0] text-[#C6CAD1]")} />
                <span className={cn("truncate font-medium", hasRating ? "text-[#4E5566]" : "text-[#8C94A3]")}>{ratingText}</span>
              </div>
              {students ? (
                <div className="flex min-w-0 items-center gap-1.5 text-[#8C94A3]">
                  <UserRound className="size-5 shrink-0 text-[#564FFD]" />
                  <span className="truncate">
                    <strong className="font-medium text-[#4E5566]">{students}</strong> students
                  </span>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="-mx-[18px] mt-auto h-px bg-[#E9EAF0]" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <strong className="truncate text-lg font-semibold leading-6 text-[#564FFD]">{price}</strong>
            {originalPrice ? (
              <span className="truncate text-sm leading-[22px] text-[#A1A5B3] line-through">{originalPrice}</span>
            ) : null}
          </div>
          {duration ? <span className="shrink-0 text-xs text-[#8C94A3]">{duration}</span> : null}
        </div>
      </div>
    </article>
  );
}
