import { getInstructorStudentProgressData } from "@/services/actions/instructor";

type RouteProps = {
  params: Promise<{ courseId: string; studentId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { courseId, studentId } = await params;
  return Response.json(await getInstructorStudentProgressData(courseId, studentId));
}
