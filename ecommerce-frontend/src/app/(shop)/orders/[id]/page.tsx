"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api/orders";
import type { OrderDetail } from "@/types";
import { formatCurrency, formatDate, resolveMediaUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setOrder(await ordersApi.getMyOrder(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const cancel = async () => {
    try {
      await ordersApi.cancel(id);
      toast.success("Đã hủy đơn");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể hủy");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message={error ?? "Không tìm thấy"} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderCode}</h1>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 text-sm">
        <p>
          <span className="text-slate-500">Địa chỉ: </span>
          {order.shippingAddress}
        </p>
        <p className="mt-1">
          <span className="text-slate-500">Thanh toán: </span>
          {order.paymentStatus}
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-3 rounded-lg border p-3">
            <div className="relative h-16 w-16 rounded bg-slate-100">
              <Image
                src={resolveMediaUrl(item.productImageUrl)}
                alt={item.productName}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-slate-500">x{item.quantity}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.subTotal)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border bg-slate-50 p-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí ship</span>
          <span>{formatCurrency(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Giảm giá</span>
            <span>-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 text-lg font-bold">
          <span>Tổng</span>
          <span className="text-indigo-600">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>

      {order.status === "Pending" && (
        <Button variant="outline" className="mt-4" onClick={cancel}>
          Hủy đơn
        </Button>
      )}
    </div>
  );
}
