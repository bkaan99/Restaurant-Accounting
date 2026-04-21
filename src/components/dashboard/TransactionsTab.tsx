"use client";

import { Fragment, useMemo, useState } from "react";
import { Expense, Sale } from "@/lib/types";

export function TransactionsTab({
  panelClass,
  sales,
  expenses,
  tl,
}: {
  panelClass: string;
  sales: Sale[];
  expenses: Expense[];
  tl: Intl.NumberFormat;
}) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<15 | 30 | 50>(15);

  const rows = useMemo(() => {
    const incomeRows = sales.map((sale) => ({
      id: `income-${sale.id}`,
      type: "income" as const,
      title: `Sipariş (${sale.items.length} kalem)`,
      reference: sale.receiptNo,
      dateText: new Date(sale.createdAt).toLocaleString("tr-TR"),
      owner: sale.createdBy,
      amount: sale.totalAmount,
      createdAtMs: new Date(sale.createdAt).getTime(),
      items: sale.items,
      note: "",
    }));

    const expenseRows = expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: "expense" as const,
      title: expense.title,
      reference: expense.receiptNo,
      dateText: new Date(expense.expenseDate).toLocaleDateString("tr-TR"),
      owner: expense.supplier || "Bilinmiyor",
      amount: expense.amount,
      createdAtMs: new Date(expense.expenseDate).getTime(),
      items: [],
      note: expense.note || "",
    }));

    return [...incomeRows, ...expenseRows].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [sales, expenses]);

  const filteredRows = rows.filter((row) => {
    const typeMatch = filter === "all" ? true : filter === "income" ? row.type === "income" : row.type === "expense";
    if (!typeMatch) return false;

    const afterStart = startDate ? row.createdAtMs >= new Date(`${startDate}T00:00:00`).getTime() : true;
    const beforeEnd = endDate ? row.createdAtMs <= new Date(`${endDate}T23:59:59`).getTime() : true;

    return afterStart && beforeEnd;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    <section className={`${panelClass} border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-white`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">İşlemler</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Gelir / Gider Akışı</h2>
          <p className="mt-1 text-xs text-slate-500">Sistemdeki tüm finansal hareketler tek ekranda</p>
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
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Toplam {filteredRows.length} işlem
          </span>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sayfa Boyutu</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as 15 | 30 | 50);
                setPage(1);
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {showFilters ? (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-2xl border border-indigo-100 bg-white px-3 py-2.5 shadow-sm">
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
          <thead className="bg-slate-50/90">
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
              paginatedRows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    onClick={() => setExpandedRowId((prev) => (prev === row.id ? null : row.id))}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-indigo-50/40"
                  >
                    <td className="px-3 py-2 text-slate-700">{row.title}</td>
                    <td className="px-3 py-2 text-slate-500">{row.reference}</td>
                    <td className="px-3 py-2 text-slate-500">{row.dateText}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {row.owner}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right font-semibold ${row.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {row.type === "income" ? "+" : "-"}{tl.format(row.amount)}
                    </td>
                  </tr>
                  {expandedRowId === row.id ? (
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <td colSpan={5} className="px-3 py-3">
                        {row.type === "income" ? (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sipariş İçeriği</p>
                            <div className="space-y-1.5">
                              {row.items.map((item) => (
                                <div key={`${row.id}-${item.menuItemId}-${item.name}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
                                  <span className="text-slate-700">{item.name} x {item.qty}</span>
                                  <span className="font-semibold text-slate-800">{tl.format(item.lineTotal)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Gider Detayı</p>
                            <p className="text-xs text-slate-600">{row.note || "Bu gider için not bulunmuyor."}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">
          Sayfa {currentPage} / {totalPages} - Toplam {filteredRows.length} kayıt
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Önceki
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </section>
  );
}
