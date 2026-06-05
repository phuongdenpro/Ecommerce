import type { ApiResponse } from "@/types/api";
import type { Coupon, CouponValidation } from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const couponsApi = {
  async validate(code: string, orderAmount: number) {
    const { data } = await apiClient.post<ApiResponse<CouponValidation>>(
      "/coupons/validate",
      { code, orderAmount },
    );
    return unwrapData(data);
  },

  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Coupon[]>>("/coupons");
    return unwrapData(data);
  },

  async create(payload: {
    code: string;
    description?: string;
    discountType: number;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
  }) {
    const { data } = await apiClient.post<ApiResponse<Coupon>>("/coupons", payload);
    return unwrapData(data);
  },

  async update(
    id: string,
    payload: {
      code: string;
      description?: string;
      discountType: number;
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      startDate: string;
      endDate: string;
      usageLimit?: number;
    },
  ) {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(`/coupons/${id}`, payload);
    return unwrapData(data);
  },

  async delete(id: string) {
    await apiClient.delete(`/coupons/${id}`);
  },
};
