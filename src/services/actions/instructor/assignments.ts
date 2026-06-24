import { CourseApi } from "@/services/api/course-api";
import { AssignmentApi } from "@/services/api/learning-api";

export async function getInstructorAssignmentsData(courseId: string) {
  try {
    const curriculumRes = await CourseApi.getReadableCurriculum(courseId);
    const sections = curriculumRes.data?.sections || [];
    const assignments: { id: string; title: string }[] = [];

    sections.forEach((sec) => {
      sec.lessons?.forEach((lesson) => {
        if (lesson.lessonType === "ASSIGNMENT" && lesson.id) {
          assignments.push({ id: lesson.id, title: lesson.title || "Untitled Assignment" });
        }
      });
    });

    const submissionsPromises = assignments.map(async (assign) => {
      const res = await AssignmentApi.getAssignmentSubmissions({
        assignmentId: assign.id,
        size: 50,
      }).catch(() => ({ data: [] }));
      return (res.data || []).map((sub) => ({
        ...sub,
        assignmentTitle: assign.title,
      }));
    });

    const submissionsNested = await Promise.all(submissionsPromises);
    return submissionsNested.flat();
  } catch (err) {
    console.error(`Failed to fetch assignments data for course ${courseId}:`, err);
    return [];
  }
}

export async function scoreInstructorAssignmentSubmission(submissionId: string, score: number) {
  return AssignmentApi.scoreAssignmentSubmission(submissionId, score);
}
