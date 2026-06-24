import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { CartApi } from "@/services/api/cart-api";
import { getServerAccessToken } from "@/lib/server-auth";

import type { CartItemResponse } from "@/types";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review courses in your Cinx cart and proceed to checkout.",
  alternates: {
    canonical: "/cart",
  },
};

export default async function Page() {
  const token = await getServerAccessToken();
  const isAuthenticated = Boolean(token);

  let items: CartItemResponse[] = [];
  if (isAuthenticated) {
    const res = await CartApi.getCart().catch(() => ({ data: [] }));
    items = res.data || [];
  }

  return <CartPage items={items} isAuthenticated={isAuthenticated} />;
}
