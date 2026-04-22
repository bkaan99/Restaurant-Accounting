"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MenuItem, Sale } from "@/lib/types";

export function DashboardTab({
  tl,
  stats,
  sales,
  salesChartData,
  menuItems,
  darkMode,
}: {
  tl: Intl.NumberFormat;
  stats: { totalSales: number; totalExpenses: number; net: number; orderCount: number };
  sales: Sale[];
  salesChartData: { date: string; total: number }[];
  menuItems: MenuItem[];
  darkMode?: boolean;
}) {
  const dm = darkMode ?? false;

  const productSales = sales.reduce<Record<string, { id: string; name: string; qty: number; total: number }>>((acc, sale) => {
    sale.items.forEach((item) => {
      if (!acc[item.menuItemId]) acc[item.menuItemId] = { id: item.menuItemId, name: item.name, qty: 0, total: 0 };
      acc[item.menuItemId].qty += item.qty;
      acc[item.menuItemId].total += item.lineTotal;
    });
    return acc;
  }, {});
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 4);
  const recentSales = sales.slice(0, 4);
  const maxRevenue = Math.max(...salesChartData.map((item) => item.total), 1);
  const gaugePercent = Math.min(Math.max((stats.net / Math.max(stats.totalSales, 1)) * 100, 8), 100);

  const card = dm
    ? "rounded-3xl border border-white/10 bg-white/5 p-4 shadow-sm"
    : "rounded-3xl border p-4 shadow-sm";

  return (
    <section className="grid items-start gap-4 xl:grid-cols-[2fr_1fr]">
      <div className="grid self-start gap-4 sm:grid-cols-2">
        {/* Toplam Ciro */}
        <div className={`h-[250px] ${card} ${dm ? "" : "border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-400">Finans</p>
              <p className={`mt-1 text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}>Toplam Ciro</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${dm ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              +10%
            </span>
          </div>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{tl.format(stats.totalSales)}</p>
          <p className={`mt-1 text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Geçen aya göre büyüme devam ediyor</p>
          <div className="mt-4 flex h-10 items-end gap-1.5">
            {salesChartData.slice(-6).map((item) => (
              <div key={item.date} className="w-2.5 rounded-full bg-gradient-to-t from-violet-600 to-indigo-400"
                style={{ height: `${Math.max((item.total / maxRevenue) * 100, 16)}%` }} />
            ))}
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className={`h-[250px] ${card} ${dm ? "" : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-400">Operasyon</p>
              <p className={`mt-1 text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}>Toplam Sipariş</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${dm ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
              {stats.orderCount} adet
            </span>
          </div>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{stats.orderCount}</p>
          <p className={`mt-1 text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Sipariş hacmi günlük olarak takip ediliyor</p>
          <div className="mt-4 flex h-10 items-end gap-1.5">
            {salesChartData.slice(-6).map((item, index) => (
              <div key={`${item.date}-${index}`} className="w-2.5 rounded-full bg-gradient-to-t from-indigo-500 to-sky-400"
                style={{ height: `${Math.max(((index + 2) / 8) * 100, 16)}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Satış Raporu gauge */}
      <div className={`h-[250px] relative overflow-hidden ${card} ${dm ? "" : "border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">Canlı Özet</p>
            </div>
            <p className={`mt-1 text-sm font-bold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Performans Analizi</p>
          </div>
          <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${dm ? "border-violet-400/30 bg-violet-500/10 text-violet-300" : "border-violet-200 bg-violet-50 text-violet-700"}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            %{Math.round(gaugePercent)}
          </div>
        </div>
        
        <div className="relative mx-auto mt-2 h-32 w-32">
          {/* Background Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className={dm ? "text-slate-800" : "text-slate-100"}
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            {/* Progress Ring */}
            <circle
              className="text-violet-600 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - gaugePercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className={`text-lg font-black tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{tl.format(Math.max(stats.net, 0))}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Net Kâr</p>
          </div>
        </div>

        <div className={`mt-2 grid grid-cols-2 gap-4 border-t pt-2 ${dm ? "border-white/5" : "border-slate-100"}`}>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Aylık Beklenti</p>
            <p className={`text-sm font-bold ${dm ? "text-slate-200" : "text-slate-800"}`}>{tl.format(stats.totalSales * 0.32)}</p>
          </div>
          <div className={`text-center border-l ${dm ? "border-white/5" : "border-slate-100"}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Yıllık Tahmin</p>
            <p className={`text-sm font-bold ${dm ? "text-slate-200" : "text-slate-800"}`}>{tl.format(stats.totalSales * 0.96)}</p>
          </div>
        </div>
      </div>

      {/* Satış Analitiği chart */}
      <div className={`${card} ${dm ? "" : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white"} xl:col-span-1`}>
        <p className={`text-base font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Satış Analitiği</p>
        <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Ciro analiz raporu içgörüleri</p>
        <div className="mt-2.5">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="4 4" stroke={dm ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="date" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b" }} />
              <YAxis stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b" }} />
              <Tooltip
                formatter={(value) => tl.format(Number(value))}
                contentStyle={{ background: dm ? "#1e293b" : "#fff", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, color: dm ? "#e2e8f0" : "#1e293b" }}
              />
              <Line dataKey="total" stroke="#7c3aed" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* En Çok Satan Ürünler */}
      <div className={`${card} ${dm ? "" : "border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-white"} xl:col-start-2`}>
        <p className={`text-base font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>En Çok Satan Ürünler</p>
        <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>En çok satılan ürün analizi</p>
        <div className="mt-2.5 space-y-2">
          {topProducts.length === 0 ? (
            <p className={`rounded-xl p-3 text-sm ${dm ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>Henüz ürün satışı yok.</p>
          ) : (
            topProducts.map((product) => (
              <div key={product.id} className={`flex items-center justify-between rounded-2xl border px-2.5 py-1.5 ${dm ? "border-white/10 bg-white/5" : "border-emerald-100 bg-white"}`}>
                <div className="min-w-0">
                  <p className={`truncate text-xs font-medium ${dm ? "text-slate-200" : "text-slate-800"}`}>{product.name}</p>
                  <p className="text-xs text-emerald-500">{tl.format(product.total)}</p>
                </div>
                <p className={`text-xs font-semibold ${dm ? "text-violet-300" : "text-violet-700"}`}>{product.qty} adet satıldı</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Son İşlemler */}
      <div className={`${card} ${dm ? "" : "border-slate-200 bg-white"} xl:col-span-1`}>
        <p className={`text-base font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Son İşlemler</p>
        <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Son işlemlerin özet görünümü</p>
        <div className="mt-2.5 overflow-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className={`border-b text-left ${dm ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                <th className="pb-1.5">Ürün</th>
                <th className="pb-1.5">Fiş No</th>
                <th className="pb-1.5">Tarih</th>
                <th className="pb-1.5 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className={`border-b ${dm ? "border-white/5" : "border-slate-100"}`}>
                  <td className={`py-1.5 ${dm ? "text-slate-300" : "text-slate-700"}`}>{sale.items[0]?.name ?? menuItems[0]?.name ?? "Bilinmiyor"}</td>
                  <td className={dm ? "text-slate-400" : "text-slate-500"}>{sale.receiptNo}</td>
                  <td className={dm ? "text-slate-400" : "text-slate-500"}>{new Date(sale.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td className="text-right font-semibold text-emerald-500">{tl.format(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentSales.length === 0 ? (
            <p className={`mt-3 rounded-xl p-3 text-sm ${dm ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>Henüz işlem bulunmuyor.</p>
          ) : null}
        </div>
      </div>

      {/* Hızlı Bilgi */}
      <div className={`${card} ${dm ? "" : "border-slate-200 bg-white"} xl:col-start-2`}>
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-3 text-white">
          <p className="text-sm font-semibold">Hızlı Bilgi</p>
          <p className="mt-1 text-xs text-violet-100">Menüde {menuItems.length} ürün var ve toplam {sales.length} sipariş işlendi.</p>
          <p className="mt-2 text-xs font-medium text-violet-50">Toplam gider: {tl.format(stats.totalExpenses)}</p>
        </div>
      </div>
    </section>
  );
}
