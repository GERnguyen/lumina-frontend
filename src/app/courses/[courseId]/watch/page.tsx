import type { Metadata } from "next";
import { WatchCoursePage } from "@/components/watch-course/WatchCoursePage";
import { getWatchCourse } from "@/services/watch-course-service";

type WatchCourseRouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: WatchCourseRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const { course } = await getWatchCourse(courseId);

  return {
    title: `${course.currentLesson} - Watch Course`,
    description: `Watch ${course.currentLesson} from ${course.courseTitle}.`,
    alternates: {
      canonical: `/courses/${courseId}/watch`,
    },
  };
}

export default async function Page({ params }: WatchCourseRouteProps) {
  const { courseId } = await params;
  const { course, isFallback } = await getWatchCourse(courseId);

  return <WatchCoursePage course={course} isFallback={isFallback} />;
}
