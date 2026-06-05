"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await categoriesApi.getAll(true));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (data: z.infer<typeof schema>) => {
    try {
      if (editCategoryId) {
        await categoriesApi.update(editCategoryId, data);
        toast.success("Đã cập nhật danh mục");
      } else {
        await categoriesApi.create(data);
        toast.success("Đã tạo danh mục");
      }
      form.reset({ name: "", description: "", isActive: true });
      setShowForm(false);
      setEditCategoryId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoriesApi.delete(deleteId);
      toast.success("Đã xóa");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setDeleteId(null);
    }
  };

  const renderTree = (items: Category[], depth = 0) =>
    items.map((c) => (
      <div key={c.id}>
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ paddingLeft: 16 + depth * 20 }}
        >
          <span className="font-medium">{c.name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                form.reset({
                  name: c.name,
                  description: c.description ?? "",
                  isActive: c.isActive ?? true,
                });
                setEditCategoryId(c.id);
                setShowForm(true);
              }}
            >
              <Pencil className="h-4 w-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        {c.children?.length > 0 && renderTree(c.children, depth + 1)}
      </div>
    ));

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
        <h2 className="text-2xl font-bold">Danh mục</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

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
            <Button type="submit">{editCategoryId ? "Lưu" : "Tạo"}</Button>
            {editCategoryId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditCategoryId(null);
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

      <div className="rounded-xl border bg-white">{renderTree(categories)}</div>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa danh mục?"
        message="Danh mục con có thể bị ảnh hưởng."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
