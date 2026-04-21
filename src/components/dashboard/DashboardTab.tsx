"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MenuItem, Sale } from "@/lib/types";

export function DashboardTab({
  tl,
  stats,
  sales,
  salesChartData,
  menuItems,
}: {
  tl: Intl.NumberFormat;
  stats: { totalSales: number; totalExpenses: number; net: number; orderCount: number };
  sales: Sale[];
  salesChartData: { date: string; total: number }[];
  menuItems: MenuItem[];
}) {
  const productSales = sales.reduce<Record<string, { name: string; qty: number; total: number }>>((acc, sale) => {
    sale.items.forEach((item) => {
      if (!acc[item.menuItemId]) acc[item.menuItemId] = { name: item.name, qty: 0, total: 0 };
      acc[item.menuItemId].qty += item.qty;
      acc[item.menuItemId].total += item.lineTotal;
    });
    return acc;
  }, {});
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);
  const recentSales = sales.slice(0, 4);
  const maxRevenue = Math.max(...salesChartData.map((item) => item.total), 1);
  const gaugePercent = Math.min(Math.max((stats.net / Math.max(stats.totalSales, 1)) * 100, 8), 100);

  return (
    <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Finans</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Toplam Ciro</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              +10%
            </span>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{tl.format(stats.totalSales)}</p>
          <p className="mt-1 text-sm text-slate-500">Geçen aya göre büyüme devam ediyor</p>
          <div className="mt-5 flex h-12 items-end gap-2">
            {salesChartData.slice(-6).map((item) => (
              <div
                key={item.date}
                className="w-3 rounded-full bg-gradient-to-t from-violet-600 to-indigo-400"
                style={{ height: `${Math.max((item.total / maxRevenue) * 100, 16)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">Operasyon</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Toplam Sipariş</p>
            </div>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {stats.orderCount} adet
            </span>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{stats.orderCount}</p>
          <p className="mt-1 text-sm text-slate-500">Sipariş hacmi günlük olarak takip ediliyor</p>
          <div className="mt-5 flex h-12 items-end gap-2">
            {salesChartData.slice(-6).map((item, index) => (
              <div
                key={`${item.date}-${index}`}
                className="w-3 rounded-full bg-gradient-to-t from-indigo-500 to-sky-400"
                style={{ height: `${Math.max(((index + 2) / 8) * 100, 16)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Satış Raporu</p>
        <p className="text-xs text-slate-400">Çeyreklik satış performansı analizi</p>
        <div className="mx-auto mt-5 h-44 w-44 rounded-full bg-[conic-gradient(#6d28d9_var(--value),#e9d5ff_0)] [--value:70%] p-4" style={{ ["--value" as string]: `${gaugePercent}%` }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-3xl font-semibold text-slate-900">{tl.format(Math.max(stats.net, 0))}</p>
              <p className="text-xs text-slate-400">Özet</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
          <div>
            <p className="text-slate-400">Aylık</p>
            <p className="text-xl font-semibold text-slate-900">{tl.format(stats.totalSales * 0.32)}</p>
          </div>
          <div>
            <p className="text-slate-400">Yıllık</p>
            <p className="text-xl font-semibold text-slate-900">{tl.format(stats.totalSales * 0.96)}</p>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
        <p className="text-xl font-semibold text-slate-900">Satış Analitiği</p>
        <p className="text-sm text-slate-400">Ciro analiz raporu içgörüleri</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) => tl.format(Number(value))} />
              <Line dataKey="total" stroke="#5b21b6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-start-2">
        <p className="text-xl font-semibold text-slate-900">En Çok Satan Ürünler</p>
        <p className="text-sm text-slate-400">En çok satılan ürün analizi</p>
        <div className="mt-4 space-y-3">
          {topProducts.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Henüz ürün satışı yok.</p>
          ) : (
            topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{product.name}</p>
                  <p className="text-sm text-emerald-600">{tl.format(product.total)}</p>
                </div>
                <p className="text-sm font-semibold text-violet-700">{product.qty} adet satıldı</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
        <p className="text-xl font-semibold text-slate-900">Son İşlemler</p>
        <p className="text-sm text-slate-400">Son işlemlerin özet görünümü</p>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2">Ürün</th>
                <th className="pb-2">Fiş No</th>
                <th className="pb-2">Tarih</th>
                <th className="pb-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100">
                  <td className="py-2">{sale.items[0]?.name ?? menuItems[0]?.name ?? "Bilinmiyor"}</td>
                  <td>{sale.id.slice(0, 12).toUpperCase()}</td>
                  <td>{new Date(sale.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td className="text-right font-semibold text-emerald-600">{tl.format(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentSales.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Henüz işlem bulunmuyor.</p>
          ) : null}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-start-2">
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-4 text-white">
          <p className="font-semibold">Hızlı Bilgi</p>
          <p className="mt-1 text-sm text-violet-100">Menüde {menuItems.length} ürün var ve toplam {sales.length} sipariş işlendi.</p>
          <p className="mt-2 text-sm font-medium text-violet-50">Toplam gider: {tl.format(stats.totalExpenses)}</p>
        </div>
      </div>
    </section>
  );
}
