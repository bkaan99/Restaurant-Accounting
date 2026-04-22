"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";

export function ExpensesTab({
  panelClass,
  inputClass,
  darkMode,
  expenseForm,
  setExpenseForm,
  createExpense,
  expenses,
  tl,
}: {
  panelClass: string;
  inputClass: string;
  darkMode?: boolean;
  expenseForm: { title: string; supplier: string; amount: string; expenseDate: string; note: string };
  setExpenseForm: React.Dispatch<React.SetStateAction<{ title: string; supplier: string; amount: string; expenseDate: string; note: string }>>;
  createExpense: () => Promise<void>;
  expenses: Expense[];
  tl: Intl.NumberFormat;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const dm = darkMode ?? false;
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="space-y-4">
      <div className={panelClass}>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Toplam</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>{expenses.length}</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-orange-400/20 bg-orange-500/10" : "border-orange-200 bg-orange-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-orange-300" : "text-orange-700"}`}>Gider Tutarı</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-orange-300" : "text-orange-700"}`}>{tl.format(totalAmount)}</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-white/10 bg-white/5" : "border-slate-300 bg-white"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Bu Ay</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}>{new Date().toLocaleDateString("tr-TR", { month: "long" })}</p>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Kayıtlar</p>
            <h2 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Gider Listesi</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${dm ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              Toplam {expenses.length} kayıt
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              + Gider Ekle
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className={dm ? "bg-white/5" : "bg-slate-50"}>
              <tr className={`text-left text-xs uppercase tracking-wide ${dm ? "text-slate-400" : "text-slate-500"}`}>
                <th className="rounded-l-xl px-3 py-3">Tarih</th>
                <th className="px-3 py-3">Başlık</th>
                <th className="px-3 py-3">Tedarikçi</th>
                <th className="px-3 py-3">Not</th>
                <th className="rounded-r-xl px-3 py-3">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-3 py-10 text-center text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>
                    Henüz gider kaydı yok. Soldaki formu kullanarak ilk kaydınızı oluşturun.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className={`border-b transition ${dm ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50/70"}`}>
                    <td className={`px-3 py-3 ${dm ? "text-slate-400" : "text-slate-600"}`}>{expense.expenseDate}</td>
                    <td className={`px-3 py-3 font-medium ${dm ? "text-slate-200" : "text-slate-800"}`}>{expense.title}</td>
                    <td className={`px-3 py-3 ${dm ? "text-slate-300" : "text-slate-600"}`}>{expense.supplier}</td>
                    <td className={`max-w-[240px] truncate px-3 py-3 ${dm ? "text-slate-400" : "text-slate-500"}`}>{expense.note || "-"}</td>
                    <td className={`px-3 py-3 font-semibold ${dm ? "text-slate-100" : "text-slate-800"}`}>{tl.format(expense.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-5 shadow-xl ${dm ? "border-white/10 bg-slate-900" : "border-orange-100 bg-white"}`}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Yeni Kayıt</p>
                <h3 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Gider Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`rounded-lg px-2 py-1 text-sm transition ${dm ? "text-slate-400 hover:bg-white/10 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Başlık</label>
                <input className={inputClass} placeholder="Örn: Sebze Alımı" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Tedarikçi</label>
                <input className={inputClass} placeholder="Örn: Marmara Gıda" value={expenseForm.supplier} onChange={(e) => setExpenseForm((prev) => ({ ...prev, supplier: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Tutar</label>
                  <input className={inputClass} placeholder="0" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Tarih</label>
                  <input className={inputClass} type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Not</label>
                <textarea className={`${inputClass} min-h-[96px] resize-none`} placeholder="İsteğe bağlı açıklama..." value={expenseForm.note} onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))} />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${dm ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                >
                  Vazgeç
                </button>
                <button
                  onClick={async () => {
                    if (!expenseForm.title || !expenseForm.amount || !expenseForm.expenseDate) return;
                    await createExpense();
                    setShowAddModal(false);
                  }}
                  className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  Gider Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
