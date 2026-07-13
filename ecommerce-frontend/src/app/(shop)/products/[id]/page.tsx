"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Share2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { reviewsApi } from "@/lib/api/reviews";
import { ordersApi } from "@/lib/api/orders";
import { wishlistApi } from "@/lib/api/wishlist";
import type { ProductDetail, Review } from "@/types";
import {
  formatCurrency,
  formatDate,
  getDiscountPercent,
  getEffectivePrice,
  getErrorMessage,
  resolveMediaUrl,
} from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Interactive star rating component */
function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const sz = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`transition-all duration-100 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
            aria-label={`${star} sao`}
          >
            <Star
              className={`${sz} transition-colors ${
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrders, setReviewOrders] = useState<{ id: string; label: string }[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        productsApi.getById(id),
        reviewsApi.getByProduct(id, { pageNumber: 1, pageSize: 20 }),
      ]);
      setProduct(p);
      setReviews(r.items);
    } catch (e) {
      setError(getErrorMessage(e, "Không thể tải sản phẩm. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviewOrders = useCallback(async () => {
    if (!user) return;
    setReviewLoading(true);
    try {
      const orderPage = await ordersApi.getMyOrders({ pageNumber: 1, pageSize: 20 });
      const details = await Promise.all(
        orderPage.items.map((order) => ordersApi.getMyOrder(order.id)),
      );
      const matched = details
        .filter((o) => o.items.some((item) => item.productId === id))
        .map((o) => ({
          id: o.id,
          label: `${o.orderCode} • ${formatDate(o.createdAt)}`,
        }));
      setReviewOrders(matched);
      if (matched.length === 1) setReviewOrderId(matched[0].id);
    } catch (e) {
      console.error("Lỗi tải đơn hàng:", e);
    } finally {
      setReviewLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
    loadReviewOrders();
  }, [load, loadReviewOrders]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      router.push("/login");
      return;
    }
    const qtyInt = Math.max(1, Number(qty) || 1);
    try {
      await addItem(id, qtyInt);
      toast.success(`Đã thêm ${qtyInt} sản phẩm vào giỏ hàng! 🛒`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể thêm vào giỏ hàng. Vui lòng thử lại."));
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }
    try {
      await wishlistApi.add(id);
      setWishlisted(true);
      toast.success("Đã thêm vào danh sách yêu thích! ❤️");
    } catch {
      toast.error("Không thể thêm vào yêu thích. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductCardSkeleton />
          <div className="space-y-4">
            <div className="h-6 w-1/3 shimmer rounded-full" />
            <div className="h-10 w-3/4 shimmer rounded-xl" />
            <div className="h-8 w-1/3 shimmer rounded-xl" />
            <div className="h-24 w-full shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message={error ?? "Không tìm thấy sản phẩm"} onRetry={load} />
      </div>
    );
  }

  const price = getEffectivePrice(product.price, product.discountPrice);
  const discountPct = getDiscountPercent(product.price, product.discountPrice);
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  // Build image list
  const images: string[] = [];
  if (product.images?.length) {
    product.images.forEach((img) => images.push(resolveMediaUrl(img.imageUrl)));
  } else {
    images.push(resolveMediaUrl(product.primaryImageUrl));
  }
  const mainImg = images[activeImg] ?? images[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      {/* Main grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* ── Image Gallery ─────────────────────────────── */}
        <div className="space-y-3">
          <div className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
            <Image
              src={mainImg}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            {discountPct > 0 && (
              <div className="absolute left-4 top-4">
                <Badge variant="danger" className="text-sm px-3 py-1">-{discountPct}%</Badge>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImg((v) => (v - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-all hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((v) => (v + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-all hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-slate-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImg === i
                      ? "border-indigo-500 scale-105 shadow-md"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <Image src={img} alt={`Ảnh ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ───────────────────────────────── */}
        <div className="flex flex-col animate-slide-up">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            {product.brandName} · {product.categoryName}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.averageRating != null && (
            <div className="mt-3 flex items-center gap-3">
              <StarRating value={Math.round(product.averageRating)} readonly size="md" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="danger">Tiết kiệm {formatCurrency(product.price - price)}</Badge>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            {product.description}
          </p>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>SKU: <span className="font-medium text-slate-700 dark:text-slate-300">{product.sku}</span></span>
            <span>·</span>
            <span>
              Kho:{" "}
              <span className={`font-semibold ${product.stockQuantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : "Hết hàng"}
              </span>
            </span>
          </div>

          {/* Quantity + Add to cart */}
          {product.stockQuantity > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng</label>
                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.min(product.stockQuantity, v + 1))}
                    disabled={qty >= product.stockQuantity}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlist}
                  className={wishlisted ? "border-red-300 text-red-500 bg-red-50" : ""}
                  aria-label="Yêu thích"
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Đã sao chép link sản phẩm!");
                  }}
                  aria-label="Chia sẻ"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: "Giao nhanh 2–5 ngày" },
              { icon: Shield, text: "Bảo hành chính hãng" },
              { icon: Package, text: "Đổi trả 30 ngày" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <Icon className="h-5 w-5 text-indigo-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────── */}
      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        {/* Write review */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Viết đánh giá</h2>

          {!user ? (
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Vui lòng{" "}
                <a href="/login" className="font-semibold text-indigo-600 hover:underline">đăng nhập</a>
                {" "}để gửi đánh giá.
              </p>
            </div>
          ) : reviewLoading ? (
            <div className="mt-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              Đang kiểm tra đơn hàng...
            </div>
          ) : reviewOrders.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Bạn cần mua sản phẩm này trước khi đánh giá. Hãy đặt hàng và nhận hàng xong nhé!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Đơn hàng</label>
                <Select
                  value={reviewOrderId}
                  onChange={(e) => setReviewOrderId(e.target.value)}
                >
                  <option value="">Chọn đơn hàng</option>
                  {reviewOrders.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Đánh giá</label>
                <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
              </div>
              <Textarea
                label="Nhận xét của bạn"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                rows={4}
              />
              <Button
                onClick={async () => {
                  if (!reviewOrderId) {
                    toast.error("Vui lòng chọn đơn hàng để đánh giá.");
                    return;
                  }
                  setReviewSubmitting(true);
                  try {
                    await reviewsApi.create({
                      productId: id,
                      orderId: reviewOrderId,
                      rating: reviewRating,
                      comment: reviewComment.trim() || undefined,
                    });
                    toast.success("Cảm ơn bạn đã đánh giá sản phẩm! 🎉");
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewOrderId("");
                    await load();
                  } catch (e) {
                    toast.error(getErrorMessage(e, "Không thể gửi đánh giá. Vui lòng thử lại."));
                  } finally {
                    setReviewSubmitting(false);
                  }
                }}
                isLoading={reviewSubmitting}
                className="w-full"
              >
                Gửi đánh giá
              </Button>
            </div>
          )}
        </div>

        {/* Review list */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 p-6 animate-slide-up delay-200">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Đánh giá ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
              <Star className="h-10 w-10 text-slate-200 dark:text-slate-700" />
              <p className="text-slate-500 dark:text-slate-400">Chưa có đánh giá nào.</p>
              <p className="text-xs text-slate-400">Hãy là người đầu tiên nhận xét!</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {reviews.map((r, i) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                        {r.userName?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.userName}</p>
                        <StarRating value={r.rating} readonly size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-slate-400">Đã mua</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-11">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
