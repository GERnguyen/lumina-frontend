import { CartApi } from "./cart-api";
import { WishlistApi } from "./social-api";
import { getServerAccessToken } from "@/lib/server-auth";
import { cache } from "react";

export const getNavCounts = cache(async () => {
  const token = await getServerAccessToken();
  if (!token) {
    return { cartCount: 0, wishlistCount: 0 };
  }

  const [cartRes, wishlistRes] = await Promise.all([
    CartApi.getCart().catch(() => ({ data: [] })),
    WishlistApi.getWishlist().catch(() => ({ data: [] })),
  ]);

  return {
    cartCount: cartRes.data?.length || 0,
    wishlistCount: wishlistRes.data?.length || 0,
  };
});
