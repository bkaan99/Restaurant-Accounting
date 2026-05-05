"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function MenuClient({
  menuItems,
  restaurantName,
}: {
  menuItems: MenuItem[];
  restaurantName: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = restaurantName || "Restaurant";

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)));
    return ["Tümü", ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(m => m.active);
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
    <div className="min-h-screen bg-[#fafafa] text-slate-800 selection:bg-violet-500/10 font-sans">
      {/* Background Ornaments (Light) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-600/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(black 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Header Section */}
      <header className="relative z-10 flex flex-col items-center pt-16 pb-12">
        <Link href="/" className="absolute top-8 left-8 flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-white/50 shadow-sm transition hover:bg-white/80">
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-4xl sm:text-5xl text-violet-600" style={{ fontFamily: '"Brush Script MT", cursive' }}>
            {displayName}
          </p>
          <h1 className="mt-2 text-7xl sm:text-8xl font-black uppercase tracking-tighter text-slate-900">
            MENU
          </h1>
          <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-violet-600 shadow-lg shadow-violet-100" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        {/* Controls */}
        <div className="mb-16 flex flex-col items-center gap-8">
          <div className="flex h-12 w-full max-w-sm items-center rounded-2xl border border-black/5 bg-white/50 px-4 backdrop-blur-md shadow-sm focus-within:border-violet-500/50">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Ürün Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-3 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                    : "bg-white/50 text-slate-500 border border-black/5 hover:bg-white hover:text-slate-800 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic font-medium">Aradığınız lezzet bulunamadı...</div>
        ) : (
          <div className="space-y-20">
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} className="relative">
                {/* Category Header */}
                <div className="mb-10 flex items-center justify-center">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                  <h2 className="px-8 text-xl font-black uppercase tracking-[0.3em] text-slate-800">
                    {category}
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                </div>

                {/* Items Box with Dashed Border Aesthetic */}
                <div className="relative rounded-[2.5rem] border border-dashed border-black/10 bg-white/40 p-8 sm:p-12 shadow-sm transition-all hover:border-violet-500/30">
                  <div className="grid gap-8 sm:grid-cols-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex-1">
                          <h3 className="text-base font-black tracking-tight text-slate-900 transition-colors group-hover:text-violet-600">
                            {item.name}
                          </h3>
                          <div className="mt-1 h-[1px] w-full border-t border-dashed border-black/5" />
                        </div>
                        
                        <div className="ml-6 flex shrink-0 items-center">
                          <div className="relative">
                            <span className="relative text-lg font-black tracking-tighter text-violet-600">
                              {tl.format(item.price).replace(",00", "").replace("₺", "")} TL
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative Icon */}
                <div className="absolute -bottom-5 -right-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-xl text-2xl">
                   {category.includes("İçecek") ? "🥤" : category.includes("Tatlı") ? "🍮" : "🍽️"}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-40 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Premium Experience at {displayName}
          </p>
        </footer>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');
        
        h1 {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
