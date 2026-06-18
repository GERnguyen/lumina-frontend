import type { CourseResponse } from "@/types";
import {
  getCourseImage,
  getCourseCategory,
  money,
  getCourseRating,
  compactNumber,
  formatDuration,
  getCourseInstructorName,
} from "@/lib/format";
import { StudentCourseCard } from "@/components/courses/StudentCourseCard";

export function CourseListingCard({ course, index = 0 }: { course: CourseResponse; index?: number }) {
  const href = course.id ? `/courses/${course.id}` : "/courses";
  const image = getCourseImage(course, index);
  const category = getCourseCategory(course);
  const instructor = getCourseInstructorName(course);
  const discounted = course.discountedPrice ?? course.price ?? 0;
  const original = course.discountedPrice && course.price && course.discountedPrice < course.price ? money(course.price) : undefined;
  const priceLabel = money(discounted);
  const ratingText = getCourseRating(course.rating);
  const studentsCount = compactNumber(course.enrollmentCount);
  const durationText = formatDuration(course.duration);

  return (
    <StudentCourseCard
      href={href}
      title={course.title || "Untitled Course"}
      image={image}
      category={category}
      price={priceLabel}
      originalPrice={original}
      rating={ratingText}
      ratingValue={course.rating}
      students={studentsCount}
      instructor={instructor}
      duration={durationText}
    />
  );
}
