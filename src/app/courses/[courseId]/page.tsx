import type { Metadata } from "next";
import { CourseDetailPage } from "@/components/course-detail/CourseDetailPage";
import { getCourseDetailById } from "@/data/course-detail";

type CourseDetailRouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CourseDetailRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourseDetailById(courseId);

  return {
    title: course.title,
    description: course.subtitle,
    alternates: {
      canonical: `/courses/${courseId}`,
    },
    openGraph: {
      title: course.title,
      description: course.subtitle,
      images: [course.heroImage],
    },
  };
}

export default async function Page({ params }: CourseDetailRouteProps) {
  const { courseId } = await params;
  const course = getCourseDetailById(courseId);

  return <CourseDetailPage course={course} />;
}
