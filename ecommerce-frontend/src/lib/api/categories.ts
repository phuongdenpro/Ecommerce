import type { ApiResponse } from "@/types/api";
import type { Category } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const categoriesApi = {
  async getAll(includeInactive = false) {
    const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories", {
      params: { includeInactive },
    });
    return unwrapData(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return unwrapData(data);
  },

  async create(payload: {
    name: string;
    description?: string;
    parentId?: string;
    isActive?: boolean;
  }) {
    const { data } = await apiClient.post<ApiResponse<Category>>(
      "/categories",
      payload,
    );
    return unwrapData(data);
  },

  async update(
    id: string,
    payload: {
      name: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
    },
  ) {
    const { data } = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      payload,
    );
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
