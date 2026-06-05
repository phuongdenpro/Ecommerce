"use client";

import Link from "next/link";
import Image from "next/image";
import type { TopProduct, RecentOrder } from "@/types";
import type { LowStockProduct, AdminReviewListItem, RecentCustomer } from "@/types/admin";
import { formatDate, resolveMediaUrl } from "@/lib/utils";
import { MoneyText } from "../money-text";
import { OrderStatusBadge } from "../admin-status-badge";
import { AdminEmptyState } from "../admin-empty-state";

function TableShell({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {href && (
          <Link href={href} className="text-xs font-medium text-indigo-600 hover:underline">
            Xem tất cả
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function TopProductsTable({ items, loading }: { items: TopProduct[]; loading?: boolean }) {
  if (loading) return null;
  if (!items.length) return <TableShell title="Top sản phẩm"><AdminEmptyState title="Chưa có dữ liệu" /></TableShell>;

  return (
    <TableShell title="Top sản phẩm bán chạy" href="/admin/reports">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Sản phẩm</th>
            <th className="px-4 py-2">Đã bán</th>
            <th className="px-4 py-2">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => (
            <tr key={p.productId} className="border-t">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2 font-medium">{p.productName}</td>
              <td className="px-4 py-2">{p.totalSold}</td>
              <td className="px-4 py-2"><MoneyText amount={p.revenue} /></td>
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
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Mã đơn</th>
            <th className="px-4 py-2">Khách</th>
            <th className="px-4 py-2">Tổng</th>
            <th className="px-4 py-2">TT</th>
            <th className="px-4 py-2">Ngày</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-2">
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
                  {o.orderCode}
                </Link>
              </td>
              <td className="px-4 py-2">{o.customerName}</td>
              <td className="px-4 py-2"><MoneyText amount={o.finalAmount} /></td>
              <td className="px-4 py-2"><OrderStatusBadge status={o.status} /></td>
              <td className="px-4 py-2 text-slate-500">{formatDate(o.createdAt)}</td>
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
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Họ tên</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Ngày ĐK</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">
                <Link href={`/admin/customers/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                  {c.fullName}
                </Link>
              </td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2 text-slate-500">{formatDate(c.createdAt)}</td>
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
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">SP</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Tồn</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 rounded bg-slate-100">
                    <Image src={resolveMediaUrl(p.primaryImageUrl)} alt="" fill className="rounded object-cover" />
                  </div>
                  <Link href={`/admin/products/${p.id}/edit`} className="font-medium hover:text-indigo-600">
                    {p.name}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
              <td className="px-4 py-2 text-red-600 font-semibold">{p.stockQuantity}</td>
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
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Khách</th>
            <th className="px-4 py-2">SP</th>
            <th className="px-4 py-2">Sao</th>
            <th className="px-4 py-2">Ngày</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{r.userName}</td>
              <td className="px-4 py-2 max-w-[120px] truncate">{r.productName}</td>
              <td className="px-4 py-2">{"★".repeat(r.rating)}</td>
              <td className="px-4 py-2 text-slate-500">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
