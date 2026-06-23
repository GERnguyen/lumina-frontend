import { CourseApi } from "@/services/api/course-api";
import { StatisticsApi } from "@/services/api/enrollment-api";
import { ReviewApi, CourseQnAApi } from "@/services/api/social-api";
import { CertificateApi } from "@/services/api/learning-api";
import type { ReviewResponse } from "@/types";

export async function getInstructorCourseSummaryData(courseId: string) {
  try {
    const res = await CourseApi.getEditableCourseDraft(courseId);
    return res?.data || null;
  } catch (err) {
    console.error(`Failed to fetch course summary for course ${courseId}:`, err);
    return null;
  }
}

export async function getInstructorCourseStatisticsData(courseId: string) {
  try {
    const res = await StatisticsApi.getCourseStatisticsOverview(courseId, { groupBy: "DAY" });
    return res?.data || null;
  } catch (err) {
    console.error(`Failed to fetch statistics overview for course ${courseId}:`, err);
    return null;
  }
}

export async function getInstructorEngagementData(courseId: string) {
  try {
    const [reviewsRes, questionsRes, certsRes] = await Promise.all([
      ReviewApi.getReviewsByCourseId({ courseId, page: 1, size: 50 }).catch(() => ({ data: [] })),
      CourseQnAApi.getQuestions({ courseId, page: 1, size: 50 }).catch(() => ({ data: [] })),
      CertificateApi.getRequestsByCourse(courseId, { page: 1, size: 50 }).catch(() => ({ data: [] })),
    ]);

    return {
      reviews: reviewsRes?.data || [],
      questions: questionsRes?.data || [],
      certificateRequests: certsRes?.data || [],
    };
  } catch (err) {
    console.error(`Failed to fetch engagement data for course ${courseId}:`, err);
    return { reviews: [], questions: [], certificateRequests: [] };
  }
}

export async function saveInstructorReviewReply(review: ReviewResponse, content: string) {
  if (!review.id) throw new Error("Review ID is missing");
  return ReviewApi.createReviewReply(review.id, { content });
}

export async function answerInstructorQuestion(questionId: string, content: string) {
  return CourseQnAApi.createAnswer({
    questionId,
    content,
  });
}

export async function updateInstructorCertificateRequest(requestId: string, action: "approve" | "reject") {
  if (action === "approve") {
    return CertificateApi.approveCertificate(requestId);
  } else {
    return CertificateApi.rejectCertificate(requestId);
  }
}
