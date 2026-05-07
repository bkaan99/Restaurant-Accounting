"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Expense, MenuItem, Sale } from "@/lib/types";

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6'];

export function ReportsTab({
  sales,
  expenses,
  menuItems,
  darkMode,
  tl,
}: {
  sales: Sale[];
  expenses: Expense[];
  menuItems: MenuItem[];
  darkMode?: boolean;
  tl: Intl.NumberFormat;
}) {
  const dm = darkMode ?? false;
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month" | "year">("all");

  const card = dm
    ? "rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm"
    : "rounded-3xl border border-slate-200 p-5 shadow-sm bg-white";

  // Filter Data based on dateRange
  const { filteredSales, filteredExpenses } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let startTime = 0;
    if (dateRange === "today") startTime = today;
    if (dateRange === "week") startTime = today - 6 * 24 * 60 * 60 * 1000;
    if (dateRange === "month") startTime = today - 29 * 24 * 60 * 60 * 1000;
    if (dateRange === "year") startTime = new Date(now.getFullYear(), 0, 1).getTime();

    return {
      filteredSales: sales.filter(s => new Date(s.createdAt).getTime() >= startTime),
      filteredExpenses: expenses.filter(e => new Date(e.expenseDate).getTime() >= startTime)
    };
  }, [sales, expenses, dateRange]);

  // Metrics
  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const aov = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
  const totalItemsSold = filteredSales.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.qty, 0), 0);

  // Time Series (Gelir/Gider)
  const timeSeriesData = useMemo(() => {
    const grouped = new Map<string, { date: string, Gelir: number, Gider: number }>();
    
    filteredSales.forEach(s => {
      const dateStr = new Date(s.createdAt).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' });
      const current = grouped.get(dateStr) || { date: dateStr, Gelir: 0, Gider: 0 };
      current.Gelir += s.totalAmount;
      grouped.set(dateStr, current);
    });
    
    filteredExpenses.forEach(e => {
      const dateStr = new Date(e.expenseDate).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' });
      const current = grouped.get(dateStr) || { date: dateStr, Gelir: 0, Gider: 0 };
      current.Gider += e.amount;
      grouped.set(dateStr, current);
    });

    return Array.from(grouped.values()).reverse();
  }, [filteredSales, filteredExpenses]);

  // Day of Week Analysis
  const dayOfWeekData = useMemo(() => {
    const days = ['Pazar', 'Pzt', 'Salı', 'Çar', 'Per', 'Cuma', 'Cmt'];
    const data = days.map(day => ({ name: day, Sipariş: 0, Ciro: 0 }));
    
    filteredSales.forEach(s => {
      const d = new Date(s.createdAt).getDay();
      data[d].Sipariş += 1;
      data[d].Ciro += s.totalAmount;
    });
    
    return [...data.slice(1), data[0]];
  }, [filteredSales]);

  // Expense by Supplier
  const expenseBreakdown = useMemo(() => {
    const suppliers: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      suppliers[e.supplier] = (suppliers[e.supplier] || 0) + e.amount;
    });
    return Object.entries(suppliers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Category Sales
  const categorySales = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        const categoryName = menuItem?.category || "Diğer";
        cats[categoryName] = (cats[categoryName] || 0) + item.lineTotal;
      });
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, menuItems]);

  // Staff Performance
  const staffPerformance = useMemo(() => {
    const staff: Record<string, { name: string, sales: number, total: number }> = {};
    filteredSales.forEach(sale => {
      if (!staff[sale.createdBy]) {
        staff[sale.createdBy] = { name: sale.createdBy, sales: 0, total: 0 };
      }
      staff[sale.createdBy].sales += 1;
      staff[sale.createdBy].total += sale.totalAmount;
    });
    return Object.values(staff).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Top Products Detailed
  const productPerformance = useMemo(() => {
    const products: Record<string, { name: string, qty: number, total: number, category: string }> = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!products[item.menuItemId]) {
          const m = menuItems.find(mi => mi.id === item.menuItemId);
          products[item.menuItemId] = { 
            name: item.name, 
            qty: 0, 
            total: 0, 
            category: m?.category || "Bilinmiyor" 
          };
        }
        products[item.menuItemId].qty += item.qty;
        products[item.menuItemId].total += item.lineTotal;
      });
    });
    return Object.values(products).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredSales, menuItems]);

  const downloadCSV = () => {
    const rows = [
      ["Tarih", "Kategori", "Gelir", "Gider"],
      ...timeSeriesData.map(d => [d.date, "", d.Gelir, d.Gider])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapor_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Header & Filters */}
      <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 rounded-3xl border p-2 pl-6 shadow-sm ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div>
          <h2 className={`text-lg font-semibold tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>Gelişmiş Raporlar</h2>
          <p className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>İşletmenizin detaylı performans analizi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100/50 dark:bg-slate-900 p-1 rounded-2xl">
            {[
              { id: "today", label: "Bugün" },
              { id: "week", label: "Bu Hafta" },
              { id: "month", label: "Bu Ay" },
              { id: "year", label: "Bu Yıl" },
              { id: "all", label: "Tümü" }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id as "all" | "today" | "week" | "month" | "year")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  dateRange === opt.id 
                    ? (dm ? "bg-indigo-500 text-white shadow" : "bg-white text-indigo-600 shadow-sm") 
                    : (dm ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-white/50")
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button 
            onClick={downloadCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${dm ? "bg-white/10 text-white hover:bg-white/20" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            CSV İndir
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Ciro", value: tl.format(totalSales), color: "from-violet-500 to-indigo-500" },
          { label: "Net Kâr", value: tl.format(netProfit), color: "from-emerald-400 to-teal-500" },
          { label: "Sepet Ortalaması (AOV)", value: tl.format(aov), color: "from-blue-400 to-sky-500" },
          { label: "Satılan Ürün", value: `${totalItemsSold} Adet`, color: "from-fuchsia-400 to-pink-500" },
        ].map((stat, i) => (
          <div key={i} className={`${card} relative overflow-hidden flex flex-col justify-center`}>
             <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-xl`} />
             <p className={`text-[11px] font-bold uppercase tracking-wider ${dm ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
             <p className={`mt-2 text-2xl font-black tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className={`${card} xl:col-span-2`}>
          <div className="mb-6">
            <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>Gelir ve Gider Akışı</h3>
            <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Zaman içindeki finansal performans trendi</p>
          </div>
          <div className="h-[300px]">
            {timeSeriesData.length === 0 ? (
               <div className={`flex h-full items-center justify-center rounded-xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Veri yok</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dm ? "#334155" : "#f1f5f9"} />
                  <XAxis dataKey="date" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11, fill: dm ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11, fill: dm ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `₺${v}`} />
                  <Tooltip 
                    formatter={(val) => (typeof val === "number" ? tl.format(val) : `${val ?? ""}`)}
                    contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                  <Bar dataKey="Gelir" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="Gider" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Day of week analysis */}
        <div className={`${card} xl:col-span-1`}>
          <div className="mb-6">
            <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>Haftanın Günleri</h3>
            <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Hangi gün daha fazla ciro yapılıyor?</p>
          </div>
          <div className="h-[300px]">
             {dayOfWeekData.every(d => d.Ciro === 0) ? (
               <div className={`flex h-full items-center justify-center rounded-xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Veri yok</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={dm ? "#334155" : "#f1f5f9"} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke={dm ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11, fill: dm ? "#94a3b8" : "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip 
                    formatter={(val) => (typeof val === "number" ? tl.format(val) : `${val ?? ""}`)}
                    cursor={{ fill: dm ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                    contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  />
                  <Bar dataKey="Ciro" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16}>
                    {dayOfWeekData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Ciro === Math.max(...dayOfWeekData.map(d=>d.Ciro)) ? '#10b981' : (dm ? '#1e293b' : '#f1f5f9')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <div className={`${card} flex flex-col`}>
          <div className="mb-6">
            <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>Kategori Performansı</h3>
            <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>En çok gelir getiren menü kategorileri</p>
          </div>
          <div className="h-[250px] flex flex-col sm:flex-row items-center justify-center gap-8">
            {categorySales.length === 0 ? (
               <div className={`w-full flex h-full items-center justify-center rounded-xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Veri yok</div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorySales} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                        {categorySales.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val) => (typeof val === "number" ? tl.format(val) : `${val ?? ""}`)} contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-3">
                  {categorySales.slice(0, 6).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <p className={`text-xs font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}>{cat.name}</p>
                      </div>
                      <p className={`text-xs font-bold ${dm ? "text-white" : "text-slate-900"}`}>{tl.format(cat.value)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expense breakdown */}
        <div className={`${card} flex flex-col`}>
          <div className="mb-6">
            <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>Gider Dağılımı</h3>
            <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Tedarikçilere göre harcama analizi</p>
          </div>
          <div className="h-[250px] flex flex-col sm:flex-row items-center justify-center gap-8">
            {expenseBreakdown.length === 0 ? (
               <div className={`w-full flex h-full items-center justify-center rounded-xl border border-dashed ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Veri yok</div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={0} outerRadius={85} dataKey="value" stroke={dm ? "#0f172a" : "#ffffff"} strokeWidth={2}>
                        {expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val) => (typeof val === "number" ? tl.format(val) : `${val ?? ""}`)} contentStyle={{ background: dm ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)", border: dm ? "1px solid #334155" : "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-3 overflow-y-auto max-h-[220px] pr-2">
                  {expenseBreakdown.slice(0, 6).map((exp, i) => (
                    <div key={exp.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }}></div>
                        <p className={`text-xs font-semibold truncate max-w-[120px] ${dm ? "text-slate-200" : "text-slate-700"}`} title={exp.name}>{exp.name}</p>
                      </div>
                      <p className={`text-xs font-bold text-rose-500`}>{tl.format(exp.value)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Staff Performance */}
        <div className={`${card} flex flex-col`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>Personel Performansı</h3>
              <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Personel bazlı satış adetleri ve cirolar</p>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${dm ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                <tr>
                  <th className="pb-3 pl-2">Personel</th>
                  <th className="pb-3 text-center">Satış Adedi</th>
                  <th className="pb-3 text-right pr-2">Toplam Ciro</th>
                </tr>
              </thead>
              <tbody className={dm ? "text-slate-200" : "text-slate-700"}>
                {staffPerformance.map((s, i) => (
                  <tr key={i} className={`border-b last:border-0 ${dm ? "border-white/5" : "border-slate-50"}`}>
                    <td className="py-3 pl-2 font-medium">{s.name}</td>
                    <td className="py-3 text-center">{s.sales}</td>
                    <td className="py-3 text-right pr-2 font-bold text-indigo-500">{tl.format(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staffPerformance.length === 0 && <p className="py-10 text-center text-slate-400">Veri bulunamadı.</p>}
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className={`${card}`}>
        <div className="mb-6">
          <h3 className={`text-base font-semibold ${dm ? "text-white" : "text-slate-900"}`}>En Çok Satan Ürünler Detayı</h3>
          <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>En yüksek ciro getiren ilk 10 ürün analizi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className={`border-b ${dm ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-500"}`}>
              <tr>
                <th className="pb-3 pl-2">Ürün Adı</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3 text-center">Satış Adedi</th>
                <th className="pb-3 text-right pr-2">Toplam Ciro</th>
              </tr>
            </thead>
            <tbody className={dm ? "text-slate-200" : "text-slate-700"}>
              {productPerformance.map((p, i) => (
                <tr key={i} className={`border-b last:border-0 ${dm ? "border-white/5" : "border-slate-50"} hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}>
                  <td className="py-3 pl-2 font-medium">{p.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${dm ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold">{p.qty}</td>
                  <td className="py-3 text-right pr-2 font-bold text-emerald-500">{tl.format(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {productPerformance.length === 0 && <p className="py-10 text-center text-slate-400">Veri bulunamadı.</p>}
        </div>
      </div>
    </div>
  );
}
