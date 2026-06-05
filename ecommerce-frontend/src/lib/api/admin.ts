import type { ApiResponse } from "@/types/api";
import type {
  DashboardSummary,
  RecentOrder,
  RevenueByPeriod,
  TopProduct,
} from "@/types";
import { apiClient } from "./client";
import { unwrapData } from "@/lib/api-response";

export const adminApi = {
  async getDashboard() {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(
      "/admin/dashboard",
    );
    return unwrapData(data);
  },

  async getRevenue(period = "day") {
    const { data } = await apiClient.get<ApiResponse<RevenueByPeriod[]>>(
      "/admin/dashboard/revenue",
      { params: { period } },
    );
    return unwrapData(data);
  },

  async getTopProducts(count = 10) {
    const { data } = await apiClient.get<ApiResponse<TopProduct[]>>(
      "/admin/dashboard/top-products",
      { params: { count } },
    );
    return unwrapData(data);
  },

  async getRecentOrders(count = 10) {
    const { data } = await apiClient.get<ApiResponse<RecentOrder[]>>(
      "/admin/dashboard/recent-orders",
      { params: { count } },
    );
    return unwrapData(data);
  },
};
