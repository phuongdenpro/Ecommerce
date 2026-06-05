"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
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
  if (pathname.startsWith("/admin/orders/")) return "Chi tiết đơn";
  if (pathname.startsWith("/admin/customers/")) return "Khách hàng";
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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur admin-surface admin-border">
      <p className="text-sm font-medium admin-muted">
        ShopVN Admin / <span className="admin-text">{resolveTitle(pathname)}</span>
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 admin-text hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Chuyển giao diện"
          title={theme === "dark" ? "Bật giao diện sáng" : "Bật giao diện tối"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button type="button" className="rounded-lg p-2 admin-text hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium admin-text">{user?.fullName}</p>
          {user?.role && <RoleBadge role={user.role} />}
        </div>
      </div>
    </header>
  );
}
