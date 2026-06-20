"use server";

import { CartApi } from "@/services/api/cart-api";
import { OrderApi, VoucherApi } from "@/services/api/enrollment-api";
import { PaymentApi } from "@/services/api/payment-api";
import { revalidatePath } from "next/cache";
import type { CartItemDto, CourseResponse } from "@/types";
import { getErrorMessage } from "@/lib/errors";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createOrderAction(params: {
  courseId?: string;
  paymentMethod: string;
  voucherCode?: string;
  cartItemIds?: string[];
}) {
  const { courseId, paymentMethod = "STRIPE", voucherCode, cartItemIds = [] } = params;

  try {
    // 1. If courseId is provided, add it to cart first
    if (courseId) {
      await CartApi.addToCart({ courseId });
    }

    // 2. Fetch current cart
    const cartRes = await CartApi.getCart();
    const cartItems = cartRes.data || [];

    // 3. Filter cart items
    const requestedCartItemSet = new Set(cartItemIds);
    const filteredCartItems = courseId
      ? cartItems.filter((item) => item.course?.id === courseId)
      : requestedCartItemSet.size
      ? cartItems.filter((item) => item.id && requestedCartItemSet.has(item.id))
      : cartItems;

    if (!filteredCartItems.length) {
      return { success: false, error: "Your cart is empty" };
    }

    const cartItemsDto: CartItemDto[] = filteredCartItems
      .filter((item): item is { id: string; course: CourseResponse } => Boolean(item.id && item.course))
      .map((item) => ({ id: item.id, course: item.course }));

    const method = paymentMethod as "MOMO" | "STRIPE";

    // 4. Create order
    const orderRes = await OrderApi.createOrder({
      cartItems: cartItemsDto,
      paymentMethod: method,
      ...(voucherCode ? { voucherCode } : {}),
    });

    const orderId = orderRes.data?.id;
    const paymentId = orderRes.data?.payment?.id;
    if (!orderRes.success || !orderId) {
      return { success: false, error: orderRes.message || "Could not create order" };
    }
    if (!paymentId) {
      return { success: false, error: "Order created, but the backend did not return a payment id." };
    }

    // 5. Sleep to allow backend to persist order details
    await sleep(800);

    // 6. Request provider checkout link for the created payment record
    const paymentRes = await PaymentApi.createCheckoutLink(paymentId, method);

    const paymentUrl = paymentRes.data;
    if (!paymentRes.success || !paymentUrl) {
      return { success: false, error: paymentRes.message || "Could not start payment process" };
    }

    // 7. Clear cart on order success if needed or trigger page refresh
    revalidatePath("/cart");
    revalidatePath("/");

    return {
      success: true,
      orderId,
      paymentUrl,
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "Checkout failed") };
  }
}

export async function verifyVoucherAction(code: string) {
  try {
    const res = await VoucherApi.getVoucherByCode(code);
    if (!res.success || !res.data) {
      return { success: false, error: res.message || "Invalid coupon code." };
    }
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to verify coupon code" };
  }
}
