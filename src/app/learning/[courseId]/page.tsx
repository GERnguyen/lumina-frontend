import type { Metadata } from "next";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { LearningPage } from "@/components/learning/LearningPage";
import { getLearningPageData } from "@/services/learning-page-service";

type LearningRouteProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
};

export async function generateMetadata({ params, searchParams }: LearningRouteProps): Promise<Metadata> {
  const { courseId } = await params;
  const { lessonId } = await searchParams;

  try {
    const data = await getLearningPageData(courseId, lessonId);
    return {
      title: `${data.currentLesson.title} - ${data.courseTitle}`,
      description: `Continue learning ${data.courseTitle} on Lumina.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Learning - Lumina",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({ params, searchParams }: LearningRouteProps) {
  const { courseId } = await params;
  const { lessonId } = await searchParams;
  const data = await getLearningPageData(courseId, lessonId);

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <CoursesTopNav />
      <LearningPage data={data} />
      <CoursesFooter />
    </main>
  );
}
