"use client";

import { Expense } from "@/lib/types";

export function ExpensesTab({
  panelClass,
  inputClass,
  expenseForm,
  setExpenseForm,
  createExpense,
  expenses,
  tl,
}: {
  panelClass: string;
  inputClass: string;
  expenseForm: { title: string; supplier: string; amount: string; expenseDate: string; note: string };
  setExpenseForm: React.Dispatch<React.SetStateAction<{ title: string; supplier: string; amount: string; expenseDate: string; note: string }>>;
  createExpense: () => Promise<void>;
  expenses: Expense[];
  tl: Intl.NumberFormat;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className={`${panelClass} border border-orange-100 bg-gradient-to-b from-white to-orange-50/40`}>
        <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Yeni Kayıt</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Gider Ekle</h2>
          <p className="mt-1 text-sm text-slate-500">Tedarik, operasyon ve sabit giderlerinizi tek yerden kaydedin.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Başlık</label>
            <input className={inputClass} placeholder="Örn: Sebze Alımı" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tedarikçi</label>
            <input className={inputClass} placeholder="Örn: Marmara Gıda" value={expenseForm.supplier} onChange={(e) => setExpenseForm((prev) => ({ ...prev, supplier: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tutar</label>
              <input className={inputClass} placeholder="0" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tarih</label>
              <input className={inputClass} type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Not</label>
            <textarea className={`${inputClass} min-h-[96px] resize-none`} placeholder="İsteğe bağlı açıklama..." value={expenseForm.note} onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))} />
          </div>
          <button onClick={createExpense} className="w-full rounded-xl bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700">
            Gider Kaydet
          </button>
        </div>
      </div>
      <div className={`${panelClass} lg:col-span-2`}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kayıtlar</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Gider Listesi</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Toplam {expenses.length} kayıt
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
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
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                    Henüz gider kaydı yok. Soldaki formu kullanarak ilk kaydınızı oluşturun.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-3 py-3 text-slate-600">{expense.expenseDate}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{expense.title}</td>
                    <td className="px-3 py-3 text-slate-600">{expense.supplier}</td>
                    <td className="max-w-[240px] truncate px-3 py-3 text-slate-500">{expense.note || "-"}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{tl.format(expense.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
