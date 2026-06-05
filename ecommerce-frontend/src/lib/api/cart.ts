import type { ApiResponse } from "@/types/api";
import type { Cart } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const cartApi = {
  async getCart() {
    const { data } = await apiClient.get<ApiResponse<Cart>>("/cart");
    return unwrapData(data);
  },

  async addItem(productId: string, quantity = 1) {
    if (!productId) throw new Error("Invalid product");
    const qty = Math.max(1, Number(quantity) || 0);
    const { data } = await apiClient.post<ApiResponse<Cart>>("/cart/items", {
      productId,
      quantity: qty,
    });
    return unwrapData(data);
  },

  async updateItem(itemId: string, quantity: number) {
    const { data } = await apiClient.put<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
      { quantity },
    );
    return unwrapData(data);
  },

  async removeItem(itemId: string) {
    const { data } = await apiClient.delete<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
    );
    return unwrapData(data);
  },
};
