"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminUserService } from "@/features/admin/services";
import type { AdminUserListItem } from "@/types/admin";
import type { PagedResult } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { ActiveBadge, RoleBadge } from "@/features/admin/components/admin-status-badge";
import { formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminUsersPage() {
  const [data, setData] = useState<PagedResult<AdminUserListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleChange, setRoleChange] = useState<{ id: string; role: string } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [savingUser, setSavingUser] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await adminUserService.getUsers({
          pageNumber: page,
          pageSize: 10,
          search: search || undefined,
          role: role || undefined,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  const saveUser = async () => {
    if (!editingUserId) return;
    setSavingUser(true);
    try {
      await adminUserService.update(editingUserId, {
        fullName: editFullName,
        email: editEmail,
        phoneNumber: editPhoneNumber || undefined,
      });
      toast.success("Đã lưu thông tin người dùng");
      setEditingUserId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSavingUser(false);
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditFullName("");
    setEditEmail("");
    setEditPhoneNumber("");
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title="Người dùng"
        description="Toàn bộ tài khoản Admin, Staff, Customer"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Người dùng" }]}
      />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} />
        <Select className="w-40" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">Tất cả role</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Customer">Customer</option>
        </Select>
      </AdminFilterBar>

      {editingUserId && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Chỉnh sửa người dùng</h3>
              <p className="text-sm text-slate-500">Cập nhật tên, email hoặc số điện thoại.</p>
            </div>
            <Button variant="ghost" onClick={cancelEdit}>
              Hủy
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Họ tên" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
            <Input label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <Input label="Số điện thoại" value={editPhoneNumber} onChange={(e) => setEditPhoneNumber(e.target.value)} />
          </div>
          <div className="mt-4">
            <Button onClick={saveUser} isLoading={savingUser}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      )}

      <AdminDataTable loading={loading} error={error} empty={!data?.items.length} onRetry={load}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">TT</th>
              <th className="px-4 py-3">Đăng ký</th>
              <th className="px-4 py-3">Đổi role</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.fullName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <ActiveBadge active={u.isActive} />
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <Select
                    className="w-32"
                    value={u.role}
                    onChange={(e) => setRoleChange({ id: u.id, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Customer">Customer</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingUserId(u.id);
                      setEditFullName(u.fullName);
                      setEditEmail(u.email);
                      setEditPhoneNumber(u.phoneNumber ?? "");
                    }}
                  >
                    Sửa
                  </Button>
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

      <ConfirmDialog
        open={!!roleChange}
        title="Đổi role?"
        message={`Đặt role thành ${roleChange?.role}?`}
        confirmLabel="Xác nhận"
        onConfirm={async () => {
          if (!roleChange) return;
          try {
            await adminUserService.setRole(roleChange.id, roleChange.role);
            toast.success("Đã đổi role");
            load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Lỗi");
          } finally {
            setRoleChange(null);
          }
        }}
        onCancel={() => setRoleChange(null)}
      />
    </div>
  );
}
