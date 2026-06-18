import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CourseCreateOptionsPage } from "@/components/instructor/CourseCreateOptionsPage";
import { getServerAccessToken } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Edit Course - Lumina Instructor",
  description: "Edit a Lumina instructor course draft, curriculum, lesson content, pricing, and media.",
};

type InstructorEditCourseRouteProps = {
  params: Promise<{ courseId: string }>;
};

export default async function InstructorEditCourseRoute({ params }: InstructorEditCourseRouteProps) {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const { courseId } = await params;

  return <CourseCreateOptionsPage mode="edit" courseId={courseId} />;
}
