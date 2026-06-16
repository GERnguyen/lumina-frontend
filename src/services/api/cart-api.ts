import { apiClient } from "@/lib/api-client";
import { cache } from "react";
import type { ApiResponse, AddToCartRequest, CartItemResponse } from "@/types";

export const CartApi = {
  getCart: cache(async (): Promise<ApiResponse<CartItemResponse[]>> => {
    return apiClient.get("/api/v1/cart");
  }),

  async addToCart(body: AddToCartRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post("/api/v1/cart", body);
  },

  async removeFromCart(itemId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete(`/api/v1/cart/${itemId}`);
  },

  async clearCart(): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.delete("/api/v1/cart/clear");
  },
};
