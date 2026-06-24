"use server";

import { CourseQnAApi } from "@/services/api/social-api";
import type { CreateQuestionRequest, CreateAnswerRequest, UpdateQuestionRequest, UpdateAnswerRequest } from "@/types";
import { revalidatePath } from "next/cache";

export async function getQuestionsAction(courseId: string, lessonId?: string, page: number = 1, size: number = 20) {
  try {
    const res = await CourseQnAApi.getQuestions({
      courseId,
      lessonId: lessonId || undefined,
      page,
      size,
      sort: JSON.stringify({ createdAt: "DESC" }),
    });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch Q&A questions" };
  }
}

export async function createQuestionAction(body: CreateQuestionRequest) {
  console.log("createQuestionAction: sending payload to backend:", JSON.stringify(body));
  try {
    const res = await CourseQnAApi.createQuestion(body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("createQuestionAction failed. Server response body:", error?.body || error);
    return { success: false, error: error?.message || "Failed to post question" };
  }
}

export async function upvoteQuestionAction(questionId: string) {
  try {
    const res = await CourseQnAApi.upvoteQuestion(questionId);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to upvote question" };
  }
}

export async function deleteQuestionAction(questionId: string) {
  try {
    await CourseQnAApi.deleteQuestion(questionId);
    revalidatePath("/learning");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete question" };
  }
}

export async function getAnswersForQuestionAction(questionId: string, page: number = 1, size: number = 50) {
  try {
    const res = await CourseQnAApi.getAnswersForQuestion(questionId, {
      page,
      size,
      sort: JSON.stringify({ createdAt: "ASC" }),
    });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch answers" };
  }
}

export async function createAnswerAction(body: CreateAnswerRequest) {
  console.log("createAnswerAction: sending payload to backend:", JSON.stringify(body));
  try {
    const res = await CourseQnAApi.createAnswer(body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("createAnswerAction failed. Server response body:", error?.body || error);
    return { success: false, error: error?.message || "Failed to post answer" };
  }
}

export async function upvoteAnswerAction(answerId: string) {
  try {
    const res = await CourseQnAApi.upvoteAnswer(answerId);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to upvote answer" };
  }
}

export async function deleteAnswerAction(answerId: string) {
  try {
    await CourseQnAApi.deleteAnswer(answerId);
    revalidatePath("/learning");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete answer" };
  }
}

export async function getRepliesAction(answerId: string, page: number = 1, size: number = 50) {
  try {
    const res = await CourseQnAApi.getReplies(answerId, { page, size, sort: JSON.stringify({ createdAt: "ASC" }) });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch replies" };
  }
}
