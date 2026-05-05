"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const CATEGORY_META: Record<string, { icon: React.ReactNode; gradient: string; color: string }> = {
  "Ana Yemek": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, 
    gradient: "from-amber-500/20 to-orange-600/10",
    color: "text-amber-400" 
  },
  "İçecek": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
    gradient: "from-sky-500/20 to-blue-600/10",
    color: "text-sky-400" 
  },
  "Icecek": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
    gradient: "from-sky-500/20 to-blue-600/10",
    color: "text-sky-400" 
  },
  "Tatlı": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, 
    gradient: "from-rose-500/20 to-pink-600/10",
    color: "text-rose-400" 
  },
  "Tatli": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, 
    gradient: "from-rose-500/20 to-pink-600/10",
    color: "text-rose-400" 
  },
  "Çorba": { 
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, 
    gradient: "from-emerald-500/20 to-teal-600/10",
    color: "text-emerald-400" 
  },
};

const DEFAULT_META = { 
  icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, 
  gradient: "from-violet-500/20 to-indigo-600/10",
  color: "text-violet-400" 
};

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = restaurantName || "Restoran";

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
    <div className="min-h-screen bg-[#020408] text-slate-100 selection:bg-violet-500/30">
      {/* Background Ornaments */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      {/* Floating Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "border-b border-white/5 bg-black/60 py-3 backdrop-blur-2xl" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/20 transition hover:scale-105 active:scale-95">
              <svg className="h-5 w-5 text-white transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">{displayName}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/80">Premium Experience</p>
            </div>
          </div>
          
          <div className="relative flex items-center gap-3">
             <div className="hidden h-8 w-px bg-white/10 sm:block" />
             <div className="flex h-10 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 backdrop-blur-md transition-all focus-within:border-violet-500/50 focus-within:bg-white/[0.06]">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-24 bg-transparent pl-2 text-xs font-medium text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:w-40 sm:w-32 sm:focus:w-48"
                />
             </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-4">
        {/* Hero Section */}
        <section className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Şu an Açık</span>
          </div>
          <h2 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-black tracking-tighter text-transparent sm:text-6xl">
            Tadına Doyum Olmaz <br className="hidden sm:block" /> Bir Yolculuk.
          </h2>
          <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
            En taze malzemelerle hazırlanan, şeflerimizin özel dokunuşlarıyla hayat bulan benzersiz lezzetlerimizi keşfedin.
          </p>
        </section>

        {/* Categories Bar */}
        <div className="sticky top-20 z-40 mb-10 -mx-6 overflow-hidden px-6">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => {
              const meta = getMeta(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "border-violet-500/30 bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                      : "border-white/5 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                  }`}
                >
                  <span className={`${isActive ? "text-white" : meta.color}`}>{meta.icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/5 bg-white/[0.02] text-4xl grayscale opacity-50">
              🍽️
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-200">Aradığınız lezzet bulunamadı</h3>
              <p className="mt-2 text-sm text-slate-500">Lütfen farklı bir kelime ile tekrar deneyin.</p>
            </div>
            <button 
              onClick={() => {setSearchQuery(""); setActiveCategory("Tümü")}}
              className="rounded-xl bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Tümünü Göster
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedItems).map(([category, items]) => {
              const meta = getMeta(category);
              return (
                <section key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${meta.color}`}>{category}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{category}</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{items.length} Çeşit</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/40"
                      >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-violet-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">#{String(idx + 1).padStart(2, "0")}</span>
                              {idx === 0 && (
                                <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-500">
                                  <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  Popüler
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-black tracking-tight text-white transition-colors group-hover:text-violet-200">{item.name}</h4>
                            <p className="mt-2 text-xs font-medium text-slate-500">Özel baharatlar ve taze malzemeler ile hazırlanır.</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors group-hover:bg-violet-500/10 group-hover:text-violet-400">
                              {meta.icon}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <div className="flex -space-x-1">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-5 w-5 rounded-full border-2 border-[#020408] bg-slate-800" />
                            ))}
                            <span className="pl-3 text-[10px] font-bold text-slate-600">+12 kişi beğendi</span>
                          </div>
                          <div className="relative">
                            <div className="absolute -inset-2 rounded-xl bg-violet-600/20 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative text-xl font-black tracking-tighter text-white">
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
        <footer className="mt-32 border-t border-white/5 pt-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 text-2xl shadow-xl shadow-violet-900/20">
            🍽️
          </div>
          <h4 className="text-xl font-black text-white">{displayName}</h4>
          <p className="mt-2 text-sm font-medium text-slate-500">Unutulmaz bir lezzet deneyimi için buradayız.</p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-white/5 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:flex-row sm:gap-8">
            <span>© 2026 {displayName}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-800 sm:block" />
            <span>Dijital Menü Sistemi</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-800 sm:block" />
            <span>Fiyatlara KDV Dahildir</span>
          </div>
        </footer>
      </main>

      {/* Styles for no-scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
