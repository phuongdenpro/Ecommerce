"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductListItem } from "@/types";
import { formatCurrency, getEffectivePrice, resolveMediaUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { wishlistApi } from "@/lib/api/wishlist";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ProductListItem }) {
  const user = useAuthStore((s) => s.user);
  const price = getEffectivePrice(product.price, product.discountPrice);
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;

  const addWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    try {
      await wishlistApi.add(product.id);
      toast.success("Đã thêm vào yêu thích");
    } catch {
      toast.error("Không thể thêm yêu thích");
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={resolveMediaUrl(product.primaryImageUrl)}
          alt={product.name}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isFeatured && (
          <Badge className="absolute left-2 top-2" variant="warning">
            Nổi bật
          </Badge>
        )}
        {user && (
          <button
            type="button"
            onClick={addWishlist}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Yêu thích"
          >
            <Heart className="h-4 w-4 text-slate-600" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-500">{product.categoryName}</p>
        <h3 className="mt-1 line-clamp-2 font-medium text-slate-900 group-hover:text-indigo-600">
          {product.name}
        </h3>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-indigo-600">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          {product.stockQuantity <= 0 && (
            <p className="mt-1 text-xs text-red-500">Hết hàng</p>
          )}
        </div>
      </div>
    </Link>
  );
}
