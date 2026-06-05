import type { ApiResponse } from "@/types/api";
import type { Payment } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const paymentsApi = {
  async process(orderId: string, method: number) {
    const { data } = await apiClient.post<ApiResponse<Payment>>("/payments/process", {
      orderId,
      method,
    });
    return unwrapData(data);
  },

  async getByOrder(orderId: string) {
    const { data } = await apiClient.get<ApiResponse<Payment>>(
      `/payments/order/${orderId}`,
    );
    return unwrapData(data);
  },
};
