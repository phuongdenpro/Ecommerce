"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { isAdminRole } from "@/lib/utils";

export function ShopHeader() {
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const itemCount = cart?.totalItems ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          ShopVN
        </Link>

        <form action="/products" className="hidden flex-1 max-w-xl md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              type="search"
              placeholder="Tìm sản phẩm..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </form>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/products"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline"
          >
            Sản phẩm
          </Link>
          {user && (
            <Link
              href="/wishlist"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Yêu thích"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {isAdminRole(user.role) && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 lg:inline"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="h-5 w-5" />
                <span className="hidden max-w-[100px] truncate sm:inline">
                  {user.fullName.split(" ")[0]}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
