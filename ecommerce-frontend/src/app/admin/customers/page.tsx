"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Lock, Plus, Unlock } from "lucide-react";
import { toast } from "sonner";
import { adminCustomerService } from "@/features/admin/services";
import type { AdminUserListItem } from "@/types/admin";
import type { PagedResult } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { AdminDateRange } from "@/features/admin/components/admin-date-range";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { ActiveBadge } from "@/features/admin/components/admin-status-badge";
import { MoneyText } from "@/features/admin/components/money-text";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateCustomerModal } from "@/features/admin/components/create-customer-modal";

export default function AdminCustomersPage() {
  const [data, setData] = useState<PagedResult<AdminUserListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleId, setToggleId] = useState<{
    id: string;
    active: boolean;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminCustomerService.getCustomers({
        pageNumber: page,
        pageSize: 10,
        search: search || undefined,
        isActive: activeFilter === "" ? undefined : activeFilter === "true",
        createdFrom: from || undefined,
        createdTo: to || undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter, from, to]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleActive = async () => {
    if (!toggleId) return;
    try {
      await adminCustomerService.setActive(toggleId.id, toggleId.active);
      toast.success(toggleId.active ? "Đã mở khóa" : "Đã khóa");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setToggleId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Khách hàng"
        description="Quản lý tài khoản Customer"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Khách hàng" },
        ]}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tên, email, SĐT..."
        />
        <Select
          className="w-40"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả TT</option>
          <option value="true">Hoạt động</option>
          <option value="false">Đã khóa</option>
        </Select>
        <AdminDateRange
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </AdminFilterBar>

      <AdminDataTable
        loading={loading}
        error={error}
        empty={!loading && !error && data?.items.length === 0}
        emptyTitle="Chưa có khách hàng"
        onRetry={load}
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Liên hệ</th>
              <th className="px-4 py-3">Đơn</th>
              <th className="px-4 py-3">Chi tiêu</th>
              <th className="px-4 py-3">TT</th>
              <th className="px-4 py-3">Đăng ký</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((c, index) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">
                  {((data?.pageNumber ?? 1) - 1) * (data?.pageSize ?? 1) +
                    index +
                    1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {c.fullName.charAt(0)}
                    </div>
                    <span className="font-medium">{c.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p>{c.email}</p>
                  <p className="text-slate-500">{c.phoneNumber ?? "—"}</p>
                </td>
                <td className="px-4 py-3">{c.totalOrders}</td>
                <td className="px-4 py-3">
                  <MoneyText amount={c.totalSpent} />
                </td>
                <td className="px-4 py-3">
                  <ActiveBadge active={c.isActive} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/customers/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setToggleId({ id: c.id, active: !c.isActive })
                      }
                    >
                      {c.isActive ? (
                        <Lock className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination
              pageNumber={data.pageNumber}
              totalPages={data.totalPages}
              totalItems={data.totalItems}
              onPageChange={setPage}
            />
          </div>
        )}
      </AdminDataTable>

      <ConfirmDialog
        open={!!toggleId}
        title={toggleId?.active ? "Mở khóa khách?" : "Khóa khách hàng?"}
        message="Khách sẽ không đăng nhập được khi bị khóa."
        confirmLabel={toggleId?.active ? "Mở khóa" : "Khóa"}
        onConfirm={toggleActive}
        onCancel={() => setToggleId(null)}
      />

      <CreateCustomerModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </div>
  );
}
