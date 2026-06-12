import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { getCheckoutPageData } from "@/services/checkout-service";

type CheckoutRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Lumina course order using supported secure payment methods.",
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
  const checkout = await getCheckoutPageData(voucherCode, cartItemIds);

  return <CheckoutPage checkout={checkout} />;
}
