"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield, Tag, ChevronRight, Star } from "lucide-react";
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
      setError(e instanceof Error ? e.message : "Không thể tải sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      {/* ── Hero Section ───────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-float" />
          <div className="absolute -left-10 bottom-0 h-60 w-60 rounded-full bg-indigo-300/10 blur-3xl animate-float delay-300" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Mùa mua sắm hè 2026 — Ưu đãi lên đến 50%
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Mua sắm thông minh,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  giao nhanh
                </span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                  <path d="M1 5.5C60 2 120 6 180 3.5C220 2 260 5 299 3" stroke="rgba(251,191,36,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </span>{" "}
              tận tay
            </h1>

            <p className="mt-5 text-lg text-indigo-100 leading-relaxed">
              Hàng ngàn sản phẩm chính hãng — thanh toán an toàn, hoàn tiền 100% nếu không hài lòng, hỗ trợ 24/7.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="xl" className="bg-white !text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-indigo-900/30 font-bold">
                  Khám phá ngay
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="xl" variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
                  Đăng ký miễn phí
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { value: "10K+", label: "Sản phẩm" },
                { value: "50K+", label: "Khách hàng" },
                { value: "4.9", label: "Đánh giá", icon: <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> },
              ].map(({ value, label, icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{value}</span>
                  {icon}
                  <span className="text-sm text-indigo-200">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Badges ──────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-0 divide-x divide-slate-200 dark:divide-slate-800 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: Truck,
              title: "Giao hàng nhanh",
              desc: "Toàn quốc 2–5 ngày làm việc",
              color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
            },
            {
              icon: Shield,
              title: "Bảo hành chính hãng",
              desc: "Cam kết 100% hàng authentic",
              color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
            },
            {
              icon: Tag,
              title: "Ưu đãi hấp dẫn",
              desc: "Nhập WELCOME10 cho đơn đầu",
              color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-center gap-4 px-6 py-6 sm:py-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color} transition-transform group-hover:scale-110 duration-200`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div className="animate-slide-up">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Tuần này
            </p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Được yêu thích và mua nhiều nhất
            </p>
          </div>
          <Link
            href="/products"
            className="group hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors sm:flex"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}

        {!error && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                    <ProductCard product={p} />
                  </div>
                ))}
          </div>
        )}

        {!loading && !error && featured.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 dark:text-slate-400">Chưa có sản phẩm nổi bật.</p>
          </div>
        )}

        {/* Mobile "Xem tất cả" */}
        {!loading && !error && featured.length > 0 && (
          <div className="mt-10 flex justify-center sm:hidden">
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                Xem tất cả sản phẩm <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section className="mx-4 mb-16 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white sm:mx-6 lg:mx-8 xl:mx-auto xl:max-w-7xl">
        <div className="relative px-8 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div className="pointer-events-none absolute right-0 top-0 opacity-20">
            <div className="h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold sm:text-3xl">
              Đăng ký ngay — nhận 10% giảm giá
            </h3>
            <p className="mt-2 text-indigo-100">
              Tham gia cùng hơn 50.000 khách hàng đang mua sắm thông minh.
            </p>
          </div>
          <div className="mt-6 lg:mt-0 lg:shrink-0">
            <Link href="/register">
              <Button size="xl" className="bg-white !text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg">
                Đăng ký miễn phí
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
