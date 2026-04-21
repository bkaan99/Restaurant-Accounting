"use client";

import { useMemo, useState } from "react";
import { Expense, MenuItem, Sale } from "@/lib/types";

export function TransactionsTab({
  panelClass,
  sales,
  expenses,
  menuItems,
  tl,
}: {
  panelClass: string;
  sales: Sale[];
  expenses: Expense[];
  menuItems: MenuItem[];
  tl: Intl.NumberFormat;
}) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const rows = useMemo(() => {
    const incomeRows = sales.map((sale) => ({
      id: `income-${sale.id}`,
      type: "income" as const,
      title: sale.items[0]?.name ?? menuItems[0]?.name ?? "Bilinmiyor",
      reference: sale.id.slice(0, 12).toUpperCase(),
      dateText: new Date(sale.createdAt).toLocaleString("tr-TR"),
      owner: sale.createdBy,
      amount: sale.totalAmount,
      createdAtMs: new Date(sale.createdAt).getTime(),
    }));

    const expenseRows = expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: "expense" as const,
      title: expense.title,
      reference: expense.id.slice(0, 12).toUpperCase(),
      dateText: new Date(expense.expenseDate).toLocaleDateString("tr-TR"),
      owner: expense.supplier || "Bilinmiyor",
      amount: expense.amount,
      createdAtMs: new Date(expense.expenseDate).getTime(),
    }));

    return [...incomeRows, ...expenseRows].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [sales, expenses, menuItems]);

  const filteredRows = rows.filter((row) => {
    const typeMatch = filter === "all" ? true : filter === "income" ? row.type === "income" : row.type === "expense";
    if (!typeMatch) return false;

    const afterStart = startDate ? row.createdAtMs >= new Date(`${startDate}T00:00:00`).getTime() : true;
    const beforeEnd = endDate ? row.createdAtMs <= new Date(`${endDate}T23:59:59`).getTime() : true;

    return afterStart && beforeEnd;
  });

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);
    setStartDate(startIso);
    setEndDate(endIso);
  };

  return (
    <section className={`${panelClass} border border-slate-200/80 bg-white`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">İşlemler</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Son İşlemler</h2>
          <p className="mt-1 text-xs text-slate-500">Sistemdeki gelir ve gider hareketleri</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === "all" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === "income" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Gelir
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === "expense" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Gider
          </button>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              showFilters ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Filtre
          </button>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Toplam {filteredRows.length} işlem
          </span>
        </div>
      </div>

      {showFilters ? (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <button
            onClick={() => setQuickRange(1)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Bugün
          </button>
          <button
            onClick={() => setQuickRange(7)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Son 7 Gün
          </button>
          <button
            onClick={() => setQuickRange(30)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Son 30 Gün
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Başlangıç</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Bitiş</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400"
              />
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="w-full min-w-[740px] text-xs">
          <thead className="bg-slate-50">
            <tr className="text-left uppercase tracking-wide text-slate-500">
              <th className="rounded-l-xl px-3 py-2.5">Ürün</th>
              <th className="px-3 py-2.5">Fiş No</th>
              <th className="px-3 py-2.5">Tarih</th>
              <th className="px-3 py-2.5">Kaynak</th>
              <th className="rounded-r-xl px-3 py-2.5 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                  Bu filtrede işlem bulunmuyor.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-700">{row.title}</td>
                  <td className="px-3 py-2 text-slate-500">{row.reference}</td>
                  <td className="px-3 py-2 text-slate-500">{row.dateText}</td>
                  <td className="px-3 py-2 text-slate-600">{row.owner}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${row.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {row.type === "income" ? "+" : "-"}{tl.format(row.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
