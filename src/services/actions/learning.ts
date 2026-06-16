"use server";

import { DailyGoalApi, LearningProgressApi } from "@/services/api/learning-api";
import type { SetDailyGoalRequest } from "@/types";
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
