"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Users,
  UserCircle,
  Shield,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { adminDashboardService } from "@/features/admin/services";
import type { DashboardExtended } from "@/types/admin";
import type { TopProduct, RecentOrder } from "@/types";
import type { LowStockProduct, AdminReviewListItem, RecentCustomer } from "@/types/admin";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { AdminStatsSkeleton } from "@/features/admin/components/admin-loading-skeleton";
import { AdminErrorState } from "@/features/admin/components/admin-error-state";
import { QuickActions } from "@/features/admin/components/quick-actions";
import {
  TopProductsTable,
  RecentOrdersTable,
  RecentCustomersTable,
  LowStockTable,
  RecentReviewsTable,
} from "@/features/admin/components/dashboard/dashboard-tables";
import { MoneyText } from "@/features/admin/components/money-text";

const DashboardCharts = dynamic(
  () =>
    import("@/features/admin/components/dashboard/dashboard-charts").then((m) => ({
      default: m.DashboardCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-[320px] animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    ),
  },
);

async function loadOptional<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default function AdminDashboardPage() {
  const [extended, setExtended] = useState<DashboardExtended | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [recentReviews, setRecentReviews] = useState<AdminReviewListItem[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const ext = await adminDashboardService.getExtended();
      setExtended(ext);

      const [top, orders, stock, reviews, customers] = await Promise.all([
        loadOptional(() => adminDashboardService.getTopProducts(5), []),
        loadOptional(() => adminDashboardService.getRecentOrders(5), []),
        loadOptional(() => adminDashboardService.getLowStock(5), []),
        loadOptional(() => adminDashboardService.getRecentReviews(5), []),
        loadOptional(() => adminDashboardService.getRecentCustomers(5), []),
      ]);
      setTopProducts(top);
      setRecentOrders(orders);
      setLowStock(stock);
      setRecentReviews(reviews);
      setRecentCustomers(customers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <AdminErrorState message={error} onRetry={load} />;
  }

  const s = extended?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan hoạt động cửa hàng"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      <QuickActions />

      {loading ? (
        <AdminStatsSkeleton count={8} />
      ) : extended && s ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <AdminStatCard label="Tổng người dùng" value={s.totalUsers} icon={Users} accent="blue" />
            <AdminStatCard label="Khách hàng" value={extended.totalCustomers} icon={UserCircle} accent="indigo" />
            <AdminStatCard label="Nhân viên" value={extended.totalStaff} icon={Users} accent="violet" />
            <AdminStatCard label="Admin" value={extended.totalAdmins} icon={Shield} accent="slate" />
            <AdminStatCard label="Sản phẩm" value={s.totalProducts} icon={Package} accent="emerald" />
            <AdminStatCard label="Danh mục" value={extended.totalCategories} icon={FolderTree} accent="slate" />
            <AdminStatCard label="Thương hiệu" value={extended.totalBrands} icon={Tag} accent="slate" />
            <AdminStatCard label="Tổng đơn" value={s.totalOrders} icon={ShoppingBag} accent="amber" />
            <AdminStatCard label="Chờ xử lý" value={extended.pendingOrders} icon={Clock} accent="amber" />
            <AdminStatCard label="Đang giao" value={extended.shippingOrders} icon={Truck} accent="violet" />
            <AdminStatCard label="Hoàn thành" value={extended.deliveredOrders} icon={CheckCircle} accent="emerald" />
            <AdminStatCard label="Đã hủy" value={extended.cancelledOrders} icon={XCircle} accent="rose" />
            <AdminStatCard
              label="Tổng doanh thu"
              value={<MoneyText amount={s.totalRevenue} />}
              icon={DollarSign}
              accent="emerald"
            />
            <AdminStatCard
              label="Doanh thu hôm nay"
              value={<MoneyText amount={extended.revenueToday} />}
              icon={Calendar}
              accent="emerald"
            />
            <AdminStatCard
              label="Doanh thu tháng"
              value={<MoneyText amount={extended.revenueThisMonth} />}
              icon={DollarSign}
              accent="indigo"
            />
          </div>

          <DashboardCharts data={extended} />
        </>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <TopProductsTable items={topProducts} loading={loading} />
        <RecentOrdersTable items={recentOrders} loading={loading} />
        <RecentCustomersTable items={recentCustomers} />
        <LowStockTable items={lowStock} />
        <RecentReviewsTable items={recentReviews} />
      </div>
    </div>
  );
}
