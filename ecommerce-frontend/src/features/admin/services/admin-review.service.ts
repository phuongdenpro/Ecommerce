import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type { AdminReviewListItem } from "@/types/admin";
import { apiClient } from "@/lib/api/client";
import { unwrapPagedData } from "@/lib/api-response";

export interface AdminReviewQuery extends PaginationQuery {
  productId?: string;
  rating?: number;
  isHidden?: boolean;
}

export const adminReviewService = {
  async getAll(query: AdminReviewQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<AdminReviewListItem>>>(
      "/admin/reviews",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async hide(id: string) {
    await apiClient.put(`/admin/reviews/${id}/hide`);
  },

  async unhide(id: string) {
    await apiClient.put(`/admin/reviews/${id}/unhide`);
  },

  async delete(id: string) {
    await apiClient.delete(`/admin/reviews/${id}`);
  },
};
