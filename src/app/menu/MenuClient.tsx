"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MenuItem } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";
import { MenuCart } from "@/components/menu/MenuCart";
import { PublicNav } from "@/components/layout/PublicNav";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function MenuClient({
  menuItems,
  restaurantName,
  whatsappPhone,
  isClosed,
}: {
  menuItems: MenuItem[];
  restaurantName: string;
  whatsappPhone: string;
  isClosed: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [activeCategory, setActiveCategory] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [addedFlashId, setAddedFlashId] = useState<string | null>(null);

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

  const cartLines = useMemo(() => {
    return Object.entries(cartQty)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        if (!item || qty <= 0) return null;
        return { id: item.id, name: item.name, price: item.price, qty };
      })
      .filter((line): line is { id: string; name: string; price: number; qty: number } => line !== null);
  }, [cartQty, menuItems]);

  const cartTotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cartLines]
  );

  const cartItemCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.qty, 0),
    [cartLines]
  );

  const addToCart = (item: MenuItem) => {
    setCartQty((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
    setAddedFlashId(item.id);
    window.setTimeout(() => setAddedFlashId((current) => (current === item.id ? null : current)), 600);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartQty((prev) => {
      const nextQty = (prev[id] ?? 0) + delta;
      if (nextQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: nextQty };
    });
  };

  const removeFromCart = (id: string) => {
    setCartQty((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => setCartQty({});

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen selection:bg-emerald-500/10 font-outfit transition-colors duration-500 ${
        isDark ? "bg-[#09090b] text-[#f7ebd4]" : "bg-[#faf6f2] text-[#122b1c]"
      }`}
    >
      {/* Background Ornaments */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-[#d4af37]/8" : "bg-amber-600/5"}`} />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/5 blur-[120px]" />
        <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-amber-600/10" : "bg-emerald-600/5"}`} />
      </div>

      <PublicNav
        displayName={displayName}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        links={[
          { href: "/menu", label: "Menü", active: true },
          { href: "/contact", label: "İletişim" },
        ]}
        trailing={
          !isClosed ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition duration-300 ${
                isDark
                  ? "border-white/10 bg-[#121217] text-[#f7ebd4] hover:bg-[#181822] hover:border-[#d4af37]/30"
                  : "border-[#122b1c]/10 bg-[#f5f1ea] text-[#122b1c] hover:bg-[#faf6f2]"
              }`}
              title="Sepet"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c85a32] px-0.5 text-[9px] font-black text-white">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              ) : null}
            </button>
          ) : null
        }
      />

      {/* Header Section */}
      <header className="relative z-10 flex flex-col items-center pt-32 pb-14 px-6">
        <Link href="/" className={`absolute top-8 left-8 hidden h-10 w-10 items-center justify-center rounded-2xl border transition shadow-sm md:flex ${
          isDark 
            ? "border-white/10 bg-[#121217]/60 hover:bg-[#181822] text-[#f7ebd4] hover:border-white/20" 
            : "border-[#122b1c]/10 bg-white/50 hover:bg-[#f5f1ea] text-[#122b1c]"
        }`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        <div className="text-center max-w-lg">
          <p className={`text-4xl sm:text-5xl font-serif-cormorant font-bold italic tracking-wide ${
            isDark ? "text-[#d4af37]" : "text-[#c85a32]"
          }`}>
            {displayName}
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className={`h-[1px] w-8 sm:w-16 ${isDark ? "bg-[#d4af37]/30" : "bg-[#c85a32]/30"}`} />
            <h1 className={`text-5xl sm:text-6xl font-serif-cormorant font-light tracking-[0.18em] uppercase ${
              isDark ? "text-white" : "text-[#122b1c]"
            }`}>
              MENÜ
            </h1>
            <div className={`h-[1px] w-8 sm:w-16 ${isDark ? "bg-[#d4af37]/30" : "bg-[#c85a32]/30"}`} />
          </div>

          <div className={`mx-auto mt-4 flex items-center justify-center gap-1.5`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#d4af37]" : "bg-[#c85a32]"}`} />
            <div className={`h-1 w-20 rounded-full ${isDark ? "bg-[#d4af37]/30" : "bg-[#c85a32]/30"}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#d4af37]" : "bg-[#c85a32]"}`} />
          </div>
          
          <p className={`mt-5 text-[11px] font-medium tracking-[0.25em] uppercase leading-relaxed ${
            isDark ? "text-[#f7ebd4]/50" : "text-[#122b1c]/50"
          }`}>
            Dijital Lezzet Kartı
          </p>
          {isClosed && (
            <div className={`mt-6 inline-block px-6 py-3 rounded-2xl border shadow-sm ${
              isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
            }`}>
              <p className="text-sm font-bold tracking-wide">
                ⚠️ Dükkan kapalı. Şu an sipariş alınamıyor.
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
        {/* Controls */}
        <div className="mb-16 flex flex-col items-center gap-6">
          <div className={`flex h-11 w-full max-w-sm items-center rounded-xl border px-4 transition-all duration-300 ${
            isDark 
              ? "border-white/10 bg-[#121217]/60 focus-within:border-[#d4af37]/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]" 
              : "border-[#122b1c]/10 bg-[#f5f1ea]/80 focus-within:border-[#143d28]/35 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
          }`}>
            <svg className={`h-4 w-4 ${isDark ? "text-[#f7ebd4]/45" : "text-[#122b1c]/45"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Ürün Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent pl-3 text-xs font-bold outline-none uppercase tracking-wider ${
                isDark ? "text-[#f7ebd4] placeholder:text-[#f7ebd4]/35" : "text-[#122b1c] placeholder:text-[#122b1c]/35"
              }`}
            />
          </div>
          
          <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeCategory === cat
                    ? isDark
                      ? "bg-[#d4af37] text-[#09090b] border border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                      : "bg-[#143d28] text-[#faf6f2] border border-[#143d28] shadow-lg shadow-[#143d28]/10"
                    : isDark
                    ? "bg-[#121217]/60 text-[#f7ebd4]/70 border border-white/5 hover:bg-[#181822] hover:text-[#f7ebd4] hover:border-white/10 shadow-sm"
                    : "bg-[#f5f1ea]/80 text-[#122b1c]/60 border border-[#122b1c]/10 hover:bg-[#f5ebd7] hover:text-[#122b1c] shadow-sm"
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
          <div className="space-y-16">
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} className="relative">
                {/* Category Header */}
                <div className="mb-8 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-3 w-full">
                    <div className={`h-[1px] flex-1 ${isDark ? "bg-[#d4af37]/20" : "bg-[#c85a32]/20"}`} />
                    <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${isDark ? "text-[#d4af37]" : "text-[#c85a32]"}`}>
                      ★
                    </span>
                    <h2 className={`px-2 text-2xl font-serif-cormorant font-bold italic tracking-[0.1em] ${isDark ? "text-[#fcd3b6]" : "text-[#143d28]"}`}>
                      {category}
                    </h2>
                    <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${isDark ? "text-[#d4af37]" : "text-[#c85a32]"}`}>
                      ★
                    </span>
                    <div className={`h-[1px] flex-1 ${isDark ? "bg-[#d4af37]/20" : "bg-[#c85a32]/20"}`} />
                  </div>
                </div>

                {/* Items Box with Premium Menu Card Aesthetic */}
                <div className={`relative overflow-hidden rounded-[1.8rem] border p-6 sm:p-9 shadow-sm transition-all duration-300 ${
                  isDark 
                    ? "border-[#d4af37]/20 bg-gradient-to-b from-[#13131a] via-[#0e0e13] to-[#09090c] shadow-2xl shadow-black/45 backdrop-blur-sm" 
                    : "border-[#143d28]/15 bg-gradient-to-b from-[#fbf9f4] via-[#f7f2ea] to-[#fbf9f4] shadow-md shadow-[#122b1c]/5"
                }`}>
                  {/* Dashed Inner Frame */}
                  <div className={`absolute inset-2 sm:inset-3 border border-dashed rounded-[1.4rem] pointer-events-none ${
                    isDark ? "border-[#d4af37]/10" : "border-[#143d28]/10"
                  }`} />
                  
                  <div className="grid gap-7 sm:grid-cols-1">
                    {items.map((item) => (
                      <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group z-10">
                        <div className="flex-1">
                          {/* Name & Dot Leader & Price Row */}
                          <div className="flex items-baseline justify-between gap-1">
                            <h3 className={`text-base font-serif-cormorant font-bold tracking-tight transition-colors duration-200 ${
                              isDark ? "text-[#fcd3b6] group-hover:text-white" : "text-[#143d28] group-hover:text-[#c85a32]"
                            }`}>
                              {item.name}
                            </h3>
                            <div className={`hidden sm:block flex-1 border-b border-dotted mx-3 self-baseline relative -top-[4px] ${
                              isDark ? "border-[#d4af37]/25" : "border-[#143d28]/25"
                            }`} />
                            <span className={`hidden sm:block text-base font-serif-cormorant font-bold shrink-0 ${
                              isDark ? "text-[#d4af37]" : "text-[#c85a32]"
                            }`}>
                              {tl.format(item.price).replace(",00", "").replace("₺", "")} TL
                            </span>
                          </div>
                          
                          {/* Description */}
                          {item.description && (
                            <p className={`mt-1.5 text-xs font-serif-cormorant italic leading-relaxed pr-8 ${
                              isDark ? "text-[#f7ebd4]/70" : "text-[#122b1c]/70"
                            }`}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Add to Cart & Cart Quantity Section */}
                        <div className="flex shrink-0 flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 justify-between sm:justify-start">
                          <span className={`sm:hidden text-base font-serif-cormorant font-bold ${
                            isDark ? "text-[#d4af37]" : "text-[#c85a32]"
                          }`}>
                            {tl.format(item.price).replace(",00", "").replace("₺", "")} TL
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {!isClosed && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => addToCart(item)}
                                  className={`rounded-lg px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    addedFlashId === item.id
                                      ? "bg-[#10b981] text-white"
                                      : isDark
                                      ? "border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#09090b] shadow-sm shadow-[#d4af37]/5"
                                      : "border border-[#143d28]/20 bg-[#143d28]/5 text-[#143d28] hover:bg-[#143d28] hover:text-[#faf6f2]"
                                  }`}
                                >
                                  {addedFlashId === item.id ? "Eklendi ✓" : "Ekle"}
                                </button>
                                {(cartQty[item.id] ?? 0) > 0 ? (
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-[#d4af37]/80" : "text-[#c85a32]/80"}`}>
                                    ({cartQty[item.id]} adet)
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative Vintage Stamp / Badge */}
                <div className={`absolute -bottom-4 -right-4 flex h-14 w-14 items-center justify-center rounded-full border shadow-md transition-transform duration-500 hover:rotate-12 ${
                  isDark 
                    ? "border-[#d4af37]/35 bg-[#121217] text-[#d4af37] shadow-black/45 hover:border-[#d4af37]" 
                    : "border-[#143d28]/20 bg-[#faf6f2] text-[#143d28] shadow-[#122b1c]/10"
                }`}>
                  <span className="text-xl">
                    {category.toLowerCase().includes("içecek") || category.toLowerCase().includes("bar") ? "☕" : 
                     category.toLowerCase().includes("tatlı") || category.toLowerCase().includes("pasta") ? "🍰" : 
                     category.toLowerCase().includes("kahvaltı") ? "🍳" : "🍽️"}
                  </span>
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

      <MenuCart
        isDark={isDark}
        lines={cartLines}
        total={cartTotal}
        itemCount={cartItemCount}
        isOpen={cartOpen}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemoveLine={removeFromCart}
        onClear={clearCart}
        whatsappPhone={whatsappPhone}
        restaurantName={displayName}
      />

      <style jsx global>{`
        h1, h2, h3, .font-serif-cormorant {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
        }
        body, input, button, .font-outfit {
          font-family: 'Outfit', sans-serif !important;
        }
      `}</style>
    </div>
  );
}
