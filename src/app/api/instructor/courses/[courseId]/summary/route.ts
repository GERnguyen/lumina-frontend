import { getInstructorCourseSummaryData } from "@/services/actions/instructor";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { courseId } = await params;
  const data = await getInstructorCourseSummaryData(courseId);
  if (!data) {
    return Response.json({ message: "Course not found." }, { status: 404 });
  }

  return Response.json(data);
}
