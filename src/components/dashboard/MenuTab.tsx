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
      <div className={panelClass}>
        <h2 className="mb-3 text-lg font-semibold">Menuye Urun Ekle</h2>
        <div className="space-y-2">
          <input className={inputClass} placeholder="Urun Adi" value={menuForm.name} onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))} />
          <input className={inputClass} placeholder="Kategori" value={menuForm.category} onChange={(e) => setMenuForm((prev) => ({ ...prev, category: e.target.value }))} />
          <input className={inputClass} placeholder="Satis Fiyati" type="number" value={menuForm.price} onChange={(e) => setMenuForm((prev) => ({ ...prev, price: e.target.value }))} />
          <button onClick={createMenuItem} className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
            Urun Ekle
          </button>
        </div>
      </div>
      <div className={`${panelClass} lg:col-span-2`}>
        <h2 className="mb-3 text-lg font-semibold">Menu Listesi</h2>
        <div className="overflow-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">Urun</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.name}</td>
                  <td>{item.category}</td>
                  <td>{tl.format(item.price)}</td>
                  <td>
                    <button
                      onClick={() => toggleMenuItem(item)}
                      className={`rounded-md px-2 py-1 text-xs ${item.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
                    >
                      {item.active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
