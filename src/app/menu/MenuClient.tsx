"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const CATEGORY_ICONS: Record<string, string> = {
  "Ana Yemek": "🍽️",
  "Icecek": "🥤",
  "İçecek": "🥤",
  "Tatli": "🍮",
  "Tatlı": "🍮",
  "Corba": "🍲",
  "Çorba": "🍲",
  "Salata": "🥗",
  "Atistirmalik": "🥨",
  "Atıştırmalık": "🥨",
  "Kahvalti": "🍳",
  "Kahvaltı": "🍳",
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "🍴";
}

export function MenuClient({
  menuItems,
  restaurantName,
}: {
  menuItems: MenuItem[];
  restaurantName: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ["Tümü", ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "Tümü") {
      items = items.filter((m) => m.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== "Tümü") {
      return { [activeCategory]: filteredItems };
    }
    return filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      acc[item.category] = [...(acc[item.category] ?? []), item];
      return acc;
    }, {});
  }, [filteredItems, activeCategory]);

  const displayName = restaurantName || "Restoran";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Arka plan efektleri */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
              Dijital Menü
            </p>
            <h1 className="text-lg font-black tracking-tight text-white">
              {displayName}
            </h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {/* Arama */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>

        {/* Kategori filtreleri */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {cat !== "Tümü" && (
                <span className="text-sm">{getCategoryIcon(cat)}</span>
              )}
              {cat}
            </button>
          ))}
        </div>

        {/* Menü içeriği */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-base font-bold text-slate-300">Ürün bulunamadı</p>
            <p className="text-sm text-slate-500">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
                    {category}
                  </h2>
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {items.length} ürün
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5 transition hover:bg-white/[0.06]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-100">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {item.category}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <span className="rounded-xl bg-indigo-500/10 px-3 py-1.5 text-sm font-black text-indigo-300 ring-1 ring-indigo-500/20">
                          {tl.format(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[11px] font-medium text-slate-600">
            {displayName} · Dijital Menü
          </p>
          <p className="mt-1 text-[10px] text-slate-700">
            Fiyatlar KDV dahildir
          </p>
        </div>
      </main>
    </div>
  );
}
