"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { adminPaymentService } from "@/features/admin/services";
import type { AdminPaymentListItem } from "@/types/admin";
import type { PagedResult } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { PaymentStatusBadge } from "@/features/admin/components/admin-status-badge";
import { MoneyText } from "@/features/admin/components/money-text";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PagedResult<AdminPaymentListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await adminPaymentService.getAll({
          pageNumber: page,
          pageSize: 15,
          search: search || undefined,
          status: status || undefined,
          method: method || undefined,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, method]);

  const updatePaymentStatus = async (id: string, nextStatus: string) => {
    setSavingStatusId(id);
    try {
      await adminPaymentService.updateStatus(id, nextStatus);
      toast.success("Đã cập nhật trạng thái thanh toán");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSavingStatusId(null);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <AdminPageHeader title="Thanh toán" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Thanh toán" }]} />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Mã đơn, khách, mã GD..." />
        <Select className="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Trạng thái</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </Select>
        <Select className="w-40" value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
          <option value="">Phương thức</option>
          <option value="Cod">COD</option>
          <option value="BankTransfer">BankTransfer</option>
          <option value="OnlinePayment">OnlinePayment</option>
        </Select>
      </AdminFilterBar>

      <AdminDataTable loading={loading} error={error} empty={!data?.items.length} onRetry={load}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã GD</th>
              <th className="px-4 py-3">Đơn</th>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">PT</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">TT</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{p.transactionId ?? p.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${p.orderId}`} className="text-indigo-600 hover:underline">
                    {p.orderCode}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.customerName}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3"><MoneyText amount={p.amount} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={p.status} />
                    <Select
                      className="w-32"
                      value={p.status}
                      onChange={(e) => updatePaymentStatus(p.id, e.target.value)}
                      disabled={savingStatusId === p.id}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination pageNumber={data.pageNumber} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </AdminDataTable>

      <p className="mt-4 text-xs text-slate-400">
        Cập nhật trạng thái payment thủ công: xem docs/MISSING_BACKEND_APIS.md
      </p>
    </div>
  );
}
