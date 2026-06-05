import Link from "next/link";
import {
  Package,
  ShoppingCart,
  UserPlus,
  Ticket,
  FolderTree,
  Tag,
} from "lucide-react";

const actions = [
  { href: "/admin/products/new", label: "Thêm sản phẩm", icon: Package },
  { href: "/admin/orders/create", label: "Tạo đơn hàng", icon: ShoppingCart },
  { href: "/admin/customers", label: "Khách hàng", icon: UserPlus },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/brands", label: "Thương hiệu", icon: Tag },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Thao tác nhanh</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Icon className="h-5 w-5 text-indigo-600" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
