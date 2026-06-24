import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { LearningPage } from "@/components/learning/LearningPage";
import { getLearningPageData } from "@/services/learning-page-service";
import { getServerAccessToken } from "@/lib/server-auth";

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
      description: `Continue learning ${data.courseTitle} on Cinx.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Learning - Cinx",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({ params, searchParams }: LearningRouteProps) {
  const { courseId } = await params;
  const { lessonId } = await searchParams;

  try {
    const token = await getServerAccessToken();
    if (!token) {
      redirect(`/login?returnUrl=${encodeURIComponent(`/learning/${courseId}${lessonId ? `?lessonId=${lessonId}` : ""}`)}`);
    }

    const data = await getLearningPageData(courseId, lessonId);

    return (
      <main className="min-h-screen bg-[#F5F7FA]">
        <CoursesTopNav />
        <LearningPage data={data} />
        <CoursesFooter />
      </main>
    );
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    const status = error?.response?.status || error?.status;
    if (status === 401) {
      redirect(`/login?returnUrl=${encodeURIComponent(`/learning/${courseId}${lessonId ? `?lessonId=${lessonId}` : ""}`)}&error=session_expired`);
    }
    if (status === 403 || status === 400) {
      redirect(`/courses/${courseId}?error=not_enrolled`);
    }
    throw error;
  }
}
