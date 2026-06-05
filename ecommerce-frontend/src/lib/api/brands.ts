import type { ApiResponse } from "@/types/api";
import type { Brand } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const brandsApi = {
  async getAll(includeInactive = false) {
    const { data } = await apiClient.get<ApiResponse<Brand[]>>("/brands", {
      params: { includeInactive },
    });
    return unwrapData(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
    return unwrapData(data);
  },

  async create(payload: {
    name: string;
    description?: string;
    isActive?: boolean;
  }) {
    const { data } = await apiClient.post<ApiResponse<Brand>>("/brands", payload);
    return unwrapData(data);
  },

  async update(
    id: string,
    payload: { name: string; description?: string; isActive?: boolean },
  ) {
    const { data } = await apiClient.put<ApiResponse<Brand>>(`/brands/${id}`, payload);
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/brands/${id}`);
  },
};
