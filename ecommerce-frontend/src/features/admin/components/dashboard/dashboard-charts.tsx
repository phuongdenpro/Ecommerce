"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardExtended } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#64748b"];

export function DashboardCharts({ data }: { data: DashboardExtended }) {
  const revenueDaily = data.revenueDaily ?? [];
  const revenueMonthly = data.revenueMonthly ?? [];
  const userSignupsMonthly = data.userSignupsMonthly ?? [];
  const ordersByStatus = data.ordersByStatus ?? [];
  const paymentsByMethod = data.paymentsByMethod ?? [];

  const revenueData = revenueDaily.slice(-14).map((d) => ({
    name: d.period.length >= 5 ? d.period.slice(5) : d.period,
    revenue: d.revenue,
    orders: d.orderCount,
  }));

  const monthlyRevenue = revenueMonthly.slice(-6).map((d) => ({
    name: d.period,
    revenue: d.revenue,
    orders: d.orderCount,
  }));

  const signups = userSignupsMonthly.slice(-6).map((d) => ({
    name: d.period,
    count: d.count,
  }));

  const orderPie = ordersByStatus.map((s) => ({
    name: s.label,
    value: s.count,
  }));

  const paymentPie = paymentsByMethod.map((p) => ({
    name: p.label,
    value: p.count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Doanh thu 14 ngày gần nhất">
        {revenueData.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#6366f1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Số đơn theo ngày">
        {revenueData.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="orders" name="Đơn hàng" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Doanh thu theo tháng">
        {monthlyRevenue.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
            <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Đăng ký mới theo tháng">
        {signups.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={signups}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Khách mới" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Đơn hàng theo trạng thái">
        {orderPie.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={orderPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {orderPie.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Phương thức thanh toán">
        {paymentPie.length === 0 ? (
          <EmptyChart />
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={paymentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {paymentPie.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
      Chưa có dữ liệu
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="min-h-[280px] w-full">{children}</div>
    </div>
  );
}
