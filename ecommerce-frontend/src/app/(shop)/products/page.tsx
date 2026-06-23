"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { brandsApi } from "@/lib/api/brands";
import type { ProductListItem, Category, Brand } from "@/types";
import type { PagedResult } from "@/types/api";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PagedResult<ProductListItem> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const search = searchParams.get("search") ?? "";

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
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId]);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
    brandsApi
      .getAll()
      .then(setBrands)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, brandId]);

  useEffect(() => {
    load();
  }, [load]);

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {search ? `Kết quả: "${search}"` : "Tất cả sản phẩm"}
      </h1>

      <div className="mt-6 flex flex-wrap gap-4">
        <Select
          label="Danh mục"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-48"
        >
          <option value="">Tất cả</option>
          {flatCategories(categories).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Thương hiệu"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-48"
        >
          <option value="">Tất cả</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mt-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {!error && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {!loading && data?.items.length === 0 && (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              actionLabel="Xem tất cả"
              onAction={() => {
                setCategoryId("");
                setBrandId("");
                window.location.href = "/products";
              }}
            />
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                pageNumber={data.pageNumber}
                totalPages={data.totalPages}
                totalItems={data.totalItems}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
