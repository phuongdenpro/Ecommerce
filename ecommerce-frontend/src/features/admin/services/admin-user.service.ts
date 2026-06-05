import type { ApiResponse, PagedResult } from "@/types/api";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin";
import type { CustomerQuery } from "./admin-customer.service";
import { apiClient } from "@/lib/api/client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export const adminUserService = {
  async getUsers(query: CustomerQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<AdminUserListItem>>>(
      "/admin/users",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<AdminUserDetail>>(
      `/admin/users/${id}`,
    );
    return unwrapData(data);
  },

  async setActive(id: string, isActive: boolean) {
    await apiClient.put(`/admin/users/${id}/status`, { isActive });
  },

  async setRole(id: string, role: string) {
    await apiClient.put(`/admin/users/${id}/role`, { role });
  },

  async update(id: string, payload: { fullName: string; email: string; phoneNumber?: string }) {
    const { data } = await apiClient.put<ApiResponse<AdminUserDetail>>(
      `/admin/users/${id}`,
      payload,
    );
    return unwrapData(data);
  },
};
