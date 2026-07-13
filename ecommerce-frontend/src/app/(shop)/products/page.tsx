"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}

const SORT_OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
  { value: "name_asc", label: "Tên: A → Z" },
  { value: "name_desc", label: "Tên: Z → A" },
  { value: "newest", label: "Mới nhất" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<PagedResult<ProductListItem> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") ?? "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse sort
      const sortMap: Record<string, { sortBy?: string; sortDesc?: boolean }> = {
        price_asc:  { sortBy: "price",  sortDesc: false },
        price_desc: { sortBy: "price",  sortDesc: true  },
        name_asc:   { sortBy: "name",   sortDesc: false },
        name_desc:  { sortBy: "name",   sortDesc: true  },
        newest:     { sortBy: "createdAt", sortDesc: true },
        rating:     { sortBy: "rating", sortDesc: true  },
      };
      const sortOpts = sortMap[sortBy] ?? {};
      const result = await productsApi.getProducts({
        pageNumber: page,
        pageSize: 12,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        ...sortOpts,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, sortBy]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
    brandsApi.getAll().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, brandId, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);

  const hasFilters = !!(categoryId || brandId || sortBy);

  const resetFilters = () => {
    setCategoryId("");
    setBrandId("");
    setSortBy("");
    router.push("/products");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {search ? (
            <>
              Kết quả cho{" "}
              <span className="text-indigo-600 dark:text-indigo-400">&ldquo;{search}&rdquo;</span>
            </>
          ) : (
            "Tất cả sản phẩm"
          )}
        </h1>
        {data && !loading && (
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Tìm thấy <span className="font-semibold text-slate-700 dark:text-slate-300">{data.totalItems}</span> sản phẩm
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60 animate-fade-in">
        {/* Toggle on mobile */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Lọc & Sắp xếp
          {hasFilters && (
            <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">Đang lọc</span>
          )}
        </button>

        <div className={`${filtersOpen ? "mt-4" : "hidden"} sm:mt-0 sm:block`}>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Danh mục"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full sm:w-44"
            >
              <option value="">Tất cả danh mục</option>
              {flatCategories(categories).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Select
              label="Thương hiệu"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full sm:w-44"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>

            <Select
              label="Sắp xếp"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-52"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : data?.items.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
                    <ProductCard product={p} />
                  </div>
                ))}
          </div>

          {!loading && data?.items.length === 0 && (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
              actionLabel="Xóa bộ lọc"
              onAction={resetFilters}
            />
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-12">
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
