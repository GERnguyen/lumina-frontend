import type { LandingCourse } from "@/data/landing";
import { StudentCourseCard } from "@/components/courses/StudentCourseCard";

type CourseCardProps = {
  course: LandingCourse;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <StudentCourseCard
      href={course.href || "/courses"}
      title={course.title}
      image={course.image}
      category={course.category}
      price={course.price}
      rating={course.rating || "5.0"}
      ratingValue={Number(course.rating || 5)}
      students={course.students}
      className="animate-fade-up"
      imageSizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
    />
  );
}
