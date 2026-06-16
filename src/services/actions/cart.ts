"use server";

import { CartApi } from "@/services/api/cart-api";
import { revalidatePath } from "next/cache";

export async function addToCartAction(courseId: string) {
  try {
    const res = await CartApi.addToCart({ courseId });
    revalidatePath("/cart");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to add item to cart" };
  }
}

export async function removeFromCartAction(itemId: string) {
  try {
    const res = await CartApi.removeFromCart(itemId);
    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to remove item from cart" };
  }
}

export async function clearCartAction() {
  try {
    const res = await CartApi.clearCart();
    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to clear cart" };
  }
}
