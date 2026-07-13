import type { ApiResponse, PagedResult } from "@/types/api";
import type { OrderDetail, OrderListItem } from "@/types";
import { apiClient } from "@/lib/api/client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export interface AdminOrderQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  userId?: string;
  createdFrom?: string;
  createdTo?: string;
  sortDescending?: boolean;
}

export const adminOrderService = {
  async getOrders(query: AdminOrderQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<OrderListItem>>>(
      "/orders",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
    return unwrapData(data);
  },

  // Map frontend status strings to backend numeric codes
  // Pending=0, Confirmed=1, Processing=2, Shipping=3, Delivered=4, Cancelled=5
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

  async adminCancel(id: string) {
    await apiClient.post(`/orders/${id}/admin-cancel`);
  },

  async createForCustomer(payload: {
    customerId: string;
    addressId?: string;
    shippingAddress?: string;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
    paymentMethod: string;
    paymentStatus: string;
    shippingFee: number;
    note?: string;
  }) {
    const paymentMethodMap: Record<string, number> = {
      Cod: 0,
      BankTransfer: 1,
      OnlinePayment: 2,
    };

    const paymentStatusMap: Record<string, number> = {
      Pending: 0,
      Paid: 1,
      Failed: 2,
      Refunded: 3,
    };

    const body: {
      customerId: string;
      addressId?: string;
      shippingAddress?: string;
      items: { productId: string; quantity: number }[];
      couponCode?: string;
      paymentMethod: number | string;
      paymentStatus: number | string;
      shippingFee: number;
      note?: string;
    } = {
      ...payload,
      paymentMethod: paymentMethodMap[payload.paymentMethod] ?? payload.paymentMethod,
      paymentStatus: paymentStatusMap[payload.paymentStatus] ?? payload.paymentStatus,
    };

    const { data } = await apiClient.post<ApiResponse<OrderDetail>>("/admin/orders", body);
    return unwrapData(data);
  },

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const paymentStatusMap: Record<string, number> = {
      Pending: 0,
      Paid: 1,
      Failed: 2,
      Refunded: 3,
    };
    const payload: { paymentStatus: number | string } = {
      paymentStatus: paymentStatusMap[paymentStatus] ?? paymentStatus,
    };
    const { data } = await apiClient.put<ApiResponse<OrderDetail>>(`/admin/orders/${orderId}/payment-status`, payload);
    return unwrapData(data);
  },

  async exportCsv(query: AdminOrderQuery = {}) {
    const response = await apiClient.get("/admin/orders/export", {
      params: query,
      responseType: "blob",
    });
    return response.data;
  },
};
