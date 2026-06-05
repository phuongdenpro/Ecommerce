import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type { AdminPaymentListItem } from "@/types/admin";
import type { Payment } from "@/types";
import { apiClient } from "@/lib/api/client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export interface AdminPaymentQuery extends PaginationQuery {
  status?: string;
  method?: string;
}

export const adminPaymentService = {
  async getAll(query: AdminPaymentQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<AdminPaymentListItem>>>(
      "/admin/payments",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async updateStatus(id: string, status: string) {
    const { data } = await apiClient.put<ApiResponse<Payment>>(
      `/admin/payments/${id}/status`,
      { status },
    );
    return unwrapData(data);
  },
};
