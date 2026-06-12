import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";

type CartPayload = {
  data?: Array<{
    id?: string;
    course?: {
      id?: string;
    };
  }>;
};

async function proxyJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: await authHeaders({
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    }),
  });
  const text = await response.text();
  let payload: T | undefined;
  try {
    payload = text ? (JSON.parse(text) as T) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    return { response, payload, text };
  }

  return { response, payload, text };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(text: string, fallback: string) {
  try {
    const payload = JSON.parse(text) as { message?: string; error?: string; detail?: string; title?: string };
    return payload.message || payload.error || payload.detail || payload.title || fallback;
  } catch {
    return text || fallback;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const courseId = body.courseId as string | undefined;
  const paymentMethod = body.paymentMethod || "VN_PAY";
  const voucherCode = body.voucherCode as string | undefined;
  const requestedCartItemIds = Array.isArray(body.cartItemIds)
    ? (body.cartItemIds as unknown[]).filter((item): item is string => typeof item === "string")
    : [];

  if (courseId) {
    await proxyJson("/api/v1/cart", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  const cartResult = await proxyJson<CartPayload>("/api/v1/cart");
  const requestedCartItemSet = new Set(requestedCartItemIds);
  const cartItems = courseId
    ? (cartResult.payload?.data || []).filter((item) => item.course?.id === courseId)
    : requestedCartItemSet.size
      ? (cartResult.payload?.data || []).filter((item) => item.id && requestedCartItemSet.has(item.id))
    : cartResult.payload?.data || [];

  if (!cartItems.length) {
    return NextResponse.json({ success: false, message: "Your cart is empty" }, { status: 400 });
  }

  const orderResult = await proxyJson<{ data?: { id?: string } }>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      cartItems,
      paymentMethod,
      ...(voucherCode ? { voucherCode } : {}),
    }),
  });

  if (!orderResult.response.ok || !orderResult.payload?.data?.id) {
    return NextResponse.json(
      { success: false, message: errorMessage(orderResult.text, "Could not create order.") },
      { status: orderResult.response.status },
    );
  }

  await sleep(800);

  const paymentResult = await proxyJson<{ data?: string }>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify({
      orderId: orderResult.payload.data.id,
      paymentMethod,
    }),
  });

  if (!paymentResult.response.ok) {
    return NextResponse.json(
      {
        success: false,
        message: errorMessage(paymentResult.text, "Could not start payment."),
        provider: paymentMethod,
        status: paymentResult.response.status,
      },
      { status: paymentResult.response.status },
    );
  }

  return NextResponse.json({
    success: true,
    orderId: orderResult.payload.data.id,
    paymentUrl: paymentResult.payload?.data,
    data: paymentResult.payload?.data,
  });
}
