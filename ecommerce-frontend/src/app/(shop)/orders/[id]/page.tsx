"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import type { OrderDetail } from "@/types";
import {
  formatCurrency,
  formatDate,
  resolveMediaUrl,
  translateOrderStatus,
  translatePaymentStatus,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending:    <Clock className="h-5 w-5" />,
  Processing: <AlertCircle className="h-5 w-5" />,
  Shipped:    <Truck className="h-5 w-5" />,
  Delivered:  <CheckCircle2 className="h-5 w-5" />,
  Cancelled:  <XCircle className="h-5 w-5" />,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOrder(await ordersApi.getMyOrder(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      toast.success("Đã hủy đơn hàng thành công.");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.");
    } finally {
      setCancelling(false);
      setCancelOpen(false);
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
        <ErrorState message={error ?? "Không tìm thấy đơn hàng"} onRetry={load} />
      </div>
    );
  }

  const status = translateOrderStatus(order.status);
  const StatusIcon = STATUS_ICONS[order.status] ?? <Package className="h-5 w-5" />;

  // Timeline steps
  const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách đơn hàng
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{order.orderCode}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1">
          {StatusIcon}
          <span className="ml-1">{status.label}</span>
        </Badge>
      </div>

      {/* Status Timeline */}
      {order.status !== "Cancelled" && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-6 animate-slide-up">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Trạng thái đơn hàng</h2>
          <div className="relative flex items-center justify-between">
            {/* Progress bar */}
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${currentStep < 0 ? 0 : (currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, i) => {
              const s = translateOrderStatus(step);
              const done = i <= currentStep;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                    done
                      ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                  </div>
                  <span className={`text-[10px] font-semibold text-center ${done ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping & Payment info */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <MapPin className="h-4 w-4 text-indigo-500" /> Địa chỉ giao hàng
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{order.shippingAddress}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <CreditCard className="h-4 w-4 text-indigo-500" /> Thanh toán
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {translatePaymentStatus(order.paymentStatus)}
          </p>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 mb-6">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sản phẩm ({order.items.length})
          </h2>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <Link href={`/products/${item.productId}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                <Image
                  src={resolveMediaUrl(item.productImageUrl)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 items-center justify-between gap-2">
                <div>
                  <Link href={`/products/${item.productId}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {item.productName}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">Số lượng: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  {formatCurrency(item.subTotal)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-5 space-y-2.5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Tóm tắt đơn hàng</h2>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Tạm tính</span>
          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Phí giao hàng</span>
          <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá</span>
            <span className="font-semibold">-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-3 text-lg font-extrabold">
          <span className="text-slate-900 dark:text-slate-100">Tổng thanh toán</span>
          <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 flex-wrap">
        {order.status === "Pending" && (
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={() => setCancelOpen(true)}
          >
            <XCircle className="h-4 w-4" />
            Hủy đơn hàng
          </Button>
        )}
        <Link href="/products">
          <Button variant="outline">
            <Package className="h-4 w-4" />
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Hủy đơn hàng?"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
        isLoading={cancelling}
      />
    </div>
  );
}
