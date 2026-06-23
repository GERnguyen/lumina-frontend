import { getInstructorAssignmentsData, scoreInstructorAssignmentSubmission } from "@/services/actions/instructor";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { courseId } = await params;
  return Response.json(await getInstructorAssignmentsData(courseId));
}

export async function POST(request: Request, { params }: RouteProps) {
  await params;
  const body = await request.json();
  const submissionId = String(body.submissionId || "");
  const score = Number(body.score);

  if (!submissionId || !Number.isFinite(score)) {
    return Response.json({ message: "Invalid assignment score request." }, { status: 400 });
  }

  await scoreInstructorAssignmentSubmission(submissionId, score);
  return Response.json({ success: true });
}
