"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { brandsApi } from "@/lib/api/brands";
import type { Brand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editBrandId, setEditBrandId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const load = () =>
    brandsApi
      .getAll(true)
      .then(setBrands)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (data: z.infer<typeof schema>) => {
    try {
      if (editBrandId) {
        await brandsApi.update(editBrandId, data);
        toast.success("Đã cập nhật thương hiệu");
      } else {
        await brandsApi.create(data);
        toast.success("Đã tạo thương hiệu");
      }
      form.reset({ name: "", description: "", isActive: true });
      setShowForm(false);
      setEditBrandId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await brandsApi.delete(deleteId);
      toast.success("Đã xóa");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setDeleteId(null);
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
        <h2 className="text-2xl font-bold">Thương hiệu</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={form.handleSubmit(onCreate)}
          className="rounded-xl border bg-white p-4 space-y-3"
        >
          <Input label="Tên" {...form.register("name")} />
          <Input label="Mô tả" {...form.register("description")} />
          <label className="flex gap-2 text-sm">
            <input type="checkbox" {...form.register("isActive")} />
            Kích hoạt
          </label>
          <div className="flex gap-2">
            <Button type="submit">{editBrandId ? "Lưu" : "Tạo"}</Button>
            {editBrandId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditBrandId(null);
                  setShowForm(false);
                  form.reset({ name: "", description: "", isActive: true });
                }}
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white divide-y">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{b.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.reset({ name: b.name, description: b.description ?? "", isActive: b.isActive ?? true });
                  setEditBrandId(b.id);
                  setShowForm(true);
                }}
              >
                <Pencil className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(b.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa thương hiệu?"
        message="Không thể xóa nếu còn sản phẩm liên kết."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
