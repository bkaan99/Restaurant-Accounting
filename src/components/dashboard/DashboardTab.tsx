"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Expense, MenuItem, Sale } from "@/lib/types";
import { Card } from "./ui/Card";
import { ChartCard } from "./ui/ChartCard";

const widgetClass = "rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm";

export function DashboardTab({
  tl,
  stats,
  sales,
  salesChartData,
  expenseChartData,
  activeMenu,
  menuItems,
  expenses,
}: {
  tl: Intl.NumberFormat;
  stats: { totalSales: number; totalExpenses: number; net: number; orderCount: number };
  sales: Sale[];
  salesChartData: { date: string; total: number }[];
  expenseChartData: { supplier: string; amount: number }[];
  activeMenu: MenuItem[];
  menuItems: MenuItem[];
  expenses: Expense[];
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Toplam Satis" value={tl.format(stats.totalSales)} tone="blue" />
        <Card title="Toplam Gider" value={tl.format(stats.totalExpenses)} tone="orange" />
        <Card title="Net Fark" value={tl.format(stats.net)} tone={stats.net >= 0 ? "green" : "orange"} />
        <Card title="Toplam Siparis" value={String(stats.orderCount)} tone="slate" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <ChartCard title="Gelir Trendi">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) => tl.format(Number(value))} />
              <Line dataKey="total" stroke="#2563eb" strokeWidth={2.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className={`${widgetClass} space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Toplam Kayitlar</h3>
            <span className="text-xs text-slate-500">{sales.length} kayit</span>
          </div>
          <div className="space-y-2">
            {sales.slice(0, 6).map((sale) => (
              <div key={sale.id} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-800">{tl.format(sale.totalAmount)}</p>
                <p className="text-xs text-slate-500">{sale.createdBy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <ChartCard title="Tedarikci Bazli Gider">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="supplier" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) => tl.format(Number(value))} />
              <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className={widgetClass}>
          <h3 className="mb-3 text-lg font-semibold">Hizli Ozet</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Aktif Urun</span>
              <span className="font-semibold">{activeMenu.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Toplam Kalem</span>
              <span className="font-semibold">{menuItems.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>Toplam Gider Kaydi</span>
              <span className="font-semibold">{expenses.length}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
