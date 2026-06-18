"use server";

import { UserApi } from "@/services/api/user-api";
import { AuthApi } from "@/services/api/auth-api";
import type { UpdateProfileRequest, UpdatePreferredCategoriesRequest, DeviceTokenRequest, ChangePasswordRequest } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(id: string, body: UpdateProfileRequest) {
  try {
    const res = await UserApi.updateUser(id, body);
    revalidatePath("/user-profile");
    revalidatePath("/user-profile/settings");
    revalidatePath("/instructor");
    revalidatePath("/instructor/settings");
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update profile settings" };
  }
}

export async function updatePreferredCategoriesAction(body: UpdatePreferredCategoriesRequest) {
  try {
    const res = await UserApi.updatePreferredCategories(body);
    revalidatePath("/user-profile");
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update preferred categories" };
  }
}

export async function saveDeviceTokenAction(body: DeviceTokenRequest) {
  try {
    const res = await UserApi.saveDeviceToken(body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to save device token" };
  }
}

export async function changePasswordAction(body: ChangePasswordRequest) {
  try {
    const res = await AuthApi.changePassword(body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to change password" };
  }
}
