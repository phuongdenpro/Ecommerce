"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, resolveMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

export default function CartPage() {
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const confirmRemove = async () => {
    if (!removeId) return;
    setRemoving(true);
    try {
      await removeItem(removeId);
      toast.success("Đã xóa sản phẩm");
    } catch {
      toast.error("Không thể xóa");
    } finally {
      setRemoving(false);
      setRemoveId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Giỏ hàng trống"
          description="Hãy thêm sản phẩm yêu thích vào giỏ."
          actionLabel="Mua sắm ngay"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Giỏ hàng ({cart.totalItems})</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={resolveMediaUrl(item.productImageUrl)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium hover:text-indigo-600"
                >
                  {item.productName}
                </Link>
                <p className="text-indigo-600 font-semibold">
                  {formatCurrency(item.unitPrice)}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border p-1 hover:bg-slate-50"
                      onClick={() =>
                        updateItem(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded border p-1 hover:bg-slate-50"
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveId(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="font-semibold">{formatCurrency(item.subTotal)}</p>
            </div>
          ))}
        </div>
        <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Tóm tắt</h2>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Tạm tính</span>
            <span>{formatCurrency(cart.subTotal)}</span>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full" size="lg">
              Thanh toán
            </Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={!!removeId}
        title="Xóa sản phẩm?"
        message="Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveId(null)}
        isLoading={removing}
      />
    </div>
  );
}
