import type { ApiResponse } from "@/types/api";
import type {
  DashboardExtended,
  LowStockProduct,
  AdminReviewListItem,
  RecentCustomer,
} from "@/types/admin";
import type { DashboardSummary, RecentOrder, RevenueByPeriod, TopProduct } from "@/types";
import { apiClient } from "@/lib/api/client";
import { unwrapData } from "@/lib/api-response";
import { pick, pickArray, pickNumber } from "@/lib/normalize-api";

function normalizeSummary(raw: Record<string, unknown>): DashboardSummary {
  return {
    totalUsers: pickNumber(raw, "totalUsers", "TotalUsers"),
    totalProducts: pickNumber(raw, "totalProducts", "TotalProducts"),
    totalOrders: pickNumber(raw, "totalOrders", "TotalOrders"),
    totalRevenue: pickNumber(raw, "totalRevenue", "TotalRevenue"),
  };
}

function normalizeRevenuePeriod(row: Record<string, unknown>): RevenueByPeriod {
  return {
    period: String(pick(row, "period", "Period") ?? ""),
    revenue: pickNumber(row, "revenue", "Revenue"),
    orderCount: pickNumber(row, "orderCount", "OrderCount"),
  };
}

function normalizeExtended(raw: Record<string, unknown>): DashboardExtended {
  const summaryRaw = (pick<Record<string, unknown>>(raw, "summary", "Summary") ?? {}) as Record<
    string,
    unknown
  >;

  return {
    summary: normalizeSummary(summaryRaw),
    totalCustomers: pickNumber(raw, "totalCustomers", "TotalCustomers"),
    totalStaff: pickNumber(raw, "totalStaff", "TotalStaff"),
    totalAdmins: pickNumber(raw, "totalAdmins", "TotalAdmins"),
    totalCategories: pickNumber(raw, "totalCategories", "TotalCategories"),
    totalBrands: pickNumber(raw, "totalBrands", "TotalBrands"),
    pendingOrders: pickNumber(raw, "pendingOrders", "PendingOrders"),
    confirmedOrders: pickNumber(raw, "confirmedOrders", "ConfirmedOrders"),
    processingOrders: pickNumber(raw, "processingOrders", "ProcessingOrders"),
    shippingOrders: pickNumber(raw, "shippingOrders", "ShippingOrders"),
    deliveredOrders: pickNumber(raw, "deliveredOrders", "DeliveredOrders"),
    cancelledOrders: pickNumber(raw, "cancelledOrders", "CancelledOrders"),
    revenueToday: pickNumber(raw, "revenueToday", "RevenueToday"),
    revenueThisMonth: pickNumber(raw, "revenueThisMonth", "RevenueThisMonth"),
    ordersByStatus: pickArray<Record<string, unknown>>(raw, "ordersByStatus", "OrdersByStatus").map(
      (s) => ({
        label: String(pick(s, "label", "Label") ?? ""),
        count: pickNumber(s, "count", "Count"),
        amount: pick<number>(s, "amount", "Amount"),
      }),
    ),
    paymentsByMethod: pickArray<Record<string, unknown>>(
      raw,
      "paymentsByMethod",
      "PaymentsByMethod",
    ).map((s) => ({
      label: String(pick(s, "label", "Label") ?? ""),
      count: pickNumber(s, "count", "Count"),
      amount: pick<number>(s, "amount", "Amount"),
    })),
    revenueDaily: pickArray<Record<string, unknown>>(raw, "revenueDaily", "RevenueDaily").map(
      normalizeRevenuePeriod,
    ),
    revenueMonthly: pickArray<Record<string, unknown>>(raw, "revenueMonthly", "RevenueMonthly").map(
      normalizeRevenuePeriod,
    ),
    userSignupsMonthly: pickArray<Record<string, unknown>>(
      raw,
      "userSignupsMonthly",
      "UserSignupsMonthly",
    ).map((s) => ({
      period: String(pick(s, "period", "Period") ?? ""),
      count: pickNumber(s, "count", "Count"),
    })),
  };
}

export const adminDashboardService = {
  async getExtended() {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      "/admin/dashboard/extended",
    );
    return normalizeExtended(unwrapData(data) as Record<string, unknown>);
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

  async getLowStock(count = 10, threshold = 10) {
    const { data } = await apiClient.get<ApiResponse<LowStockProduct[]>>(
      "/admin/dashboard/low-stock",
      { params: { count, threshold } },
    );
    return unwrapData(data);
  },

  async getRecentReviews(count = 10) {
    const { data } = await apiClient.get<ApiResponse<AdminReviewListItem[]>>(
      "/admin/dashboard/recent-reviews",
      { params: { count } },
    );
    return unwrapData(data);
  },

  async getRecentCustomers(count = 10) {
    const { data } = await apiClient.get<ApiResponse<RecentCustomer[]>>(
      "/admin/dashboard/recent-customers",
      { params: { count } },
    );
    return unwrapData(data);
  },
};
