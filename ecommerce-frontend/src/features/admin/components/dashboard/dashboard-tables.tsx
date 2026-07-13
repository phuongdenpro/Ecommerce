"use client";

import Link from "next/link";
import Image from "next/image";
import type { TopProduct, RecentOrder } from "@/types";
import type { LowStockProduct, AdminReviewListItem, RecentCustomer } from "@/types/admin";
import { formatDate, resolveMediaUrl } from "@/lib/utils";
import { MoneyText } from "../money-text";
import { OrderStatusBadge } from "../admin-status-badge";
import { AdminEmptyState } from "../admin-empty-state";
import { ChevronRight } from "lucide-react";

function TableShell({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 px-5 py-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
        {href && (
          <Link href={href} className="group flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="overflow-x-auto custom-scrollbar">{children}</div>
    </div>
  );
}

export function TopProductsTable({ items, loading }: { items: TopProduct[]; loading?: boolean }) {
  if (loading) return null;
  if (!items.length) return <TableShell title="Top sản phẩm"><AdminEmptyState title="Chưa có dữ liệu" /></TableShell>;

  return (
    <TableShell title="Top sản phẩm bán chạy" href="/admin/reports">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">#</th>
            <th className="px-5 py-3 whitespace-nowrap">Sản phẩm</th>
            <th className="px-5 py-3 whitespace-nowrap">Đã bán</th>
            <th className="px-5 py-3 whitespace-nowrap">Doanh thu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {items.map((p, i) => (
            <tr key={p.productId} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
              <td className="px-5 py-3 font-medium text-slate-400">{i + 1}</td>
              <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.productName}</td>
              <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold">
                  {p.totalSold}
                </span>
              </td>
              <td className="px-5 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                <MoneyText amount={p.revenue} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

export function RecentOrdersTable({ items, loading }: { items: RecentOrder[]; loading?: boolean }) {
  if (loading) return null;
  if (!items.length) return <TableShell title="Đơn gần đây"><AdminEmptyState /></TableShell>;

  return (
    <TableShell title="Đơn hàng gần đây" href="/admin/orders">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">Mã đơn</th>
            <th className="px-5 py-3 whitespace-nowrap">Khách hàng</th>
            <th className="px-5 py-3 whitespace-nowrap">Tổng tiền</th>
            <th className="px-5 py-3 whitespace-nowrap">Trạng thái</th>
            <th className="px-5 py-3 whitespace-nowrap">Ngày tạo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {items.map((o) => (
            <tr key={o.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
              <td className="px-5 py-3">
                <Link href={`/admin/orders/${o.id}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline">
                  {o.orderCode}
                </Link>
              </td>
              <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{o.customerName}</td>
              <td className="px-5 py-3 font-bold text-slate-900 dark:text-slate-100">
                <MoneyText amount={o.finalAmount} />
              </td>
              <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
              <td className="px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

export function RecentCustomersTable({ items }: { items: RecentCustomer[] }) {
  if (!items.length) return <TableShell title="Khách mới"><AdminEmptyState /></TableShell>;
  return (
    <TableShell title="Khách hàng mới" href="/admin/customers">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">Họ tên</th>
            <th className="px-5 py-3 whitespace-nowrap">Email</th>
            <th className="px-5 py-3 whitespace-nowrap">Ngày đăng ký</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {items.map((c) => (
            <tr key={c.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
              <td className="px-5 py-3">
                <Link href={`/admin/customers/${c.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 hover:underline">
                  {c.fullName}
                </Link>
              </td>
              <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{c.email}</td>
              <td className="px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

export function LowStockTable({ items }: { items: LowStockProduct[] }) {
  if (!items.length) return <TableShell title="Sắp hết hàng"><AdminEmptyState title="Kho ổn định" /></TableShell>;
  return (
    <TableShell title="Sản phẩm sắp hết hàng" href="/admin/products">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">Sản phẩm</th>
            <th className="px-5 py-3 whitespace-nowrap">SKU</th>
            <th className="px-5 py-3 whitespace-nowrap">Tồn kho</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {items.map((p) => (
            <tr key={p.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Image src={resolveMediaUrl(p.primaryImageUrl)} alt="" fill className="object-cover" />
                  </div>
                  <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors line-clamp-2">
                    {p.name}
                  </Link>
                </div>
              </td>
              <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{p.sku}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {p.stockQuantity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

export function RecentReviewsTable({ items }: { items: AdminReviewListItem[] }) {
  if (!items.length) return <TableShell title="Review mới"><AdminEmptyState /></TableShell>;
  return (
    <TableShell title="Đánh giá mới nhất" href="/admin/reviews">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">Khách hàng</th>
            <th className="px-5 py-3 whitespace-nowrap">Sản phẩm</th>
            <th className="px-5 py-3 whitespace-nowrap">Đánh giá</th>
            <th className="px-5 py-3 whitespace-nowrap">Ngày đánh giá</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {items.map((r) => (
            <tr key={r.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
              <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{r.userName}</td>
              <td className="px-5 py-3">
                <p className="max-w-[180px] truncate text-slate-600 dark:text-slate-400" title={r.productName}>
                  {r.productName}
                </p>
              </td>
              <td className="px-5 py-3">
                <div className="flex text-amber-400">
                  {"★".repeat(r.rating)}
                  <span className="text-slate-200 dark:text-slate-700">{"★".repeat(5 - r.rating)}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
