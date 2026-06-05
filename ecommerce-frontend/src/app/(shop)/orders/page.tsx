"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api/orders";
import type { OrderListItem } from "@/types";
import type { PagedResult } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

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
      setError(e instanceof Error ? e.message : "Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
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
          title="Chưa có đơn hàng"
          description="Hãy mua sắm và đặt hàng đầu tiên."
          actionLabel="Mua sắm"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <ul className="mt-6 space-y-4">
        {data.items.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{order.orderCode}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <Badge>{order.status}</Badge>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>{order.itemCount} sản phẩm</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {data.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
