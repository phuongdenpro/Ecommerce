"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
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
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
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
          title="Giỏ hàng đang trống"
          description="Hãy thêm những sản phẩm bạn yêu thích vào giỏ hàng."
          actionLabel="Mua sắm ngay"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Giỏ hàng</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{cart.totalItems} sản phẩm</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item, i) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-4 transition-all hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <Link href={`/products/${item.productId}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                <Image
                  src={resolveMediaUrl(item.productImageUrl)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                >
                  {item.productName}
                </Link>
                <p className="mt-0.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(item.unitPrice)}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  {/* Quantity control */}
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                      disabled={item.quantity <= 1}
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.subTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRemoveId(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-6 lg:sticky lg:top-24 animate-slide-up delay-200">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tạm tính ({cart.totalItems} sản phẩm)</span>
              <span className="font-semibold">{formatCurrency(cart.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phí giao hàng</span>
              <span className="font-semibold text-emerald-600">Tính khi thanh toán</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-slate-200 dark:border-slate-600 pt-4 text-lg font-extrabold">
            <span>Tổng tạm tính</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(cart.subTotal)}</span>
          </div>
          <Link href="/checkout" className="mt-5 block">
            <Button className="w-full" size="lg">
              Tiến hành thanh toán
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="mt-3 block">
            <Button variant="ghost" className="w-full text-slate-500 dark:text-slate-400">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={!!removeId}
        title="Xóa sản phẩm?"
        message="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveId(null)}
        isLoading={removing}
      />
    </div>
  );
}
