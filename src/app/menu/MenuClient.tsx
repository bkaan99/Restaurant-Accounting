"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";
import { MenuCart } from "@/components/menu/MenuCart";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function MenuClient({
  menuItems,
  restaurantName,
  whatsappPhone,
}: {
  menuItems: MenuItem[];
  restaurantName: string;
  whatsappPhone: string;
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
      className={`min-h-screen bg-grain selection:bg-emerald-500/10 font-outfit transition-colors duration-500 ${
        isDark ? "bg-[#050d09] text-[#f7ebd4]" : "bg-[#faf6f2] text-[#122b1c]"
      }`}
    >
      {/* Background Ornaments */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-emerald-600/10" : "bg-amber-600/5"}`} />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700/5 blur-[120px]" />
        <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-amber-600/10" : "bg-emerald-600/5"}`} />
        <div
          className={`absolute inset-0 ${isDark ? "text-[#f7ebd4]/20 opacity-[0.02]" : "text-[#122b1c]/30 opacity-[0.03]"}`}
          style={{
            backgroundImage: "radial-gradient(currentColor 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          isDark ? "border-[#f7ebd4]/5 bg-[#050d09]/75" : "border-[#122b1c]/5 bg-[#faf6f2]/75"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition ${
              isDark ? "border-[#f7ebd4]/10 bg-white/5" : "border-[#122b1c]/10 bg-[#f5f1ea]"
            }`}>
              <Image src="/logo.png" alt={`${displayName} logosu`} width={40} height={40} className="h-full w-full object-contain p-1" />
            </div>
            <span className={`text-sm font-black tracking-tight sm:text-base ${isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"}`}>{displayName}</span>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-[#d4af37]" : "text-[#143d28]"}`}>Menü</span>
            <Link href="/contact" className={`text-xs font-bold uppercase tracking-widest transition ${isDark ? "text-[#f7ebd4]/60 hover:text-[#d4af37]" : "text-[#122b1c]/60 hover:text-[#143d28]"}`}>
              İletişim
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition duration-300 ${
                isDark
                  ? "border-[#f7ebd4]/10 bg-[#0e241b] text-[#f7ebd4] hover:bg-[#143d28]"
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
            <button
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition duration-300 ${
                isDark
                  ? "border-[#f7ebd4]/10 bg-[#0e241b] text-[#f7ebd4] hover:bg-[#143d28]"
                  : "border-[#122b1c]/10 bg-[#f5f1ea] text-[#122b1c] hover:bg-[#faf6f2]"
              }`}
              title="Temayı değiştir"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="relative z-10 flex flex-col items-center pt-32 pb-14 px-6">
        <Link href="/" className={`absolute top-8 left-8 flex h-10 w-10 items-center justify-center rounded-2xl border transition shadow-sm ${
          isDark 
            ? "border-[#f7ebd4]/10 bg-[#0e241b]/60 hover:bg-[#143d28] text-[#f7ebd4]" 
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
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
        {/* Controls */}
        <div className="mb-16 flex flex-col items-center gap-6">
          <div className={`flex h-11 w-full max-w-sm items-center rounded-xl border px-4 transition-all duration-300 ${
            isDark 
              ? "border-[#f7ebd4]/15 bg-[#0e241b]/60 focus-within:border-[#d4af37]/45 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
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
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeCategory === cat
                    ? isDark
                      ? "bg-[#d4af37] text-[#050d09] border border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                      : "bg-[#143d28] text-[#faf6f2] border border-[#143d28] shadow-lg shadow-[#143d28]/10"
                    : isDark
                    ? "bg-[#0e241b]/60 text-[#f7ebd4]/60 border border-white/5 hover:bg-[#0e241b] hover:text-[#f7ebd4] shadow-sm"
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
                    ? "border-[#d4af37]/20 bg-gradient-to-b from-[#0e241b] via-[#091b13] to-[#050d09] shadow-none backdrop-blur-sm" 
                    : "border-[#143d28]/15 bg-gradient-to-b from-[#fbf9f4] via-[#f7f2ea] to-[#fbf9f4] shadow-md shadow-[#122b1c]/5"
                }`}>
                  {/* Dashed Inner Frame */}
                  <div className={`absolute inset-2 sm:inset-3 border border-dashed rounded-[1.4rem] pointer-events-none ${
                    isDark ? "border-[#d4af37]/10" : "border-[#143d28]/10"
                  }`} />
                  
                  {/* Subtle decorative dot pattern */}
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-[0.03] ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      backgroundImage: "radial-gradient(currentColor 0.6px, transparent 0.6px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  
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
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className={`rounded-lg px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                                addedFlashId === item.id
                                  ? "bg-[#10b981] text-white"
                                  : isDark
                                  ? "border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] hover:bg-[#d4af37]/20 hover:text-white"
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative Vintage Stamp / Badge */}
                <div className={`absolute -bottom-4 -right-4 flex h-14 w-14 items-center justify-center rounded-full border shadow-md transition-transform duration-500 hover:rotate-12 ${
                  isDark 
                    ? "border-[#d4af37]/35 bg-[#0e241b] text-[#d4af37] shadow-black/40" 
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
