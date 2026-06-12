import type { OrderDetailResponse } from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";
import { money } from "./cart-service";

type OrderPayload = {
  data?: OrderDetailResponse;
};

export type OrderThankYouData = {
  id: string;
  status: string;
  totalLabel: string;
  itemCount: number;
  paymentMethod: string;
};

function paymentMethodLabel(method?: OrderDetailResponse["paymentMethod"]) {
  if (method === "MOMO") return "MoMo";
  if (method === "VN_PAY") return "VNPay";
  return "Payment provider";
}

export async function getOrderThankYouData(orderId: string): Promise<OrderThankYouData | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    const payload = (await response.json()) as OrderPayload;
    const order = payload.data;
    if (!order?.id) return undefined;

    return {
      id: order.id,
      status: order.status || "PENDING",
      totalLabel: money(Math.max(0, (order.totalPrice || 0) - (order.discounted || 0))),
      itemCount: order.items?.length || 0,
      paymentMethod: paymentMethodLabel(order.paymentMethod),
    };
  } catch {
    return undefined;
  }
}
