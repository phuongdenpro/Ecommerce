"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminSettingsService } from "@/features/admin/services";
import type { StoreSettings } from "@/types/admin";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminErrorState } from "@/features/admin/components/admin-error-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setForm(await adminSettingsService.get());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được cài đặt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      setForm(await adminSettingsService.update(form));
      toast.success("Đã lưu cài đặt");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !form) {
    return <AdminErrorState message={error ?? "Lỗi"} onRetry={load} />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Cài đặt cửa hàng"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Cài đặt" }]}
      />

      <form
        className="max-w-2xl space-y-4 rounded-xl border bg-white p-6"
        onSubmit={onSave}
      >
        <Input
          label="Tên cửa hàng"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          required
        />
        <Input
          label="Logo URL"
          value={form.logoUrl ?? ""}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value || undefined })}
        />
        <Input
          label="Email hỗ trợ"
          value={form.supportEmail ?? ""}
          onChange={(e) => setForm({ ...form, supportEmail: e.target.value || undefined })}
        />
        <Input
          label="Hotline"
          value={form.hotline ?? ""}
          onChange={(e) => setForm({ ...form, hotline: e.target.value || undefined })}
        />
        <Input
          label="Địa chỉ"
          value={form.address ?? ""}
          onChange={(e) => setForm({ ...form, address: e.target.value || undefined })}
        />
        <Input
          label="Phí ship mặc định (VND)"
          type="number"
          value={form.defaultShippingFee}
          onChange={(e) =>
            setForm({ ...form, defaultShippingFee: Number(e.target.value) || 0 })
          }
        />
        <Input
          label="Miễn phí ship từ (VND)"
          type="number"
          value={form.freeShippingThreshold}
          onChange={(e) =>
            setForm({ ...form, freeShippingThreshold: Number(e.target.value) || 0 })
          }
        />
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableCod}
              onChange={(e) => setForm({ ...form, enableCod: e.target.checked })}
            />
            Bật COD
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableBankTransfer}
              onChange={(e) => setForm({ ...form, enableBankTransfer: e.target.checked })}
            />
            Bật chuyển khoản
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableOnlinePayment}
              onChange={(e) => setForm({ ...form, enableOnlinePayment: e.target.checked })}
            />
            Bật thanh toán online
          </label>
        </div>
        <Button type="submit" isLoading={saving}>
          Lưu cài đặt
        </Button>
      </form>
    </div>
  );
}
