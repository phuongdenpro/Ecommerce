import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type { OrderDetail, OrderListItem } from "@/types";
import { apiClient } from "./client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export interface CreateOrderPayload {
  addressId?: string;
  shippingAddress?: string;
  note?: string;
  couponCode?: string;
  shippingFee: number;
}

export const ordersApi = {
  async create(payload: CreateOrderPayload) {
    const { data } = await apiClient.post<ApiResponse<OrderDetail>>(
      "/orders",
      payload,
    );
    return unwrapData(data);
  },

  async getMyOrders(query: PaginationQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<OrderListItem>>>(
      "/orders/my-orders",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async getMyOrder(id: string) {
    const { data } = await apiClient.get<ApiResponse<OrderDetail>>(
      `/orders/my-orders/${id}`,
    );
    return unwrapData(data);
  },

  async cancel(id: string) {
    await apiClient.post(`/orders/${id}/cancel`);
  },

  async getAllAdmin(
    query: PaginationQuery & { status?: string; userId?: string } = {},
  ) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<OrderListItem>>>(
      "/orders",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async updateStatus(id: string, status: string) {
    const map: Record<string, number> = {
      Pending: 0,
      Confirmed: 1,
      Processing: 2,
      Shipping: 3,
      Delivered: 4,
      Cancelled: 5,
    };
    const payload: { status: number | string } = { status: map[status] ?? status };
    const { data } = await apiClient.put<ApiResponse<OrderDetail>>(`/orders/${id}/status`, payload);
    return unwrapData(data);
  },
};
