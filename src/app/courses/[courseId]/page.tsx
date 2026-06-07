import type { Metadata } from "next";
import { CourseDetailPage } from "@/components/course-detail/CourseDetailPage";
import { getCourseDetail } from "@/services/course-detail-service";

type CourseDetailRouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CourseDetailRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const { course } = await getCourseDetail(courseId);

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
  const { course, isFallback } = await getCourseDetail(courseId);

  return <CourseDetailPage course={course} isFallback={isFallback} />;
}
