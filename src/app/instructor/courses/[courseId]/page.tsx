import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InstructorCourseDetailPage } from "@/components/instructor/InstructorCourseDetailPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { getInstructorCourseDetailData } from "@/services/instructor-course-detail-service";

export const metadata: Metadata = {
  title: "Course Detail - Lumina Instructor",
  description: "Review course performance, revenue, rating, learner activity, and curriculum metrics.",
};

type InstructorCourseDetailRouteProps = {
  params: Promise<{ courseId: string }>;
};

export default async function InstructorCourseDetailRoute({ params }: InstructorCourseDetailRouteProps) {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const { courseId } = await params;
  const data = await getInstructorCourseDetailData(courseId);
  if (!data) notFound();

  if (data.user.role && data.user.role !== "INSTRUCTOR") {
    redirect("/courses");
  }

  return <InstructorCourseDetailPage data={data} />;
}
