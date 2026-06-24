import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { CartApi } from "@/services/api/cart-api";
import { VoucherApi } from "@/services/api/enrollment-api";
import { getServerAccessToken } from "@/lib/server-auth";
import type { CartItemResponse } from "@/types";

type CheckoutRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Cinx course order using supported secure payment methods.",
  alternates: {
    canonical: "/checkout",
  },
};

export default async function Page({ searchParams }: CheckoutRouteProps) {
  const params = await searchParams;
  const voucherParam = params.voucher;
  const itemsParam = params.items;
  const voucherCode = Array.isArray(voucherParam) ? voucherParam[0] : voucherParam;
  const rawItems = Array.isArray(itemsParam) ? itemsParam[0] : itemsParam;
  const cartItemIds = rawItems?.split(",").map((item) => item.trim()).filter(Boolean);

  const token = await getServerAccessToken();
  const isAuthenticated = Boolean(token);

  let items: CartItemResponse[] = [];
  let voucher = undefined;
  let voucherError = "";

  if (isAuthenticated) {
    const cartRes = await CartApi.getCart().catch(() => ({ data: [] }));
    const rawCartItems = cartRes.data || [];

    const selectedItemSet = new Set(cartItemIds || []);
    items = selectedItemSet.size
      ? rawCartItems.filter((item) => item.id && selectedItemSet.has(item.id))
      : rawCartItems;

    if (voucherCode?.trim()) {
      const vCode = voucherCode.trim();
      const voucherRes = await VoucherApi.getVoucherByCode(vCode).catch(() => ({
        success: false,
        data: undefined,
        message: "Could not apply voucher",
      }));
      if (voucherRes.success && voucherRes.data) {
        voucher = voucherRes.data;
      } else {
        voucherError = voucherRes.message || "Invalid coupon code.";
      }
    }
  }

  return (
    <CheckoutPage
      items={items}
      isAuthenticated={isAuthenticated}
      voucher={voucher}
      voucherError={voucherError}
      voucherCode={voucherCode}
    />
  );
}
