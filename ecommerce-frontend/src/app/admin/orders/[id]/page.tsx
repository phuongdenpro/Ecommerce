"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { adminOrderService } from "@/features/admin/services";
import type { OrderDetail } from "@/types";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/admin/components/admin-status-badge";
import { MoneyText } from "@/features/admin/components/money-text";
import { formatDate, resolveMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { AdminErrorState } from "@/features/admin/components/admin-error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipping", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOrder(await adminOrderService.getById(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const printInvoice = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return <AdminErrorState message={error ?? "Không tìm thấy"} onRetry={load} />;
  }

  return (
    <div className="space-y-6 print:p-8">
      <AdminPageHeader
        title={`Đơn ${order.orderCode}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Đơn hàng", href: "/admin/orders" },
          { label: order.orderCode },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={printInvoice}>
              In hóa đơn
            </Button>
            {order.status !== "Cancelled" && order.status !== "Delivered" && (
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                Hủy đơn
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border bg-white p-6 lg:col-span-1">
          <div className="flex gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
          <p className="text-sm">
            <span className="text-slate-500">Địa chỉ: </span>
            {order.shippingAddress}
          </p>
          {order.note && <p className="text-sm text-slate-600">Ghi chú: {order.note}</p>}
          <div className="border-t pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <MoneyText amount={order.totalAmount} />
            </div>
            <div className="flex justify-between">
              <span>Ship</span>
              <MoneyText amount={order.shippingFee} />
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm</span>
                <span>-<MoneyText amount={order.discountAmount} /></span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng</span>
              <MoneyText amount={order.finalAmount} className="text-indigo-600" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Cập nhật trạng thái</label>
            <Select
              className="mt-1"
              value={order.status}
              onChange={async (e) => {
                try {
                  await adminOrderService.updateStatus(id, e.target.value);
                  toast.success("Đã cập nhật");
                  load();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Lỗi");
                }
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Trạng thái thanh toán</label>
            <Select
              className="mt-1"
              value={order.paymentStatus}
              onChange={async (e) => {
                try {
                  await adminOrderService.updatePaymentStatus(id, e.target.value);
                  toast.success("Đã cập nhật thanh toán");
                  load();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Lỗi");
                }
              }}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <h3 className="font-semibold">Sản phẩm</h3>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 border-b pb-3 last:border-0">
                <div className="relative h-14 w-14 rounded bg-slate-100">
                  <Image
                    src={resolveMediaUrl(item.productImageUrl)}
                    alt=""
                    fill
                    className="rounded object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-slate-500">x{item.quantity}</p>
                </div>
                <MoneyText amount={item.subTotal} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Hủy đơn hàng?"
        message="Hoàn lại tồn kho sản phẩm."
        onConfirm={async () => {
          try {
            await adminOrderService.adminCancel(id);
            toast.success("Đã hủy");
            load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Lỗi");
          } finally {
            setConfirmCancel(false);
          }
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
