import type { Metadata } from "next";
import { WatchCoursePage } from "@/components/watch-course/WatchCoursePage";
import { getWatchCourseData } from "@/data/watch-course";

type WatchCourseRouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: WatchCourseRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getWatchCourseData(courseId);

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
  const course = getWatchCourseData(courseId);

  return <WatchCoursePage course={course} />;
}
