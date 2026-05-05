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

  const featuredItems = useMemo(() => filteredItems.slice(0, 3), [filteredItems]);

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100">

      {/* Arka plan */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07090f]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.06] text-base">
              🍽️
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-violet-300/90">Chef Selection</p>
              <h1 className="text-sm font-black leading-tight text-white">{displayName}</h1>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-6">
        <section className="mb-6 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent p-5 shadow-2xl shadow-black/40">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Digital Tasting Menu</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Lezzeti sec, keyifle siparis et
              </h2>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Toplam urun</p>
              <p className="text-xl font-black text-white">{menuItems.length}</p>
            </div>
          </div>
        </section>

        {/* Arama */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Ürün veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-500 transition focus:border-violet-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* Kategori sekmeleri */}
        <div className="mb-7 flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const meta = getMeta(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-violet-400/40 bg-violet-500/20 text-white shadow-lg shadow-violet-600/20"
                    : "border-white/15 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-base leading-none">{cat === "Tümü" ? "✨" : meta.icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {featuredItems.length > 0 && (
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-300">One Cikanlar</h3>
              <span className="text-[11px] text-slate-500">Bugunun secimi</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {featuredItems.map((item) => (
                <article
                  key={`featured-${item.id}`}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <p className="text-[11px] font-semibold text-slate-400">{item.category}</p>
                  <h4 className="mt-2 line-clamp-1 text-base font-black text-white">{item.name}</h4>
                  <p className="mt-3 text-right text-sm font-black text-violet-300">{tl.format(item.price)}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* İçerik */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-4xl">
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
                  <div className={`mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${meta.gradient} px-4 py-3`}>
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="flex-1">
                      <h2 className={`text-sm font-black uppercase tracking-widest ${meta.light}`}>{category}</h2>
                      <p className="text-[10px] font-medium text-slate-500">{items.length} urun</p>
                    </div>
                  </div>

                  {/* Ürün kartları */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-violet-300/30"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <div className="absolute inset-y-3 left-3 w-1 rounded-full bg-violet-300/70 opacity-80 transition group-hover:bg-fuchsia-300" />
                        <div className="mb-3 ml-4 flex items-center justify-between">
                          <span className="rounded-lg border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">#{String(idx + 1).padStart(2, "0")}</span>
                        </div>

                        <div className="ml-4">
                          <p className="line-clamp-1 text-base font-black tracking-tight text-white">
                            {item.name}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400">
                              Sef onerisi
                            </span>
                            <span className={`rounded-xl border border-white/15 bg-black/20 px-3 py-1.5 text-sm font-black ${meta.light}`}>
                              {tl.format(item.price)}
                            </span>
                          </div>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg">
            🍽️
          </div>
          <p className="text-xs font-bold text-slate-500">{displayName}</p>
          <p className="text-[10px] text-slate-600">Fiyatlara KDV dahildir · Guncel menu</p>
        </div>
      </main>
    </div>
  );
}
