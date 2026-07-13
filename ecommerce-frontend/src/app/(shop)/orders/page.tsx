"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import type { OrderListItem } from "@/types";
import type { PagedResult } from "@/types/api";
import { formatCurrency, formatDate, translateOrderStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderCardSkeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [data, setData] = useState<PagedResult<OrderListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersApi.getMyOrders({ pageNumber: page, pageSize: 10 });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 h-8 w-48 shimmer rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Chưa có đơn hàng nào"
          description="Bắt đầu mua sắm ngay để xem lịch sử đơn hàng tại đây."
          actionLabel="Mua sắm ngay"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Đơn hàng của tôi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tổng cộng {data.totalItems} đơn hàng
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {data.items.map((order, i) => {
          const status = translateOrderStatus(order.status);
          return (
            <li key={order.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
              <Link
                href={`/orders/${order.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 dark:hover:border-indigo-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {order.orderCode}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {order.itemCount} sản phẩm
                  </span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(order.finalAmount)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {data.totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
