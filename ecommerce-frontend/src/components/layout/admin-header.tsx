"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Search, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { RoleBadge } from "@/features/admin/components/admin-status-badge";
import { AdminTheme, getAdminTheme, setAdminTheme } from "@/lib/theme";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Sản phẩm",
  "/admin/categories": "Danh mục",
  "/admin/brands": "Thương hiệu",
  "/admin/orders": "Đơn hàng",
  "/admin/orders/create": "Tạo đơn hàng",
  "/admin/customers": "Khách hàng",
  "/admin/users": "Người dùng",
  "/admin/coupons": "Mã giảm giá",
  "/admin/reviews": "Đánh giá",
  "/admin/payments": "Thanh toán",
  "/admin/reports": "Báo cáo",
  "/admin/settings": "Cài đặt",
};

function resolveTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/admin/products/")) return "Sản phẩm";
  if (pathname.startsWith("/admin/orders/")) return "Chi tiết đơn hàng";
  if (pathname.startsWith("/admin/customers/")) return "Chi tiết khách hàng";
  return "Quản trị";
}

export function AdminHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [theme, setTheme] = useState<AdminTheme>("light");

  useEffect(() => {
    const stored = getAdminTheme();
    setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const nextTheme: AdminTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setAdminTheme(nextTheme);
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl admin-border transition-all duration-300">
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          ShopVN Admin 
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100">{resolveTitle(pathname)}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search bar (fake for now, can be implemented later) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-48 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Chuyển giao diện"
            title={theme === "dark" ? "Bật giao diện sáng" : "Bật giao diện tối"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button 
            type="button" 
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" 
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="hidden items-center gap-3 pl-2 sm:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
              {user?.role && (
                <div className="mt-0.5 flex justify-end">
                  <RoleBadge role={user.role} />
                </div>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
