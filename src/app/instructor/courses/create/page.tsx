import CourseCreateClient from "@/components/instructor/course-create/CourseCreateClient";
import { CategoryApi } from "@/services/api/course-api";

export const metadata = {
  title: "Create Course - Lumina Instructor",
  description: "Create a new course draft on Lumina",
};

export default async function CreateCoursePage() {
  const categoriesRes = await CategoryApi.getAllCategories().catch((err) => {
    console.error("Failed to load categories for course creation:", err);
    return { data: [] };
  });

  return <CourseCreateClient categories={categoriesRes.data || []} />;
}
