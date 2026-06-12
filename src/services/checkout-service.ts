import type { VoucherResponse } from "@/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders } from "@/lib/server-auth";
import { getCartPageData, money, type CartCourseItem } from "./cart-service";

type VoucherPayload = {
  data?: VoucherResponse;
  message?: string;
};

export type CheckoutVoucher = {
  code: string;
  discount: number;
  message?: string;
};

export type CheckoutPageData = {
  authenticated: boolean;
  items: CartCourseItem[];
  subtotal: number;
  subtotalLabel: string;
  discount: number;
  discountLabel: string;
  total: number;
  totalLabel: string;
  voucher?: CheckoutVoucher;
};

async function getVoucher(code: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/code?code=${encodeURIComponent(code)}`, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    return (await response.json()) as VoucherPayload;
  } catch {
    return undefined;
  }
}

export async function getCheckoutPageData(voucherCode?: string, cartItemIds?: string[]): Promise<CheckoutPageData> {
  const cart = await getCartPageData();
  const selectedItemIdSet = new Set((cartItemIds || []).filter(Boolean));
  const items = selectedItemIdSet.size
    ? cart.items.filter((item) => selectedItemIdSet.has(item.id))
    : cart.items;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  let discount = 0;
  let voucher: CheckoutVoucher | undefined;
  const code = voucherCode?.trim();

  if (cart.authenticated && items.length && code) {
    const payload = await getVoucher(code);
    const data = payload?.data;

    if (data?.code) {
      if (data.minPurchaseAmount && subtotal < data.minPurchaseAmount) {
        voucher = {
          code: data.code,
          discount: 0,
          message: `This coupon requires at least ${money(data.minPurchaseAmount)}.`,
        };
      } else {
        discount = Math.min(data.discountAmount || 0, data.maxDiscountAmount || data.discountAmount || 0, subtotal);
        voucher = {
          code: data.code,
          discount,
          message: discount ? "Coupon applied." : "Coupon is available but does not reduce this order.",
        };
      }
    } else {
      voucher = {
        code,
        discount: 0,
        message: payload?.message || "Coupon could not be applied.",
      };
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    authenticated: cart.authenticated,
    items,
    subtotal,
    subtotalLabel: money(subtotal),
    discount,
    discountLabel: discount ? `-${money(discount)}` : "-",
    total,
    totalLabel: money(total),
    voucher,
  };
}
