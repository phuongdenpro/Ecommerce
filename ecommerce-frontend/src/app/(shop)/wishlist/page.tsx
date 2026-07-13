"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { wishlistApi } from "@/lib/api/wishlist";
import { useCartStore } from "@/store/cart-store";
import type { WishlistItem } from "@/types";
import { formatCurrency, getEffectivePrice, getDiscountPercent, resolveMediaUrl } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await wishlistApi.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async () => {
    if (!removeId) return;
    try {
      await wishlistApi.remove(removeId);
      toast.success("Đã xóa khỏi danh sách yêu thích.");
      load();
    } catch {
      toast.error("Không thể xóa. Vui lòng thử lại.");
    } finally {
      setRemoveId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingId(item.productId);
    try {
      await addItem(item.productId, 1);
      toast.success(`Đã thêm "${item.productName}" vào giỏ hàng! 🛒`);
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setAddingId(null);
    }
  };

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

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Chưa có sản phẩm yêu thích"
          description="Hãy thêm những sản phẩm bạn thích để lưu lại xem sau."
          actionLabel="Khám phá sản phẩm"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500">
          <Heart className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Yêu thích</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} sản phẩm</p>
        </div>
      </div>

      <ul className="space-y-4">
        {items.map((item, i) => {
          const price = getEffectivePrice(item.price, item.discountPrice);
          const pct = getDiscountPercent(item.price, item.discountPrice);
          return (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-4 hover:shadow-md transition-all animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <Link href={`/products/${item.productId}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                <Image
                  src={resolveMediaUrl(item.primaryImageUrl)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
                {pct > 0 && (
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="danger" className="text-[10px] px-1.5 py-0">-{pct}%</Badge>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                >
                  {item.productName}
                </Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(price)}
                  </span>
                  {pct > 0 && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={addingId === item.productId}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {addingId === item.productId
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <ShoppingCart className="h-3.5 w-3.5" />
                    }
                    Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveId(item.productId)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={!!removeId}
        title="Xóa khỏi yêu thích?"
        message="Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?"
        onConfirm={remove}
        onCancel={() => setRemoveId(null)}
      />
    </div>
  );
}
