"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield } from "lucide-react";
import { productsApi } from "@/lib/api/products";
import type { ProductListItem } from "@/types";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.getProducts({
        pageNumber: 1,
        pageSize: 8,
        isFeatured: true,
      });
      setFeatured(result.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Mùa mua sắm mới
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Mua sắm thông minh, giao nhanh tận tay
            </h1>
            <p className="mt-4 text-lg text-indigo-100">
              Hàng ngàn sản phẩm chính hãng — thanh toán an toàn, hỗ trợ 24/7.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Truck, title: "Giao hàng nhanh", desc: "Toàn quốc 2–5 ngày" },
            { icon: Shield, title: "Bảo hành chính hãng", desc: "Cam kết 100% authentic" },
            { icon: Sparkles, title: "Ưu đãi hấp dẫn", desc: "Mã WELCOME10 cho đơn đầu" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sản phẩm nổi bật</h2>
            <p className="mt-1 text-slate-500">Được yêu thích nhất tuần này</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}

        {!error && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!loading && !error && featured.length === 0 && (
          <p className="text-center text-slate-500">Chưa có sản phẩm nổi bật.</p>
        )}
      </section>
    </>
  );
}
