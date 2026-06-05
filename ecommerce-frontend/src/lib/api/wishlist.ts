import type { ApiResponse } from "@/types/api";
import type { WishlistItem } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const wishlistApi = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<WishlistItem[]>>("/wishlist");
    return unwrapData(data);
  },

  async add(productId: string) {
    await apiClient.post(`/wishlist/${productId}`);
  },

  async remove(productId: string) {
    await apiClient.delete(`/wishlist/${productId}`);
  },
};
