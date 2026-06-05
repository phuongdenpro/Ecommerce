import type { ApiResponse } from "@/types/api";
import type { Address } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const addressesApi = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Address[]>>("/addresses");
    return unwrapData(data);
  },

  async create(payload: Omit<Address, "id" | "isDefault">) {
    const { data } = await apiClient.post<ApiResponse<Address>>("/addresses", payload);
    return unwrapData(data);
  },

  async update(id: string, payload: Omit<Address, "id" | "isDefault">) {
    const { data } = await apiClient.put<ApiResponse<Address>>(
      `/addresses/${id}`,
      payload,
    );
    
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/addresses/${id}`);
  },

  async setDefault(id: string) {
    const { data } = await apiClient.put<ApiResponse<Address>>(
      `/addresses/${id}/default`,
    );
    if (!data.success) {
    throw new Error(data.message || "Đặt mặc định thất bại");
  }

  return data;
  },
};
