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

export function isAdminRole(role?: string): boolean {
  return role === "Admin" || role === "Staff";
}

export function getErrorMessage(error: unknown, fallback = "Lỗi hệ thống"): string {
  if (error instanceof ApiError) {
    if (typeof error.errors === "string") {
      return `${error.message}: ${error.errors}`;
    }
    if (Array.isArray(error.errors)) {
      return `${error.message}: ${error.errors.join(", ")}`;
    }
    if (error.errors && typeof error.errors === "object") {
      try {
        return `${error.message}: ${JSON.stringify(error.errors)}`;
      } catch {
        return error.message;
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
