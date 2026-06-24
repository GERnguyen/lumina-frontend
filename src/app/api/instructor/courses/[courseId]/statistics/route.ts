import { getInstructorCourseStatisticsData } from "@/services/actions/instructor";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { courseId } = await params;
  return Response.json(await getInstructorCourseStatisticsData(courseId));
}
