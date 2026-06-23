"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { brandsApi } from "@/lib/api/brands";
import type { ProductListItem, Category, Brand } from "@/types";
import type { PagedResult } from "@/types/api";
import { formatCurrency, resolveMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminSearchInput } from "@/features/admin/components/admin-search-input";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";

export default function AdminProductsPage() {
  const [data, setData] = useState<PagedResult<ProductListItem> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([categoriesApi.getAll(true), brandsApi.getAll(true)]).then(([c, b]) => {
      setCategories(c);
      setBrands(b);
    });
  }, []);

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.getProducts({
        pageNumber: page,
        pageSize: 12,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        status: status || undefined,
        inStock: lowStock ? false : undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, status, lowStock]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteId);
      toast.success("Đã xóa sản phẩm");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sản phẩm"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Sản phẩm" }]}
        actions={
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Tên, SKU..." />
        <Select className="w-40" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
          <option value="">Danh mục</option>
          {flatCategories(categories).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select className="w-40" value={brandId} onChange={(e) => { setBrandId(e.target.value); setPage(1); }}>
          <option value="">Thương hiệu</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
        <Select className="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Trạng thái</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="OutOfStock">OutOfStock</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} />
          Sắp hết hàng
        </label>
      </AdminFilterBar>

      <AdminDataTable loading={loading} error={error} empty={!data?.items.length} onRetry={load}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Thương hiệu</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="relative h-10 w-10 rounded bg-slate-100">
                          <Image
                            src={resolveMediaUrl(p.primaryImageUrl)}
                            alt=""
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{p.categoryName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{p.brandName}</td>
                      <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                      <td className={`px-4 py-3 ${p.stockQuantity <= 10 ? "font-semibold text-red-600" : ""}`}>
                        {p.stockQuantity}
                      </td>
                      <td className="px-4 py-3">{p.status}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products/${p.id}`} target="_blank">
                            <Button variant="ghost" size="sm" title="Xem trên shop">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
        </div>
      </AdminDataTable>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa sản phẩm?"
        message="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleting}
      />
    </div>
  );
}
