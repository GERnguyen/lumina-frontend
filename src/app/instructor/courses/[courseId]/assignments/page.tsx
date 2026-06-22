import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InstructorAssignmentGradingPage } from "@/components/instructor/InstructorAssignmentGradingPage";
import { getServerAccessToken } from "@/lib/server-auth";
import { getInstructorCourseDetailData } from "@/services/instructor-course-detail-service";

export const metadata: Metadata = {
  title: "Assignment Grading - Lumina Instructor",
  description: "Review and grade learner assignment submissions.",
};

type InstructorAssignmentRouteProps = {
  params: Promise<{ courseId: string }>;
};

export default async function InstructorAssignmentRoute({ params }: InstructorAssignmentRouteProps) {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const { courseId } = await params;
  const data = await getInstructorCourseDetailData(courseId);
  if (!data) notFound();

  if (data.user.role && data.user.role !== "INSTRUCTOR") {
    redirect("/courses");
  }

  return <InstructorAssignmentGradingPage data={data} />;
}
