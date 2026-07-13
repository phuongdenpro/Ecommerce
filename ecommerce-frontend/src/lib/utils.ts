import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApiError } from "@/lib/api-error";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  let d: Date;
  if (typeof date === "string") {
    // If server returned an ISO string without timezone (e.g. "2026-06-05T02:54:00"),
    // treat it as UTC by appending 'Z' so parsing is correct.
    const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
    const toParse = isoNoTZ.test(date) ? `${date}Z` : date;
    d = new Date(toParse);
  } else {
    d = date;
  }
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Resolve product/image URLs from the API host. */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return "/placeholder-product.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getEffectivePrice(price: number, discountPrice?: number): number {
  return discountPrice != null && discountPrice < price ? discountPrice : price;
}

export function getDiscountPercent(price: number, discountPrice?: number | null): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function isAdminRole(role?: string): boolean {
  return role === "Admin" || role === "Staff";
}

/** Dịch lỗi tiếng Anh từ API sang tiếng Việt */
export function translateApiError(message: string): string {
  const lower = message.toLowerCase();
  const map: [string, string][] = [
    ["you have already reviewed this product for this order", "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi."],
    ["already reviewed", "Bạn đã đánh giá sản phẩm này rồi."],
    ["out of stock", "Sản phẩm đã hết hàng."],
    ["insufficient stock", "Không đủ hàng trong kho."],
    ["invalid coupon", "Mã giảm giá không hợp lệ."],
    ["coupon expired", "Mã giảm giá đã hết hạn."],
    ["coupon has been fully used", "Mã giảm giá đã được sử dụng hết."],
    ["order not found", "Không tìm thấy đơn hàng."],
    ["product not found", "Không tìm thấy sản phẩm."],
    ["user not found", "Không tìm thấy người dùng."],
    ["unauthorized", "Bạn không có quyền thực hiện thao tác này."],
    ["forbidden", "Truy cập bị từ chối."],
    ["invalid credentials", "Email hoặc mật khẩu không đúng."],
    ["email already exists", "Email này đã được đăng ký. Vui lòng sử dụng email khác."],
    ["invalid email", "Email không hợp lệ."],
    ["password too short", "Mật khẩu quá ngắn."],
    ["incorrect password", "Mật khẩu hiện tại không đúng."],
    ["network error", "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."],
    ["timeout", "Yêu cầu hết thời gian chờ. Vui lòng thử lại."],
    ["server error", "Lỗi máy chủ. Vui lòng thử lại sau."],
    ["bad request", "Yêu cầu không hợp lệ."],
    ["not found", "Không tìm thấy dữ liệu."],
    ["conflict", "Dữ liệu đã tồn tại."],
    ["cannot cancel", "Không thể hủy đơn hàng ở trạng thái này."],
    ["order already cancelled", "Đơn hàng đã được hủy trước đó."],
    ["cart is empty", "Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng."],
  ];

  for (const [key, val] of map) {
    if (lower.includes(key)) return val;
  }
  return message;
}

export function getErrorMessage(error: unknown, fallback = "Lỗi hệ thống"): string {
  if (error instanceof ApiError) {
    const msg = (() => {
      if (typeof error.errors === "string") return `${error.message}: ${error.errors}`;
      if (Array.isArray(error.errors)) return `${error.message}: ${error.errors.join(", ")}`;
      if (error.errors && typeof error.errors === "object") {
        try { return `${error.message}: ${JSON.stringify(error.errors)}`; }
        catch { return error.message; }
      }
      return error.message;
    })();
    return translateApiError(msg);
  }
  if (error instanceof Error) return translateApiError(error.message);
  if (typeof error === "string") return translateApiError(error);
  return fallback;
}

/** Dịch trạng thái đơn hàng sang tiếng Việt */
export function translateOrderStatus(status: string): {
  label: string;
  variant: "default" | "success" | "warning" | "danger" | "info" | "purple";
} {
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "purple" }> = {
    Pending:    { label: "Chờ xác nhận",  variant: "warning" },
    Processing: { label: "Đang xử lý",    variant: "info" },
    Shipped:    { label: "Đang giao",     variant: "purple" },
    Delivered:  { label: "Đã giao",       variant: "success" },
    Cancelled:  { label: "Đã hủy",        variant: "danger" },
    Refunded:   { label: "Đã hoàn tiền",  variant: "default" },
    Returned:   { label: "Đã trả hàng",   variant: "default" },
  };
  return map[status] ?? { label: status, variant: "default" };
}

/** Dịch trạng thái thanh toán sang tiếng Việt */
export function translatePaymentStatus(status: string): string {
  const map: Record<string, string> = {
    Pending:   "Chờ thanh toán",
    Paid:      "Đã thanh toán",
    Failed:    "Thanh toán thất bại",
    Refunded:  "Đã hoàn tiền",
    Cancelled: "Đã hủy",
    COD:       "Thanh toán khi nhận hàng",
  };
  return map[status] ?? status;
}

/** Dịch phương thức thanh toán */
export function translatePaymentMethod(method: string | number): string {
  const map: Record<string, string> = {
    "0": "Thanh toán khi nhận hàng (COD)",
    "1": "Chuyển khoản ngân hàng",
    "2": "Thanh toán online",
    COD: "Thanh toán khi nhận hàng (COD)",
    BankTransfer: "Chuyển khoản ngân hàng",
    Online: "Thanh toán online",
  };
  return map[String(method)] ?? String(method);
}
