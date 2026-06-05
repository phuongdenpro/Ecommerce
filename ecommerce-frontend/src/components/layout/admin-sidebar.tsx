"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  ShoppingCart,
  Users,
  UserCog,
  Ticket,
  Star,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/brands", label: "Thương hiệu", icon: Tag },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/orders/create", label: "Tạo đơn hàng", icon: ShoppingCart },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/users", label: "Người dùng", icon: UserCog },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
  { href: "/admin/payments", label: "Thanh toán", icon: CreditCard },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="border-b border-slate-800 p-5">
        <p className="text-lg font-bold text-white">ShopVN Admin</p>
        <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-slate-800 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 hover:text-white"
        >
          <Store className="h-4 w-4" />
          Về cửa hàng
        </Link>
        <button
          type="button"
          onClick={() => logout().then(() => (window.location.href = "/login"))}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
