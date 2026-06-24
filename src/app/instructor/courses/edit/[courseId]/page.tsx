import CourseCreateClient from "@/components/instructor/course-create/CourseCreateClient";
import { CategoryApi } from "@/services/api/course-api";

export const metadata = {
  title: "Edit Course - Lumina Instructor",
  description: "Edit course draft on Lumina",
};

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const categoriesRes = await CategoryApi.getAllCategories().catch((err) => {
    console.error("Failed to load categories for course editing:", err);
    return { data: [] };
  });

  return <CourseCreateClient categories={categoriesRes.data || []} courseId={courseId} />;
}
