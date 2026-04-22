"use client";

import { MenuItem, Sale } from "@/lib/types";

export function SalesTab({
  panelClass,
  inputClass,
  darkMode,
  activeMenu,
  menuItems,
  cart,
  tl,
  orderTotal,
  addToCart,
  createSale,
  clearCart,
  sales,
}: {
  panelClass: string;
  inputClass: string;
  darkMode?: boolean;
  activeMenu: MenuItem[];
  menuItems: MenuItem[];
  cart: Record<string, number>;
  tl: Intl.NumberFormat;
  orderTotal: number;
  addToCart: (menuItemId: string) => void;
  createSale: () => Promise<void>;
  clearCart: () => void;
  sales: Sale[];
}) {
  const dm = darkMode ?? false;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Ürün seçim paneli */}
      <div className={`${panelClass} lg:col-span-2 ${dm ? "border-white/10 bg-white/5" : "border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30"}`}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-400">Sipariş</p>
            <h2 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Ürün Seç ve Sipariş Oluştur</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${dm ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
            Aktif {activeMenu.length} ürün
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {activeMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item.id)}
              className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                dm
                  ? "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-indigo-500/10"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
              }`}
            >
              <p className={`font-medium ${dm ? "text-slate-100" : "text-slate-800"}`}>{item.name}</p>
              <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>{item.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-indigo-400">{tl.format(item.price)}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${dm ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-600"}`}>
                  Ekle +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sipariş özeti */}
      <div className={`${panelClass} ${dm ? "border-white/10 bg-white/5" : "border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30"}`}>
        <h2 className={`mb-3 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Sipariş Özeti</h2>
        <div className="space-y-2">
          {Object.entries(cart).length === 0 ? (
            <p className={`rounded-xl border p-3 text-sm ${dm ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
              Sepet boş.
            </p>
          ) : null}
          {Object.entries(cart).map(([id, qty]) => {
            const item = menuItems.find((m) => m.id === id);
            if (!item) return null;
            return (
              <div
                key={id}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-sm ${
                  dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}
              >
                <span className={dm ? "text-slate-300" : "text-slate-700"}>{item.name} x {qty}</span>
                <span className={`font-semibold ${dm ? "text-slate-100" : "text-slate-800"}`}>{tl.format(item.price * qty)}</span>
              </div>
            );
          })}
        </div>
        <div className={`mt-3 rounded-xl border px-3 py-2 ${dm ? "border-emerald-400/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dm ? "text-emerald-300" : "text-emerald-700"}`}>Toplam</p>
          <p className={`mt-1 text-lg font-semibold ${dm ? "text-emerald-300" : "text-emerald-700"}`}>{tl.format(orderTotal)}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={createSale} className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Siparişi Kaydet
          </button>
          <button
            onClick={clearCart}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              dm ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Son siparişler tablosu */}
      <div className={`${panelClass} lg:col-span-3 ${dm ? "border-white/10 bg-white/5" : ""}`}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className={`text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Son Siparişler</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${dm ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            Toplam {sales.length} sipariş
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className={dm ? "bg-white/5" : "bg-slate-50"}>
              <tr className={`text-left text-xs uppercase tracking-wide ${dm ? "text-slate-400" : "text-slate-500"}`}>
                <th className="rounded-l-xl px-3 py-2.5">Tarih</th>
                <th className="px-3 py-2.5">Personel</th>
                <th className="px-3 py-2.5">Kalem</th>
                <th className="rounded-r-xl px-3 py-2.5">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className={`border-b transition ${dm ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50/70"}`}
                >
                  <td className={`px-3 py-2.5 ${dm ? "text-slate-400" : "text-slate-500"}`}>{new Date(sale.createdAt).toLocaleString("tr-TR")}</td>
                  <td className={`px-3 py-2.5 ${dm ? "text-slate-200" : "text-slate-700"}`}>{sale.createdBy}</td>
                  <td className={`px-3 py-2.5 ${dm ? "text-slate-300" : "text-slate-600"}`}>{sale.items.map((item) => `${item.name} (${item.qty})`).join(", ")}</td>
                  <td className="px-3 py-2.5 font-semibold text-emerald-400">{tl.format(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
