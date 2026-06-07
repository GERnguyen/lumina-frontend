import Image from "next/image";
import { Play } from "lucide-react";
import type { CourseDetail } from "@/data/course-detail";

export function CourseHeroMedia({ course }: { course: CourseDetail }) {
  return (
    <div className="relative aspect-[872/500] overflow-hidden bg-[#F5F5FF]">
      <Image
        src={course.heroImage}
        alt={course.title}
        fill
        priority
        sizes="(min-width: 1280px) 872px, 100vw"
        className="object-cover"
      />
      <button
        type="button"
        className="absolute left-1/2 top-1/2 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#7872FD] shadow-[0_16px_40px_rgba(29,32,38,0.18)] transition hover:scale-105"
        aria-label="Play course preview"
      >
        <Play className="ml-1 size-8 fill-current" />
      </button>
    </div>
  );
}
