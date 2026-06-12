import type { CartItemResponse } from "@/api/generated/cart";
import { API_BASE_URL } from "@/lib/api-base";
import { authHeaders, getServerAccessToken } from "@/lib/server-auth";

type CartPayload = {
  data?: CartItemResponse[];
};

export type CartCourseItem = {
  id: string;
  courseId: string;
  title: string;
  image: string;
  rating: string;
  reviewLabel: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  priceLabel: string;
  originalPriceLabel?: string;
};

export type CartPageData = {
  authenticated: boolean;
  items: CartCourseItem[];
  subtotal: number;
  subtotalLabel: string;
  totalLabel: string;
};

async function fetchJson<T>(path: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: await authHeaders({ Accept: "application/json" }),
    });

    if (!response.ok) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

export function money(value?: number) {
  if (!value) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapCartItem(item: CartItemResponse, index: number): CartCourseItem | undefined {
  const course = item.course;
  if (!item.id || !course?.id) return undefined;

  const price = course.discountedPrice ?? course.price ?? 0;
  const originalPrice = course.discountedPrice && course.price && course.discountedPrice < course.price ? course.price : undefined;

  return {
    id: item.id,
    courseId: course.id,
    title: course.title || "Untitled course",
    image: course.images?.[0]?.imageUrl || `/courses/course-${String((index % 8) + 1).padStart(2, "0")}.png`,
    rating: typeof course.rating === "number" && course.rating > 0 ? course.rating.toFixed(1) : "No reviews yet",
    reviewLabel: course.enrollmentCount ? `(${new Intl.NumberFormat("en-US").format(course.enrollmentCount)} learners)` : "",
    instructor: course.instructor?.name || "Lumina Instructor",
    price,
    originalPrice,
    priceLabel: money(price),
    originalPriceLabel: originalPrice ? money(originalPrice) : undefined,
  };
}

export async function getCartPageData(): Promise<CartPageData> {
  const token = await getServerAccessToken();

  if (!token) {
    return {
      authenticated: false,
      items: [],
      subtotal: 0,
      subtotalLabel: money(0),
      totalLabel: money(0),
    };
  }

  const payload = await fetchJson<CartPayload>("/api/v1/cart");
  const items = (payload?.data || []).map(mapCartItem).filter((item): item is CartCourseItem => Boolean(item));
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return {
    authenticated: true,
    items,
    subtotal,
    subtotalLabel: money(subtotal),
    totalLabel: money(subtotal),
  };
}
