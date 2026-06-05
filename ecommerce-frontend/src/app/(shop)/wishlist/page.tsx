"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { wishlistApi } from "@/lib/api/wishlist";
import type { WishlistItem } from "@/types";
import { formatCurrency, getEffectivePrice, resolveMediaUrl } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await wishlistApi.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
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
      toast.success("Đã xóa");
      load();
    } catch {
      toast.error("Không thể xóa");
    } finally {
      setRemoveId(null);
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
          title="Danh sách yêu thích trống"
          description="Lưu sản phẩm bạn thích để xem sau."
          actionLabel="Khám phá"
          onAction={() => (window.location.href = "/products")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Heart className="h-6 w-6 text-red-500" />
        Yêu thích
      </h1>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-4 rounded-xl border bg-white p-4"
          >
            <div className="relative h-20 w-20 shrink-0 rounded-lg bg-slate-100">
              <Image
                src={resolveMediaUrl(item.primaryImageUrl)}
                alt={item.productName}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <Link
                href={`/products/${item.productId}`}
                className="font-medium hover:text-indigo-600"
              >
                {item.productName}
              </Link>
              <p className="text-indigo-600 font-semibold">
                {formatCurrency(getEffectivePrice(item.price, item.discountPrice))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRemoveId(item.productId)}
              className="text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!removeId}
        title="Xóa khỏi yêu thích?"
        message="Bạn có chắc muốn xóa sản phẩm này?"
        onConfirm={remove}
        onCancel={() => setRemoveId(null)}
      />
    </div>
  );
}
