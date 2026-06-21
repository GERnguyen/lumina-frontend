"use server";

import { AssignmentApi, DailyGoalApi, LearningProgressApi, QuizSessionApi } from "@/services/api/learning-api";
import type { CreateAssignmentSubmissionRequest, ChooseQuizAnswerRequest, SetDailyGoalRequest, SubmitQuizSessionRequest } from "@/types";
import { revalidatePath } from "next/cache";

export async function setDailyGoalAction(body: SetDailyGoalRequest) {
  try {
    const res = await DailyGoalApi.setDailyGoal(body);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to set daily goal" };
  }
}

export async function editDailyGoalAction(body: SetDailyGoalRequest) {
  try {
    const res = await DailyGoalApi.editDailyGoal(body);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update daily goal" };
  }
}

export async function deleteDailyGoalAction(params: { date?: string; goalType: string; targetItemId?: string }) {
  try {
    const res = await DailyGoalApi.deleteDailyGoal(params);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete daily goal" };
  }
}

export async function getDailyGoalsInMonthAction(year: number, month: number) {
  try {
    const res = await DailyGoalApi.getDailyGoalsInMonth({ year, month });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch daily goals" };
  }
}

export async function markItemAsCompleteAction(itemId: string) {
  try {
    const res = await LearningProgressApi.markItemAsComplete(itemId);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to mark item as complete" };
  }
}

export async function getCourseProgressByCourseIdsAction(courseIds: string) {
  try {
    const res = await LearningProgressApi.getCourseProgressByCourseIds(courseIds);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch course progress" };
  }
}

export async function createQuizSessionAction(courseId: string, lessonId: string) {
  try {
    const res = await QuizSessionApi.createQuizSession(courseId, lessonId);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to start quiz" };
  }
}

export async function getQuizSessionsAction(lessonId: string) {
  try {
    const res = await QuizSessionApi.getQuizSessions(lessonId, { page: 1, size: 20, sort: "startTime,desc" });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load quiz sessions" };
  }
}

export async function getQuizSessionQuestionsAction(quizSessionId: string) {
  try {
    const res = await QuizSessionApi.getQuizSessionQuestions(quizSessionId, { page: 1, size: 100 });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load quiz questions" };
  }
}

export async function chooseQuizAnswerAction(quizSessionId: string, body: ChooseQuizAnswerRequest) {
  try {
    const res = await QuizSessionApi.chooseQuizSessionQuestion(quizSessionId, body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to save answer" };
  }
}

export async function submitQuizSessionAction(quizSessionId: string, body: SubmitQuizSessionRequest) {
  try {
    const res = await QuizSessionApi.submitQuizSession(quizSessionId, body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to submit quiz" };
  }
}

export async function submitAssignmentAction(assignmentId: string, body: CreateAssignmentSubmissionRequest) {
  try {
    const res = await AssignmentApi.submitAssignment(assignmentId, body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to submit assignment" };
  }
}
