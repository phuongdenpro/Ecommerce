"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { adminReportService } from "@/features/admin/services";
import type { CustomersReport, OrdersReport, RevenueReport } from "@/types/admin";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminDateRange } from "@/features/admin/components/admin-date-range";
import { AdminStatsSkeleton } from "@/features/admin/components/admin-loading-skeleton";
import { AdminErrorState } from "@/features/admin/components/admin-error-state";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RevenueChart = dynamic(
  () => import("@/features/admin/components/reports/revenue-chart").then((m) => ({ default: m.RevenueChart })),
  { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-xl bg-slate-100" /> },
);

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [orders, setOrders] = useState<OrdersReport | null>(null);
  const [customers, setCustomers] = useState<CustomersReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = { from: from || undefined, to: to || undefined };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rev, ord, cust] = await Promise.all([
        adminReportService.getRevenue(query),
        adminReportService.getOrders(query),
        adminReportService.getCustomers(query),
      ]);
      setRevenue(rev);
      setOrders(ord);
      setCustomers(cust);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = async (type: "revenue" | "orders" | "customers") => {
    try {
      const blob = await adminReportService.exportCsv(type, query);
      downloadBlob(blob, `${type}-report.csv`);
      toast.success("Đã tải file CSV");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export thất bại");
    }
  };

  const chartData =
    revenue?.byDay.map((d) => ({
      name: d.period,
      revenue: d.revenue,
      orders: d.orderCount,
    })) ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo"
        description="Doanh thu và đơn hàng theo khoảng ngày"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Báo cáo" }]}
      />

      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-4">
        <AdminDateRange from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <Button variant="outline" onClick={load}>
          Áp dụng
        </Button>
      </div>

      {loading && <AdminStatsSkeleton count={3} />}
      {error && <AdminErrorState message={error} onRetry={load} />}

      {revenue && orders && customers && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">Doanh thu (kỳ)</p>
              <p className="text-2xl font-bold">{formatCurrency(revenue.totalRevenue)}</p>
              <p className="text-xs text-slate-400">{revenue.totalOrders} đơn đã thanh toán</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">Tổng đơn (kỳ)</p>
              <p className="text-2xl font-bold">{orders.totalOrders}</p>
              <p className="text-xs text-slate-400">{formatCurrency(orders.totalAmount)} giá trị</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">Khách mới</p>
              <p className="text-2xl font-bold">{customers.newCustomers}</p>
            </div>
          </div>

          <RevenueChart data={chartData} />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportCsv("revenue")}>
              <Download className="mr-2 h-4 w-4" />
              CSV doanh thu
            </Button>
            <Button variant="outline" onClick={() => exportCsv("orders")}>
              <Download className="mr-2 h-4 w-4" />
              CSV đơn hàng
            </Button>
            <Button variant="outline" onClick={() => exportCsv("customers")}>
              <Download className="mr-2 h-4 w-4" />
              CSV khách hàng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-3 font-semibold">Đơn theo trạng thái</h3>
              <ul className="space-y-1 text-sm">
                {orders.byStatus.map((s) => (
                  <li key={s.label} className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="font-medium">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-3 font-semibold">Đăng ký theo tháng</h3>
              <ul className="space-y-1 text-sm">
                {customers.byMonth.map((s) => (
                  <li key={s.period} className="flex justify-between">
                    <span>{s.period}</span>
                    <span className="font-medium">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
