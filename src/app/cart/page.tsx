import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { getCartPageData } from "@/services/cart-service";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review courses in your Lumina cart and proceed to checkout.",
  alternates: {
    canonical: "/cart",
  },
};

export default async function Page() {
  const cart = await getCartPageData();
  return <CartPage cart={cart} />;
}
