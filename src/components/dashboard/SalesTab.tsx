"use client";

import { MenuItem, Sale } from "@/lib/types";

export function SalesTab({
  panelClass,
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
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className={`${panelClass} lg:col-span-2`}>
        <h2 className="mb-3 text-lg font-semibold">Menu Sec ve Siparis Olustur</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {activeMenu.map((item) => (
            <button key={item.id} onClick={() => addToCart(item.id)} className="rounded-xl border border-slate-200 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-50">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
              <p className="text-sm text-blue-700">{tl.format(item.price)}</p>
            </button>
          ))}
        </div>
      </div>
      <div className={panelClass}>
        <h2 className="mb-3 text-lg font-semibold">Siparis Ozeti</h2>
        <div className="space-y-2">
          {Object.entries(cart).length === 0 ? <p className="text-sm text-gray-500">Sepet bos.</p> : null}
          {Object.entries(cart).map(([id, qty]) => {
            const item = menuItems.find((m) => m.id === id);
            if (!item) return null;
            return (
              <div key={id} className="flex items-center justify-between rounded-xl border border-slate-200 p-2 text-sm">
                <span>{item.name} x {qty}</span>
                <span>{tl.format(item.price * qty)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-lg font-semibold">Toplam: {tl.format(orderTotal)}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={createSale} className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700">
            Siparisi Kaydet
          </button>
          <button onClick={clearCart} className="rounded-xl border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100">
            Temizle
          </button>
        </div>
      </div>
      <div className={`${panelClass} lg:col-span-3`}>
        <h2 className="mb-3 text-lg font-semibold">Son Siparisler</h2>
        <div className="overflow-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">Tarih</th>
                <th>Personel</th>
                <th>Kalem</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100">
                  <td className="py-2">{new Date(sale.createdAt).toLocaleString("tr-TR")}</td>
                  <td>{sale.createdBy}</td>
                  <td>{sale.items.map((item) => `${item.name} (${item.qty})`).join(", ")}</td>
                  <td>{tl.format(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
