"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({
  data,
}: {
  data: { name: string; revenue: number; orders: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border bg-white text-sm text-slate-400">
        Chưa có dữ liệu trong khoảng đã chọn
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-4 font-semibold">Doanh thu theo ngày</h3>
      <div className="min-h-[360px] w-full">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Bar dataKey="revenue" fill="#6366f1" name="Doanh thu" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
