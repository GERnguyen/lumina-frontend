import Image from "next/image";
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
    </div>
  );
}
