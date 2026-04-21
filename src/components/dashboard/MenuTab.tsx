"use client";

import { MenuItem } from "@/lib/types";

export function MenuTab({
  panelClass,
  inputClass,
  menuForm,
  setMenuForm,
  createMenuItem,
  menuItems,
  tl,
  toggleMenuItem,
}: {
  panelClass: string;
  inputClass: string;
  menuForm: { name: string; category: string; price: string };
  setMenuForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; price: string }>>;
  createMenuItem: () => Promise<void>;
  menuItems: MenuItem[];
  tl: Intl.NumberFormat;
  toggleMenuItem: (item: MenuItem) => Promise<void>;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className={`${panelClass} border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40`}>
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Yeni Ürün</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Menüye Ürün Ekle</h2>
          <p className="mt-1 text-sm text-slate-500">Ürün adı, kategorisi ve fiyatını girerek menünüzü güncel tutun.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ürün Adı</label>
            <input className={inputClass} placeholder="Örn: Izgara Köfte" value={menuForm.name} onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
            <input className={inputClass} placeholder="Örn: Ana Yemek" value={menuForm.category} onChange={(e) => setMenuForm((prev) => ({ ...prev, category: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Satış Fiyatı</label>
            <input className={inputClass} placeholder="0" type="number" value={menuForm.price} onChange={(e) => setMenuForm((prev) => ({ ...prev, price: e.target.value }))} />
          </div>
          <button onClick={createMenuItem} className="w-full rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            Ürün Ekle
          </button>
        </div>
      </div>
      <div className={`${panelClass} lg:col-span-2`}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Menü</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Menü Listesi</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Toplam {menuItems.length} ürün
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="rounded-l-xl px-3 py-3">Ürün</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Fiyat</th>
                <th className="rounded-r-xl px-3 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-sm text-slate-500">
                    Menüde henüz ürün yok. Soldaki form ile ilk ürününüzü ekleyin.
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-3 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-3 py-3 text-slate-600">{item.category}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{tl.format(item.price)}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleMenuItem(item)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          item.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {item.active ? "Aktif" : "Pasif"}
                      </button>
                    </td>
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
