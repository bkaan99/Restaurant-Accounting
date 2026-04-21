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
  deleteMenuItem,
}: {
  panelClass: string;
  inputClass: string;
  menuForm: { name: string; category: string; price: string };
  setMenuForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; price: string }>>;
  createMenuItem: () => Promise<void>;
  menuItems: MenuItem[];
  tl: Intl.NumberFormat;
  toggleMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (item: MenuItem) => Promise<void>;
}) {
  const activeCount = menuItems.filter((item) => item.active).length;
  const passiveCount = menuItems.length - activeCount;

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
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Toplam</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{menuItems.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Aktif</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pasif</p>
            <p className="mt-1 text-xl font-semibold text-slate-700">{passiveCount}</p>
          </div>
        </div>

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
                <th className="px-3 py-3">Durum</th>
                <th className="rounded-r-xl px-3 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
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
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => {
                          const ok = window.confirm(`"${item.name}" ürününü silmek istiyor musunuz?`);
                          if (ok) void deleteMenuItem(item);
                        }}
                        className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Sil
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
