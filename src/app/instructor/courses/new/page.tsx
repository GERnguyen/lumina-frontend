import type { Metadata } from "next";
import { CourseCreateOptionsPage } from "@/components/instructor/CourseCreateOptionsPage";

export const metadata: Metadata = {
  title: "Create Course Concepts - Lumina Instructor",
  description: "Compare Lumina course creation UX concepts before implementing the production builder.",
  alternates: {
    canonical: "/instructor/courses/new",
  },
};

export default function InstructorCreateCourseRoute() {
  return <CourseCreateOptionsPage />;
}
