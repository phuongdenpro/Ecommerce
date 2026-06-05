"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { RoleBadge } from "@/features/admin/components/admin-status-badge";

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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <p className="text-sm font-medium text-slate-500">
        ShopVN Admin / <span className="text-slate-900">{resolveTitle(pathname)}</span>
      </p>
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
          {user?.role && <RoleBadge role={user.role} />}
        </div>
      </div>
    </header>
  );
}
