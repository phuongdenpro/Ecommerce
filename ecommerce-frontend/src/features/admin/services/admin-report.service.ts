import type { ApiResponse } from "@/types/api";
import type { CustomersReport, OrdersReport, RevenueReport } from "@/types/admin";
import { apiClient } from "@/lib/api/client";
import { unwrapData } from "@/lib/api-response";

export interface ReportQuery {
  from?: string;
  to?: string;
}

export const adminReportService = {
  async getRevenue(query: ReportQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<RevenueReport>>(
      "/admin/reports/revenue",
      { params: query },
    );
    return unwrapData(data);
  },

  async getOrders(query: ReportQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<OrdersReport>>(
      "/admin/reports/orders",
      { params: query },
    );
    return unwrapData(data);
  },

  async getCustomers(query: ReportQuery = {}) {
    const { data } = await apiClient.get<ApiResponse<CustomersReport>>(
      "/admin/reports/customers",
      { params: query },
    );
    return unwrapData(data);
  },

  async exportCsv(type: "revenue" | "orders" | "customers", query: ReportQuery = {}) {
    const response = await apiClient.get<Blob>("/admin/reports/export", {
      params: { type, format: "csv", ...query },
      responseType: "blob",
    });
    return response.data;
  },
};
