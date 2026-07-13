"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { ProductListItem } from "@/types";
import {
  formatCurrency,
  getDiscountPercent,
  getEffectivePrice,
  resolveMediaUrl,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { wishlistApi } from "@/lib/api/wishlist";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ProductListItem }) {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const price = getEffectivePrice(product.price, product.discountPrice);
  const discountPct = getDiscountPercent(product.price, product.discountPrice);
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const addWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }
    try {
      await wishlistApi.add(product.id);
      setWishlisted(true);
      toast.success("Đã thêm vào danh sách yêu thích! ❤️");
    } catch {
      toast.error("Không thể thêm vào yêu thích. Vui lòng thử lại.");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (product.stockQuantity <= 0) return;
    setAddingCart(true);
    try {
      await addItem(product.id, 1);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`);
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setAddingCart(false);
    }
  };

  const outOfStock = product.stockQuantity <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="product-card group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 animate-fade-in"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Image
          src={resolveMediaUrl(product.primaryImageUrl)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge variant="warning" className="shadow-sm">⚡ Nổi bật</Badge>
          )}
          {discountPct > 0 && (
            <Badge variant="danger" className="shadow-sm">-{discountPct}%</Badge>
          )}
          {outOfStock && (
            <Badge variant="default" className="shadow-sm">Hết hàng</Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          {user && (
            <button
              type="button"
              onClick={addWishlist}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200
                ${wishlisted
                  ? "bg-red-500 text-white scale-110"
                  : "bg-white/95 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:scale-110"
                }`}
              aria-label="Thêm yêu thích"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          )}
          {!outOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingCart}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md
                opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-200 hover:bg-indigo-700 hover:scale-110 disabled:opacity-50"
              aria-label="Thêm vào giỏ"
            >
              {addingCart
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <ShoppingCart className="h-4 w-4" />
              }
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">
          {product.categoryName}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {(product as any).averageRating != null && (product as any).averageRating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              ★ {(product as any).averageRating.toFixed(1)}
            </span>
            {(product as any).reviewCount != null && (
              <span className="text-xs text-slate-400">({(product as any).reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
