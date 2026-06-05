"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { productsApi } from "@/lib/api/products";
import { reviewsApi } from "@/lib/api/reviews";
import { ordersApi } from "@/lib/api/orders";
import type { ProductDetail, Review } from "@/types";
import {
  formatCurrency,
  formatDate,
  getEffectivePrice,
  getErrorMessage,
  resolveMediaUrl,
} from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrders, setReviewOrders] = useState<{
    id: string;
    label: string;
  }[]>([]);
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
        reviewsApi.getByProduct(id, { pageNumber: 1, pageSize: 10 }),
      ]);
      setProduct(p);
      setReviews(r.items);
    } catch (e) {
      setError(getErrorMessage(e, "Lỗi tải sản phẩm"));
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
      const matchedOrders = details
        .filter((order) => order.items.some((item) => item.productId === id))
        .map((order) => ({
          id: order.id,
          label: `${order.orderCode} • ${formatDate(order.createdAt)}`,
        }));
      setReviewOrders(matchedOrders);
      if (matchedOrders.length === 1) {
        setReviewOrderId(matchedOrders[0].id);
      }
    } catch (e) {
      console.error("Failed loading review orders", e);
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
    if (qtyInt <= 0) {
      toast.error("Số lượng không hợp lệ");
      setQty(1);
      return;
    }
    try {
      await addItem(id, qtyInt);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể thêm giỏ hàng"));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductCardSkeleton />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
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
  const imageUrl =
    product.images[0]?.imageUrl ?? product.primaryImageUrl;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={resolveMediaUrl(imageUrl)}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-sm text-slate-500">
            {product.brandName} · {product.categoryName}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          {product.averageRating != null && (
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-slate-700">
                {product.averageRating.toFixed(1)} ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}
          <p className="mt-4 text-3xl font-bold text-indigo-600">{formatCurrency(price)}</p>
          <p className="mt-4 text-slate-600">{product.description}</p>
          <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
          <p className="text-sm text-slate-500">
            Còn {product.stockQuantity} sản phẩm
          </p>

          <div className="mt-6 flex items-center gap-4">
            <label className="text-sm font-medium">Số lượng</label>
            <input
              type="number"
              min={1}
              max={product.stockQuantity}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <Button
            className="mt-6 w-full sm:w-auto"
            size="lg"
            disabled={product.stockQuantity <= 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      <section className="mt-16 space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
          {!user ? (
            <p className="mt-4 text-slate-500">Vui lòng đăng nhập để gửi đánh giá.</p>
          ) : reviewLoading ? (
            <p className="mt-4 text-slate-500">Đang kiểm tra đơn hàng...</p>
          ) : reviewOrders.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Bạn cần mua sản phẩm này trước khi gửi đánh giá. Vui lòng kiểm tra lại đơn hàng của bạn.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Đơn hàng</label>
                <Select
                  className="mt-1"
                  value={reviewOrderId}
                  onChange={(e) => setReviewOrderId(e.target.value)}
                >
                  <option value="">Chọn đơn hàng</option>
                  {reviewOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Số sao</label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                        reviewRating === star
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                label="Nội dung đánh giá"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
              />
              <Button
                onClick={async () => {
                  if (!reviewOrderId) {
                    toast.error("Vui lòng chọn đơn hàng để đánh giá.");
                    return;
                  }
                  if (reviewRating < 1 || reviewRating > 5) {
                    toast.error("Vui lòng chọn số sao hợp lệ.");
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
                    toast.success("Đã gửi đánh giá");
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewOrderId("");
                    await load();
                  } catch (e) {
                    toast.error(getErrorMessage(e, "Không thể gửi đánh giá"));
                  } finally {
                    setReviewSubmitting(false);
                  }
                }}
                isLoading={reviewSubmitting}
              >
                Gửi đánh giá
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">Đánh giá</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-slate-500">Chưa có đánh giá.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.userName}</span>
                    <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
