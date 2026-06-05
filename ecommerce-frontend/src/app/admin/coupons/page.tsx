"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { couponsApi } from "@/lib/api/coupons";
import type { Coupon } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const schema = z.object({
  code: z.string().min(3),
  description: z.string().optional(),
  discountType: z.enum(["0", "1"]),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.coerce.number().optional(),
});

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      discountType: "0" as const,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    },
  });

  const load = () =>
    couponsApi
      .getAll()
      .then(setCoupons)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (data: z.infer<typeof schema>) => {
    try {
      const payload = {
        code: data.code,
        description: data.description,
        discountType: Number(data.discountType),
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        usageLimit: data.usageLimit,
      };

      if (editCouponId) {
        await couponsApi.update(editCouponId, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await couponsApi.create(payload);
        toast.success("Đã tạo mã giảm giá");
      }

      form.reset({
        discountType: "0",
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      });
      setShowForm(false);
      setEditCouponId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async () => {
    if (!deleteCouponId) return;
    try {
      await couponsApi.delete(deleteCouponId);
      toast.success("Đã xóa mã");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setDeleteCouponId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Mã giảm giá</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={form.handleSubmit(onCreate)}
          className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2"
        >
          <Input label="Mã" {...form.register("code")} />
          <Select label="Loại giảm" {...form.register("discountType")}>
            <option value="0">Phần trăm</option>
            <option value="1">Số tiền cố định</option>
          </Select>
          <Input label="Giá trị" type="number" {...form.register("discountValue")} />
          <Input label="Đơn tối thiểu" type="number" {...form.register("minOrderAmount")} />
          <Input label="Bắt đầu" type="datetime-local" {...form.register("startDate")} />
          <Input label="Kết thúc" type="datetime-local" {...form.register("endDate")} />
          <Input label="Giới hạn dùng" type="number" {...form.register("usageLimit")} />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit">{editCouponId ? "Lưu" : "Tạo mã"}</Button>
            {editCouponId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditCouponId(null);
                  setShowForm(false);
                  form.reset({
                    discountType: "0",
                    startDate: new Date().toISOString().slice(0, 16),
                    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
                  });
                }}
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm</th>
              <th className="px-4 py-3">Đã dùng</th>
              <th className="px-4 py-3">Hiệu lực</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType} — {c.discountValue}
                </td>
                <td className="px-4 py-3">
                  {c.usedCount}
                  {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(c.startDate)} — {formatDate(c.endDate)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.isActive ? "success" : "default"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.reset({
                          code: c.code,
                          description: c.description ?? "",
                          discountType: String(c.discountType) as "0" | "1",
                          discountValue: c.discountValue,
                          minOrderAmount: c.minOrderAmount,
                          startDate: new Date(c.startDate).toISOString().slice(0, 16),
                          endDate: new Date(c.endDate).toISOString().slice(0, 16),
                          usageLimit: c.usageLimit,
                        });
                        setEditCouponId(c.id);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteCouponId(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!deleteCouponId}
        title="Xóa mã giảm giá?"
        message="Không thể hoàn tác hành động này."
        onConfirm={handleDelete}
        onCancel={() => setDeleteCouponId(null)}
      />
    </div>
  );
}
