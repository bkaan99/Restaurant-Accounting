"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const CATEGORY_META: Record<string, { icon: string; gradient: string; light: string }> = {
  "Ana Yemek":      { icon: "🍽️", gradient: "from-orange-500/20 to-red-500/10",    light: "text-orange-300" },
  "Icecek":         { icon: "🥤", gradient: "from-cyan-500/20 to-blue-500/10",      light: "text-cyan-300" },
  "İçecek":         { icon: "🥤", gradient: "from-cyan-500/20 to-blue-500/10",      light: "text-cyan-300" },
  "Tatli":          { icon: "🍮", gradient: "from-pink-500/20 to-rose-500/10",      light: "text-pink-300" },
  "Tatlı":          { icon: "🍮", gradient: "from-pink-500/20 to-rose-500/10",      light: "text-pink-300" },
  "Corba":          { icon: "🍲", gradient: "from-amber-500/20 to-yellow-500/10",   light: "text-amber-300" },
  "Çorba":          { icon: "🍲", gradient: "from-amber-500/20 to-yellow-500/10",   light: "text-amber-300" },
  "Salata":         { icon: "🥗", gradient: "from-emerald-500/20 to-green-500/10",  light: "text-emerald-300" },
  "Atistirmalik":   { icon: "🥨", gradient: "from-yellow-500/20 to-amber-500/10",   light: "text-yellow-300" },
  "Atıştırmalık":   { icon: "🥨", gradient: "from-yellow-500/20 to-amber-500/10",   light: "text-yellow-300" },
  "Kahvalti":       { icon: "🍳", gradient: "from-lime-500/20 to-green-500/10",     light: "text-lime-300" },
  "Kahvaltı":       { icon: "🍳", gradient: "from-lime-500/20 to-green-500/10",     light: "text-lime-300" },
};

const DEFAULT_META = { icon: "🍴", gradient: "from-indigo-500/20 to-violet-500/10", light: "text-indigo-300" };

function getMeta(cat: string) {
  return CATEGORY_META[cat] ?? DEFAULT_META;
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

  const displayName = restaurantName || "Restoran";

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ["Tümü", ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "Tümü") items = items.filter((m) => m.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== "Tümü") return { [activeCategory]: filteredItems };
    return filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      acc[item.category] = [...(acc[item.category] ?? []), item];
      return acc;
    }, {});
  }, [filteredItems, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">

      {/* Arka plan */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-600/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0f]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base shadow-lg shadow-indigo-500/20">
              🍽️
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Dijital Menü</p>
              <h1 className="text-sm font-black tracking-tight text-white leading-tight">{displayName}</h1>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-6">

        {/* Arama */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Ürün veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        {/* Kategori kartları */}
        <div className="mb-7 flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const meta = getMeta(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 transition-all ${
                  isActive
                    ? "border-indigo-500/40 bg-gradient-to-b from-indigo-600/30 to-indigo-600/10 shadow-lg shadow-indigo-500/10"
                    : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-xl leading-none">{cat === "Tümü" ? "✨" : meta.icon}</span>
                <span className={`text-[10px] font-black tracking-wide ${isActive ? "text-indigo-300" : "text-slate-500"}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* İçerik */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] text-4xl">
              🔍
            </div>
            <div>
              <p className="text-base font-bold text-slate-300">Ürün bulunamadı</p>
              <p className="mt-1 text-sm text-slate-600">Farklı bir arama deneyin</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedItems).map(([category, items]) => {
              const meta = getMeta(category);
              return (
                <section key={category}>
                  {/* Kategori başlığı */}
                  <div className={`mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-r ${meta.gradient} px-4 py-3`}>
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="flex-1">
                      <h2 className={`text-sm font-black uppercase tracking-widest ${meta.light}`}>{category}</h2>
                      <p className="text-[10px] font-medium text-slate-600">{items.length} ürün</p>
                    </div>
                  </div>

                  {/* Ürün kartları */}
                  <div className="space-y-2.5">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.05]"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {/* Numara */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[11px] font-black text-slate-600">
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {/* Bilgi */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                            {item.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-600">{item.category}</span>
                          </div>
                        </div>

                        {/* Fiyat */}
                        <div className="shrink-0">
                          <span className={`rounded-xl bg-gradient-to-br ${meta.gradient} border border-white/[0.08] px-3.5 py-2 text-sm font-black ${meta.light}`}>
                            {tl.format(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-lg">
            🍽️
          </div>
          <p className="text-xs font-bold text-slate-600">{displayName}</p>
          <p className="text-[10px] text-slate-700">Fiyatlarımıza KDV dahildir · Güncel menü</p>
        </div>
      </main>
    </div>
  );
}
