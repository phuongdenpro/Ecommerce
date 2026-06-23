import type { ApiResponse, PagedResult, PaginationQuery } from "@/types/api";
import type { ProductDetail, ProductListItem } from "@/types";
import { apiClient } from "./client";
import { unwrapData, unwrapPagedData } from "@/lib/api-response";

export interface ProductQuery extends PaginationQuery {
  categoryId?: string;
  brandId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export const productsApi = {
  async getProducts(query: ProductQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<PagedResult<ProductListItem>>>(
      "/products",
      { params: query },
    );
    return unwrapPagedData(data);
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
      `/products/${id}`,
    );
    return unwrapData(data);
  },

  async create(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<ProductDetail>>(
      "/products",
      formData,
    );
    return unwrapData(data);
  },

  async update(id: string, formData: FormData) {
    const { data } = await apiClient.put<ApiResponse<ProductDetail>>(
      `/products/${id}`,
      formData,
    );
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/products/${id}`);
  },
};
