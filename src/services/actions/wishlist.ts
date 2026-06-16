"use server";

import { WishlistApi } from "@/services/api/social-api";
import { revalidatePath } from "next/cache";

export async function addToWishlistAction(courseId: string) {
  try {
    const res = await WishlistApi.addToWishlist({ courseId });
    revalidatePath("/user-profile/wishlist");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to add item to wishlist" };
  }
}

export async function removeFromWishlistAction(courseId: string) {
  try {
    const res = await WishlistApi.removeFromWishlist(courseId);
    revalidatePath("/user-profile/wishlist");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to remove item from wishlist" };
  }
}
