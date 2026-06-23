import {
  answerInstructorQuestion,
  getInstructorEngagementData,
  saveInstructorReviewReply,
  updateInstructorCertificateRequest,
} from "@/services/actions/instructor";
import type { ReviewResponse } from "@/types";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { courseId } = await params;
  return Response.json(await getInstructorEngagementData(courseId));
}

export async function POST(request: Request, { params }: RouteProps) {
  await params;
  const body = await request.json();

  if (body.action === "save-review-reply") {
    await saveInstructorReviewReply(body.review as ReviewResponse, String(body.content || ""));
    return Response.json({ success: true });
  }

  if (body.action === "answer-question") {
    await answerInstructorQuestion(String(body.questionId || ""), String(body.content || ""));
    return Response.json({ success: true });
  }

  if (body.action === "update-certificate") {
    await updateInstructorCertificateRequest(String(body.requestId || ""), body.certificateAction === "reject" ? "reject" : "approve");
    return Response.json({ success: true });
  }

  return Response.json({ message: "Unsupported engagement action." }, { status: 400 });
}
