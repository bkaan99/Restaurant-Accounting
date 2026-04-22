"use client";

import { useState } from "react";
import { MenuItem } from "@/lib/types";

export function MenuTab({
  panelClass,
  inputClass,
  darkMode,
  menuForm,
  setMenuForm,
  createMenuItem,
  menuItems,
  tl,
  toggleMenuItem,
  deleteMenuItem,
  canManageMenu,
}: {
  panelClass: string;
  inputClass: string;
  darkMode?: boolean;
  menuForm: { name: string; category: string; price: string };
  setMenuForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; price: string }>>;
  createMenuItem: () => Promise<void>;
  menuItems: MenuItem[];
  tl: Intl.NumberFormat;
  toggleMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (item: MenuItem) => Promise<void>;
  canManageMenu: boolean;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const dm = darkMode ?? false;
  const activeCount = menuItems.filter((item) => item.active).length;
  const passiveCount = menuItems.length - activeCount;

  return (
    <section className="space-y-4">
      <div className={panelClass}>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Toplam</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>{menuItems.length}</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-emerald-400/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-emerald-300" : "text-emerald-700"}`}>Aktif</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-emerald-300" : "text-emerald-700"}`}>{activeCount}</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2.5 ${dm ? "border-white/10 bg-white/5" : "border-slate-300 bg-white"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Pasif</p>
            <p className={`mt-1 text-xl font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}>{passiveCount}</p>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dm ? "text-slate-400" : "text-slate-500"}`}>Menü</p>
            <h2 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Menü Listesi</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${dm ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              Toplam {menuItems.length} ürün
            </span>
            {canManageMenu ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Ürün Ekle
              </button>
            ) : (
              <span className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${dm ? "border-amber-400/30 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                Sadece görüntüleme
              </span>
            )}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className={dm ? "bg-white/5" : "bg-slate-50"}>
              <tr className={`text-left text-xs uppercase tracking-wide ${dm ? "text-slate-400" : "text-slate-500"}`}>
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
                  <td colSpan={5} className={`px-3 py-10 text-center text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>
                    Menüde henüz ürün yok. Soldaki form ile ilk ürününüzü ekleyin.
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.id} className={`border-b transition ${dm ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50/70"}`}>
                    <td className={`px-3 py-3 font-medium ${dm ? "text-slate-200" : "text-slate-800"}`}>{item.name}</td>
                    <td className={`px-3 py-3 ${dm ? "text-slate-300" : "text-slate-600"}`}>{item.category}</td>
                    <td className={`px-3 py-3 font-semibold ${dm ? "text-slate-100" : "text-slate-800"}`}>{tl.format(item.price)}</td>
                    <td className="px-3 py-3">
                      {canManageMenu ? (
                        <button
                          onClick={() => toggleMenuItem(item)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                            item.active
                              ? dm ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : dm ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {item.active ? "Aktif" : "Pasif"}
                        </button>
                      ) : (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.active
                            ? dm ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                            : dm ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"
                        }`}>
                          {item.active ? "Aktif" : "Pasif"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {canManageMenu ? (
                        <button
                          onClick={() => {
                            const ok = window.confirm(`"${item.name}" ürününü silmek istiyor musunuz?`);
                            if (ok) void deleteMenuItem(item);
                          }}
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${dm ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20" : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"}`}
                        >
                          Sil
                        </button>
                      ) : (
                        <span className={`text-xs ${dm ? "text-slate-500" : "text-slate-400"}`}>Yetki yok</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && canManageMenu ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-5 shadow-xl ${dm ? "border-white/10 bg-slate-900" : "border-indigo-100 bg-white"}`}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Yeni Ürün</p>
                <h3 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Menüye Ürün Ekle</h3>
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
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Ürün Adı</label>
                <input className={inputClass} placeholder="Örn: Izgara Köfte" value={menuForm.name} onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Kategori</label>
                <input className={inputClass} placeholder="Örn: Ana Yemek" value={menuForm.category} onChange={(e) => setMenuForm((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${dm ? "text-slate-300" : "text-slate-700"}`}>Satış Fiyatı</label>
                <input className={inputClass} placeholder="0" type="number" value={menuForm.price} onChange={(e) => setMenuForm((prev) => ({ ...prev, price: e.target.value }))} />
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
                    if (!menuForm.name || !menuForm.category || !menuForm.price) return;
                    await createMenuItem();
                    setShowAddModal(false);
                  }}
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Ürün Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
