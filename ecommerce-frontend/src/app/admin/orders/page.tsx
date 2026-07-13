"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Download, Eye } from "lucide-react";
import { adminOrderService } from "@/features/admin/services";
import type { OrderListItem } from "@/types";
import type { PagedResult } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { AdminDateRange } from "@/features/admin/components/admin-date-range";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/admin/components/admin-status-badge";
import { MoneyText } from "@/features/admin/components/money-text";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipping", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

import { toast } from "sonner";

async function handleExportCsv(query: { search?: string; status?: string; paymentStatus?: string; createdFrom?: string; createdTo?: string; }) {
  try {
    const blob = await adminOrderService.exportCsv(query);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file CSV thành công.");
  } catch (error) {
    toast.error("Lỗi khi tải file CSV. Vui lòng thử lại sau.");
  }
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<PagedResult<OrderListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await adminOrderService.getOrders({
          pageNumber: page,
          pageSize: 15,
          search: search || undefined,
          status: status || undefined,
          paymentStatus: paymentStatus || undefined,
          createdFrom: from || undefined,
          createdTo: to ? `${to}T23:59:59` : undefined,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentStatus, from, to]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title="Đơn hàng"
        description="Quản lý và cập nhật trạng thái đơn"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Đơn hàng" }]}
        actions={
          <>
            <Button 
              variant="outline" 
              onClick={() => handleExportCsv({ 
                search: search || undefined, 
                status: status || undefined, 
                paymentStatus: paymentStatus || undefined, 
                createdFrom: from || undefined, 
                createdTo: to ? `${to}T23:59:59` : undefined 
              })} 
              disabled={!data?.items.length}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Link href="/admin/orders/create">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo đơn
              </Button>
            </Link>
          </>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Mã đơn, khách, email..." />
        <Select className="w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Trạng thái đơn</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select className="w-40" value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
          <option value="">Thanh toán</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <AdminDateRange from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      </AdminFilterBar>

      <AdminDataTable loading={loading} error={error} empty={!data?.items.length} onRetry={load}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">SP</th>
              <th className="px-4 py-3">Tổng</th>
              <th className="px-4 py-3">TT đơn</th>
              <th className="px-4 py-3">TT thanh toán</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data?.items.map((o, index) => (
              <tr key={o.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{(((data?.pageNumber ?? 1) - 1) * (data?.pageSize ?? 1)) + index + 1}</td>
                <td className="px-4 py-3 font-medium">{o.orderCode}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3">{o.itemCount}</td>
                <td className="px-4 py-3"><MoneyText amount={o.finalAmount} /></td>
                <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination pageNumber={data.pageNumber} totalPages={data.totalPages} totalItems={data.totalItems} onPageChange={setPage} />
          </div>
        )}
      </AdminDataTable>
    </div>
  );
}
