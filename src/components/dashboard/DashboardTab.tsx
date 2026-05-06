"use client";

import { useMemo } from "react";
import { CartesianGrid, Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, PieChart, Pie, Cell } from "recharts";
import { Expense, MenuItem, Sale } from "@/lib/types";

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#6366f1'];

export function DashboardTab({
  tl,
  stats,
  sales,
  expenses,
  salesChartData,
  menuItems,
  darkMode,
  panelClass,
}: {
  tl: Intl.NumberFormat;
  stats: { totalSales: number; totalExpenses: number; net: number; orderCount: number };
  sales: Sale[];
  expenses: Expense[];
  salesChartData: { date: string; total: number }[];
  menuItems: MenuItem[];
  darkMode?: boolean;
  panelClass: string;
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
  
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const recentSales = sales.slice(0, 5);
  const maxRevenue = Math.max(...salesChartData.map((item) => item.total), 1);
  const gaugePercent = Math.min(Math.max((stats.net / Math.max(stats.totalSales, 1)) * 100, 8), 100);
  const averageOrderValue = stats.orderCount > 0 ? stats.totalSales / stats.orderCount : 0;

  const combinedChartData = useMemo(() => {
    const dates = new Set([
      ...sales.map(s => s.createdAt.slice(0, 10)),
      ...expenses.map(e => e.expenseDate.slice(0, 10))
    ]);
    const sortedDates = Array.from(dates).sort();
    const recentDates = sortedDates.slice(-14); 
    
    return recentDates.map(date => {
      const dailySales = sales.filter(s => s.createdAt.slice(0, 10) === date).reduce((sum, s) => sum + s.totalAmount, 0);
      const dailyExpenses = expenses.filter(e => e.expenseDate.slice(0, 10) === date).reduce((sum, e) => sum + e.amount, 0);
      return {
        date: new Date(date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' }),
        Gelir: dailySales,
        Gider: dailyExpenses,
      };
    });
  }, [sales, expenses]);

  const categorySales = useMemo(() => {
    const cats: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        const categoryName = menuItem?.category || "Diğer";
        cats[categoryName] = (cats[categoryName] || 0) + item.lineTotal;
      });
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales, menuItems]);

  const hourlyTraffic = useMemo(() => {
    const hours = Array.from({ length: 15 }, (_, i) => ({
      hour: `${(i + 9).toString().padStart(2, '0')}:00`,
      Sipariş: 0,
      Gelir: 0
    }));

    sales.forEach(sale => {
      const date = new Date(sale.createdAt);
      const h = date.getHours();
      if (h >= 9 && h <= 23) {
        hours[h - 9].Sipariş += 1;
        hours[h - 9].Gelir += sale.totalAmount;
      }
    });
    return hours;
  }, [sales]);

  const productChartData = topProducts.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    Adet: p.qty,
    Tutar: p.total
  }));

  const card = dm
    ? "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm"
    : "rounded-3xl border p-5 shadow-sm bg-white";

  return (
    <section className="grid items-start gap-4 xl:grid-cols-3">
      {/* Toplam Ciro, Sipariş & Canlı Özet */}
      <div className="grid self-start gap-4 sm:grid-cols-3 xl:col-span-2">
        {/* Toplam Ciro */}
        <div className={`h-[220px] rounded-3xl border p-5 shadow-sm flex flex-col justify-between ${dm ? "border-white/10 bg-white/5" : "border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-400">Finans</p>
              <p className={`mt-1 text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}>Toplam Ciro</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${dm ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              AKTİF
            </span>
          </div>
          <div>
            <p className={`mt-4 text-3xl font-bold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{tl.format(stats.totalSales)}</p>
            <div className="mt-4 flex h-10 items-end gap-1.5">
              {salesChartData.slice(-10).map((item, i) => (
                <div key={item.date + i} className="w-full rounded-t-sm bg-gradient-to-t from-violet-600 to-indigo-400 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max((item.total / maxRevenue) * 100, 16)}%` }} title={item.date} />
              ))}
            </div>
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className={`h-[220px] rounded-3xl border p-5 shadow-sm flex flex-col justify-between ${dm ? "border-white/10 bg-white/5" : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-400">Operasyon</p>
              <p className={`mt-1 text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}>Toplam Sipariş</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${dm ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`} title="Sepet Ortalaması">
              AOV: {tl.format(averageOrderValue)}
            </span>
          </div>
          <div>
            <p className={`mt-4 text-3xl font-bold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{stats.orderCount}</p>
            <div className="mt-4 flex h-10 items-end gap-1.5">
              {salesChartData.slice(-10).map((item, index) => (
                <div key={`${item.date}-${index}`} className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500 to-sky-400 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(((index + 2) / 10) * 100, 16)}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Canlı Özet */}
        <div className={`h-[220px] relative overflow-hidden flex flex-col justify-between rounded-3xl border p-5 shadow-sm ${dm ? "border-white/10 bg-white/5" : "border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Canlı</p>
              </div>
              <p className={`mt-1 text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}>Net Kâr Marjı</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className={`text-2xl font-black tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>{tl.format(Math.max(stats.net, 0))}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Kâr</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle className={dm ? "text-slate-800" : "text-slate-200"} strokeWidth="12" stroke="currentColor" fill="transparent" r="38" cx="50" cy="50" />
                <circle className="text-emerald-500 transition-all duration-1000 ease-out" strokeWidth="12" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - gaugePercent / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="50" cy="50" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-[11px] font-bold ${dm ? "text-slate-200" : "text-slate-700"}`}>%{Math.round(gaugePercent)}</p>
              </div>
            </div>
          </div>

          <div className={`mt-3 pt-3 border-t ${dm ? "border-white/5" : "border-slate-200/60"} grid grid-cols-2 gap-2`}>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Giderler</p>
              <p className={`text-xs font-semibold text-rose-500`}>{tl.format(stats.totalExpenses)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Brüt</p>
              <p className={`text-xs font-semibold ${dm ? "text-slate-200" : "text-slate-800"}`}>{tl.format(stats.totalSales)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column 1: Kategori Dağılımı */}
      <div className={`${card} xl:col-span-1 xl:row-span-2 flex flex-col`}>
        <div className="mb-6">
          <p className={`text-base font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Kategori Dağılımı</p>
          <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Gelirin kategorilere göre dağılımı</p>
        </div>
        <div className="h-[220px] flex-shrink-0">
          {categorySales.length === 0 ? (
            <div className={`flex h-full items-center justify-center rounded-xl border border-dashed ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>Veri bulunamadı.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => tl.format(value)}
                  contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, color: dm ? "#e2e8f0" : "#1e293b", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
          {categorySales.slice(0, 4).map((cat, i) => (
             <div key={cat.name} className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
               <div className="min-w-0">
                 <p className={`truncate text-[11px] font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}>{cat.name}</p>
                 <p className={`text-[10px] ${dm ? "text-slate-400" : "text-slate-500"}`}>{tl.format(cat.value)}</p>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Finansal Analitik Chart (Gelir/Gider) */}
      <div className={`${card} xl:col-span-2`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className={`text-lg font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Finansal Analitik</p>
            <p className={`text-[12px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Son 14 günlük gelir ve gider eğilimleri</p>
          </div>
        </div>
        <div className="h-[280px] w-full">
          {combinedChartData.length === 0 ? (
            <div className={`flex h-full w-full items-center justify-center rounded-2xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
              <p className="text-sm">Yeterli veri bulunmuyor</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dm ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="date" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₺${val}`} dx={-10} />
                <Tooltip
                  formatter={(value: number) => tl.format(value)}
                  contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 16, color: dm ? "#e2e8f0" : "#1e293b", backdropFilter: "blur(8px)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" name="Günlük Gelir" dataKey="Gelir" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGelir)" activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }} />
                <Area type="monotone" name="Günlük Gider" dataKey="Gider" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGider)" activeDot={{ r: 6, strokeWidth: 0, fill: "#f43f5e" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Hourly Traffic Chart */}
      <div className={`${card} xl:col-span-2`}>
         <div className="flex items-center justify-between mb-6">
          <div>
            <p className={`text-lg font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Saatlik Yoğunluk</p>
            <p className={`text-[12px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Gün içindeki siparişlerin saatlere göre dağılımı</p>
          </div>
        </div>
        <div className="h-[220px] w-full">
          {hourlyTraffic.every(h => h.Sipariş === 0) ? (
            <div className={`flex h-full w-full items-center justify-center rounded-2xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
              <p className="text-sm">Yeterli veri bulunmuyor</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTraffic} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dm ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="hour" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} dy={5} />
                <YAxis stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: dm ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, color: dm ? "#e2e8f0" : "#1e293b", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                />
                <Bar dataKey="Sipariş" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Right Column 2: Top Products & Recent Transactions */}
      <div className="grid gap-4 xl:col-span-1 xl:row-span-2">
        {/* En Çok Satan Ürünler Grafiği */}
        <div className={`${card}`}>
          <div className="mb-6">
            <p className={`text-base font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Popüler Ürünler</p>
            <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Adet bazında en çok satanlar</p>
          </div>
          <div className="h-[200px]">
            {productChartData.length === 0 ? (
              <div className={`flex h-full items-center justify-center rounded-2xl border border-dashed ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>Veri bulunamadı.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={dm ? "#334155" : "#f1f5f9"} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fill: dm ? "#94a3b8" : "#475569", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={85} />
                  <Tooltip
                    formatter={(value: number) => [`${value} Adet`, "Satış"]}
                    cursor={{ fill: dm ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                    contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, color: dm ? "#e2e8f0" : "#1e293b", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  />
                  <Bar dataKey="Adet" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Son İşlemler */}
        <div className={`${card} flex-1`}>
          <div className="mb-4">
            <p className={`text-base font-semibold tracking-tight ${dm ? "text-slate-100" : "text-slate-900"}`}>Son İşlemler</p>
            <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Gerçek zamanlı akış</p>
          </div>
          <div className="overflow-auto">
            {recentSales.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-4 text-center text-sm ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Henüz işlem bulunmuyor.</div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className={`flex items-center justify-between rounded-2xl border p-3 transition-colors ${dm ? "border-white/5 bg-white/5 hover:bg-white/10" : "border-slate-100 bg-white hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${dm ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${dm ? "text-slate-200" : "text-slate-800"}`}>{sale.receiptNo}</p>
                        <p className={`text-[10px] ${dm ? "text-slate-400" : "text-slate-500"}`}>{new Date(sale.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">+{tl.format(sale.totalAmount)}</p>
                      <p className={`text-[10px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Tamamlandı</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
