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
      <div className={panelClass}>
        <h2 className="mb-3 text-lg font-semibold">Gider Ekle</h2>
        <div className="space-y-2">
          <input className={inputClass} placeholder="Baslik" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
          <input className={inputClass} placeholder="Tedarikci" value={expenseForm.supplier} onChange={(e) => setExpenseForm((prev) => ({ ...prev, supplier: e.target.value }))} />
          <input className={inputClass} placeholder="Tutar" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
          <input className={inputClass} type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
          <textarea className={inputClass} placeholder="Not" value={expenseForm.note} onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))} />
          <button onClick={createExpense} className="w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700">
            Gider Kaydet
          </button>
        </div>
      </div>
      <div className={`${panelClass} lg:col-span-2`}>
        <h2 className="mb-3 text-lg font-semibold">Gider Listesi</h2>
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">Tarih</th>
                <th>Baslik</th>
                <th>Tedarikci</th>
                <th>Not</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-100">
                  <td className="py-2">{expense.expenseDate}</td>
                  <td>{expense.title}</td>
                  <td>{expense.supplier}</td>
                  <td>{expense.note || "-"}</td>
                  <td>{tl.format(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
