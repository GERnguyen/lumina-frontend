import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders, getServerAccessToken } from "@/lib/server-auth";

type CountPayload<T> = {
  data?: T[];
};

async function fetchCount(path: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return 0;
    const payload = (await response.json()) as CountPayload<unknown>;
    return payload.data?.length || 0;
  } catch {
    return 0;
  }
}

export async function getNavCounts() {
  const token = await getServerAccessToken();
  if (!token) {
    return { cartCount: 0, wishlistCount: 0 };
  }

  const [cartCount, wishlistCount] = await Promise.all([
    fetchCount("/api/v1/cart"),
    fetchCount("/api/v1/wishlist"),
  ]);

  return { cartCount, wishlistCount };
}
