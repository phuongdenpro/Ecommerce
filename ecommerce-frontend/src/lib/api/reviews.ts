import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type { Review } from "@/types";
import { apiClient } from "./client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export const reviewsApi = {
  async getByProduct(productId: string, query: PaginationQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<Review>>>(
      `/reviews/product/${productId}`,
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async create(payload: {
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
  }) {
    const { data } = await apiClient.post<ApiResponse<Review>>("/reviews", payload);
    return unwrapData(data);
  },

  async update(id: string, payload: { rating: number; comment?: string }) {
    const { data } = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, payload);
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/reviews/${id}`);
  },

  async hide(id: string) {
    await apiClient.put(`/reviews/${id}/hide`);
  },
};
