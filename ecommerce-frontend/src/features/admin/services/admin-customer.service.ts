import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type {
  AdminUserDetail,
  AdminUserListItem,
  CreateAdminUserRequest,
} from "@/types/admin";
import type { WishlistItem, Address } from "@/types";
import { apiClient } from "@/lib/api/client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";
import { log } from "console";

export interface CustomerQuery extends PaginationQuery {
  role?: string;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
  search?: string;
}

export const adminCustomerService = {
  async getCustomers(query: CustomerQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<AdminUserListItem>>>(
      "/admin/users",
      { params: { ...query, role: "Customer" } },
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

  async update(id: string, payload: { fullName: string; email: string; phoneNumber?: string }) {
    const { data } = await apiClient.put<ApiResponse<AdminUserDetail>>(
      `/admin/users/${id}`,
      payload,
    );
    return unwrapData(data);
  },

  async create(payload: CreateAdminUserRequest) {
    const { data } = await apiClient.post<ApiResponse<AdminUserDetail>>("/admin/users", {
      ...payload,
      role: payload.role ?? "Customer",
    });
    return unwrapData(data);
  },

  async getNotes(id: string) {
    const { data } = await apiClient.get<ApiResponse<{ userId: string; adminNotes?: string }>>(
      `/admin/users/${id}/notes`,
    );
    return unwrapData(data);
  },

  async setNotes(id: string, adminNotes: string | null) {
    const { data } = await apiClient.put<ApiResponse<{ userId: string; adminNotes?: string }>>(
      `/admin/users/${id}/notes`,
      { adminNotes },
    );
    return unwrapData(data);
  },

  async addAddress(id: string, payload: Omit<Address, "id" | "isDefault">) {
    const { data } = await apiClient.post<ApiResponse<Address>>(
      `/admin/users/${id}/addresses`,
      payload,
    );
    return unwrapData(data);
  },

  async updateAddress(id: string, addressId: string, payload: Omit<Address, "id" | "isDefault">) {
    const { data } = await apiClient.put<ApiResponse<Address>>(
      `/admin/users/${id}/addresses/${addressId}`,
      payload,
    );
    return unwrapData(data);
  },

  async deleteAddress(id: string, addressId: string) {
    await apiClient.delete(`/admin/users/${id}/addresses/${addressId}`);
  },

  async setDefaultAddress(id: string, addressId: string) {
    const { data } = await apiClient.put<ApiResponse<Address>>(
      `/admin/users/${id}/addresses/${addressId}/default`,
    );
    if (!data.success) {
    throw new Error(data.message || "Đặt địa chỉ mặc định thất bại");
  }

    return data;
  },

  async getWishlist(id: string) {
    const { data } = await apiClient.get<ApiResponse<WishlistItem[]>>(`/admin/users/${id}/wishlist`);
    return unwrapData(data);
  },
};
