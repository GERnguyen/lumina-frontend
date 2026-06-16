import Image from "next/image";
import type { CourseResponse } from "@/types";
import { getCourseImage } from "@/lib/format";

export function CourseHeroMedia({ course }: { course: CourseResponse }) {
  const image = getCourseImage(course);
  return (
    <div className="relative aspect-[872/500] overflow-hidden bg-[#F5F5FF]">
      <Image
        src={image}
        alt={course.title || "Untitled Course"}
        fill
        priority
        sizes="(min-width: 1280px) 872px, 100vw"
        className="object-cover"
      />
    </div>
  );
}
