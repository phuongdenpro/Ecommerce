"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, User, Sun, Moon, Menu, X, Package } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { isAdminRole } from "@/lib/utils";
import { getShopTheme, setShopTheme } from "@/lib/theme";

export function ShopHeader() {
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const itemCount = cart?.totalItems ?? 0;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(itemCount);
  const router = useRouter();

  useEffect(() => {
    setTheme(getShopTheme());
  }, []);

  // Animate cart badge when count changes
  useEffect(() => {
    if (itemCount !== prevCount.current && itemCount > prevCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setShopTheme(next);
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get("search")?.toString().trim();
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-black">
              S
            </div>
            <span>ShopVN</span>
          </Link>

          {/* Search - desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 max-w-xl md:block"
          >
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                  searchFocused ? "text-indigo-500" : "text-slate-400"
                }`}
              />
              <input
                name="search"
                type="search"
                placeholder="Tìm sản phẩm..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm transition-all duration-200 dark:bg-slate-800 dark:text-slate-100
                  ${searchFocused
                    ? "border-indigo-400 bg-white ring-2 ring-indigo-500/20 shadow-sm dark:border-indigo-500"
                    : "border-slate-200 bg-slate-50 dark:border-slate-700"
                  }
                  focus:outline-none`}
              />
            </div>
          </form>

          {/* Nav icons */}
          <nav className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Chuyển giao diện sáng/tối"
            >
              {theme === "dark"
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />}
            </button>

            {/* Products link */}
            <Link
              href="/products"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors sm:inline"
            >
              Sản phẩm
            </Link>

            {/* Wishlist */}
            {user && (
              <Link
                href="/wishlist"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
                aria-label="Yêu thích"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white
                    ${cartBounce ? "animate-cart-bounce" : ""}`}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User / Login */}
            {user ? (
              <>
                {isAdminRole(user.role) && (
                  <Link
                    href="/admin"
                    className="hidden rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors lg:inline"
                  >
                    Quản trị
                  </Link>
                )}
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden max-w-[100px] truncate sm:inline">
                    {user.fullName.split(" ").slice(-1)[0]}
                  </span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-500/30"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="ml-1 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Mở menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-900 animate-slide-down md:hidden">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="search"
                  type="search"
                  placeholder="Tìm sản phẩm..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </form>

            {/* Mobile links */}
            <nav className="mt-3 space-y-1">
              <Link href="/products" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                <Package className="h-4 w-4" /> Sản phẩm
              </Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                <ShoppingCart className="h-4 w-4" /> Giỏ hàng {itemCount > 0 && <span className="ml-auto rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{itemCount}</span>}
              </Link>
              {user && (
                <>
                  <Link href="/wishlist" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    <Heart className="h-4 w-4" /> Yêu thích
                  </Link>
                  <Link href="/orders" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    <Package className="h-4 w-4" /> Đơn hàng của tôi
                  </Link>
                  <Link href="/account" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                    <User className="h-4 w-4" /> Tài khoản
                  </Link>
                  {isAdminRole(user.role) && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors">
                      <User className="h-4 w-4" /> Quản trị viên
                    </Link>
                  )}
                </>
              )}
              {!user && (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors mt-2">
                  <User className="h-4 w-4" /> Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
