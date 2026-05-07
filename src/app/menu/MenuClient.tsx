"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
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
    <div
      suppressHydrationWarning
      className={`min-h-screen selection:bg-violet-500/10 font-sans transition-colors duration-500 ${
        isDark ? "bg-[#020408] text-slate-100" : "bg-[#fafafa] text-slate-800"
      }`}
    >
      {/* Background Ornaments */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-violet-600/10" : "bg-violet-600/5"}`} />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-fuchsia-600/10" : "bg-fuchsia-600/5"}`} />
        <div
          className={`absolute inset-0 ${isDark ? "text-white/30 opacity-[0.03]" : "text-black/30 opacity-[0.05]"}`}
          style={{
            backgroundImage: "radial-gradient(currentColor 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${
          isDark ? "border-white/5 bg-black/20" : "border-black/5 bg-white/40"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border ${
              isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/70"
            }`}>
              <Image src="/logo.png" alt={`${displayName} logosu`} width={40} height={40} className="h-full w-full object-contain p-1" />
            </div>
            <span className={`text-sm font-black tracking-tight sm:text-base ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</span>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-violet-600"}`}>Menü</span>
            <Link href="/contact" className={`text-xs font-bold uppercase tracking-widest transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-violet-600"}`}>
              İletişim
            </Link>
            <button
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  : "border-black/10 bg-white/60 text-slate-600 hover:bg-white"
              }`}
              title="Temayı değiştir"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="relative z-10 flex flex-col items-center pt-28 pb-12">
        <Link href="/" className="absolute top-8 left-8 flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.03] shadow-sm transition hover:bg-white/80 dark:hover:bg-white/[0.08]">
          <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-4xl sm:text-5xl text-violet-600 dark:text-violet-400" style={{ fontFamily: '"Brush Script MT", cursive' }}>
            {displayName}
          </p>
          <h1 className={`mt-2 text-7xl sm:text-8xl font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
            MENU
          </h1>
          <div className={`mx-auto mt-4 h-1.5 w-24 rounded-full shadow-lg ${isDark ? "bg-violet-500 shadow-violet-900/40" : "bg-violet-600 shadow-violet-200"}`} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        {/* Controls */}
        <div className="mb-16 flex flex-col items-center gap-8">
          <div className={`flex h-12 w-full max-w-sm items-center rounded-2xl border px-4 backdrop-blur-md shadow-sm focus-within:border-violet-500/50 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-white/50"}`}>
            <svg className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Ürün Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent pl-3 text-xs font-medium outline-none ${isDark ? "text-slate-200 placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"}`}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
                    : isDark
                    ? "bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.08] hover:text-slate-200 shadow-sm"
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
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 italic font-medium">Aradığınız lezzet bulunamadı...</div>
        ) : (
          <div className="space-y-20">
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} className="relative">
                {/* Category Header */}
                <div className="mb-10 flex items-center justify-center">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                  <h2 className={`px-8 text-xl font-black uppercase tracking-[0.3em] ${isDark ? "text-violet-300/90" : "text-slate-800"}`}>
                    {category}
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                </div>

                {/* Items Box with Premium Menu Card Aesthetic */}
                <div className={`relative overflow-hidden rounded-[2.2rem] border p-7 sm:p-10 shadow-sm transition-all ${
                  isDark 
                    ? "border-white/15 bg-gradient-to-b from-white/[0.06] via-white/[0.04] to-white/[0.03] shadow-none backdrop-blur-sm" 
                    : "border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white"
                }`}>
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-[0.14] ${
                      isDark ? "text-white/40" : "text-slate-500/30"
                    }`}
                    style={{
                      backgroundImage: "radial-gradient(currentColor 0.6px, transparent 0.6px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  <div className="grid gap-8 sm:grid-cols-1">
                    {items.map((item) => (
                      <div key={item.id} className="relative flex items-start justify-between gap-6 group">
                        <div className="flex-1">
                          <h3 className={`text-[1.17rem] font-black tracking-tight transition-colors ${
                            isDark ? "text-[#ffb078] group-hover:text-[#ffc497]" : "text-[#a54d2f] group-hover:text-[#8f3d24]"
                          }`}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className={`mt-1 text-[0.84rem] font-semibold leading-relaxed ${
                              isDark ? "text-[#f2d4c2]/85" : "text-[#8d5f4c]"
                            }`}>
                              {item.description}
                            </p>
                          )}
                          <div className={`mt-2 h-[1px] w-full border-t border-dashed ${
                            isDark ? "border-[#ffb078]/25" : "border-[#be8a74]/35"
                          }`} />
                        </div>
                        
                        <div className="flex shrink-0 items-center pt-0.5">
                          <div className="relative min-w-[84px] text-right">
                            <span className={`relative text-[1.35rem] font-black tracking-tight ${
                              isDark ? "text-[#ffb078]" : "text-[#a54d2f]"
                            }`}>
                              {tl.format(item.price).replace(",00", "").replace("₺", "")} TL
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative Icon */}
                <div className="absolute -bottom-5 -right-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#07090f] shadow-xl dark:shadow-2xl text-2xl">
                   {category.includes("İçecek") ? "🥤" : category.includes("Tatlı") ? "🍮" : "🍽️"}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-40 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">
            {displayName} Premium Deneyimi
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
