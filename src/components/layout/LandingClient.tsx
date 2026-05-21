"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChefLoading } from "@/components/ui/ChefLoading";
import { useTheme } from "@/context/ThemeContext";

export function LandingClient({ displayName }: { displayName: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNav = () => {
    setIsLoading(true);
  };

  return (
    <div
      suppressHydrationWarning
      className={`relative min-h-screen bg-grain flex flex-col items-center justify-center overflow-hidden selection:bg-emerald-500/10 transition-colors duration-500 ${
        isDark ? "bg-[#050d09]" : "bg-[#faf6f2]"
      }`}
    >
      {isLoading && <ChefLoading />}

      {/* Premium Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          isDark ? "border-[#f7ebd4]/5 bg-[#050d09]/75" : "border-[#122b1c]/5 bg-[#faf6f2]/75"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left: Logo & Name */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition ${
              isDark ? "border-[#f7ebd4]/10 bg-white/5" : "border-[#122b1c]/10 bg-[#f5f1ea]"
            }`}>
              <Image src="/logo.png" alt={`${displayName} logosu`} width={40} height={40} className="h-full w-full object-contain p-1" />
            </div>
            <span className={`text-sm font-black tracking-tight sm:text-base ${isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"}`}>{displayName}</span>
          </div>

          {/* Right: Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/menu" onClick={handleNav} className={`text-xs font-bold uppercase tracking-widest transition ${
              isDark ? "text-[#f7ebd4]/60 hover:text-[#d4af37]" : "text-[#122b1c]/60 hover:text-[#143d28]"
            }`}>
              Menü
            </Link>
            <Link href="/contact" onClick={handleNav} className={`text-xs font-bold uppercase tracking-widest transition ${
              isDark ? "text-[#f7ebd4]/60 hover:text-[#d4af37]" : "text-[#122b1c]/60 hover:text-[#143d28]"
            }`}>
              İletişim
            </Link>
            <button
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition duration-300 ${
                isDark
                  ? "border-[#f7ebd4]/10 bg-[#0e241b] text-[#f7ebd4] hover:bg-[#143d28]"
                  : "border-[#122b1c]/10 bg-[#f5f1ea] text-[#122b1c] hover:bg-[#faf6f2]"
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
      
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Soft Organic Ambient Glows */}
        <div className={`absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full blur-[130px] transition-colors duration-500 ${
          isDark ? "bg-emerald-800/15" : "bg-emerald-600/5"
        }`} />
        <div className={`absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-500 ${
          isDark ? "bg-amber-600/10" : "bg-amber-500/5"
        }`} />
        
        {/* Fine dotted retro grid pattern */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark ? "text-[#f7ebd4]/20 opacity-[0.02]" : "text-[#122b1c]/30 opacity-[0.03]"
          }`}
          style={{
            backgroundImage: "radial-gradient(currentColor 0.6px, transparent 0.6px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Elegant Botanical Corner Flourish SVG */}
        <div className={`absolute -top-10 -right-10 w-80 h-80 opacity-[0.03] dark:opacity-[0.05] ${
          isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"
        }`}>
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="0.5">
            <path d="M10,90 Q40,60 90,10" />
            <path d="M90,10 Q80,25 65,30 Q80,15 90,10" fill="currentColor" opacity="0.4" />
            <path d="M60,40 Q50,55 35,60 Q50,45 60,40" fill="currentColor" opacity="0.4" />
            <path d="M40,60 Q30,75 15,80 Q30,65 40,60" fill="currentColor" opacity="0.4" />
            <path d="M75,25 Q65,15 50,18" />
            <path d="M50,18 Q60,30 75,25" fill="currentColor" opacity="0.4" />
          </svg>
        </div>
        <div className={`absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.03] dark:opacity-[0.05] scale-x-[-1] scale-y-[-1] ${
          isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"
        }`}>
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="0.5">
            <path d="M10,90 Q40,60 90,10" />
            <path d="M90,10 Q80,25 65,30 Q80,15 90,10" fill="currentColor" opacity="0.4" />
            <path d="M60,40 Q50,55 35,60 Q50,45 60,40" fill="currentColor" opacity="0.4" />
            <path d="M40,60 Q30,75 15,80 Q30,65 40,60" fill="currentColor" opacity="0.4" />
            <path d="M75,25 Q65,15 50,18" />
            <path d="M50,18 Q60,30 75,25" fill="currentColor" opacity="0.4" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center text-center">
        {/* Animated Glow Logo Container */}
        <div className="group relative mb-12">
          <div className={`absolute -inset-4 animate-pulse rounded-[2.5rem] blur-2xl transition duration-1000 ${
            isDark ? "bg-[#d4af37]/15 group-hover:bg-[#d4af37]/30" : "bg-[#c85a32]/10 group-hover:bg-[#c85a32]/20"
          }`} />
          <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2.2rem] border shadow-xl transition-transform duration-500 group-hover:scale-110 ${
            isDark ? "border-[#d4af37]/20 bg-[#0e241b] shadow-[#050d09]" : "border-[#143d28]/20 bg-[#faf6f2] shadow-[#122b1c]/5"
          }`}>
            <Image src="/logo.png" alt={`${displayName} logosu`} width={96} height={96} className="h-full w-full object-contain p-3" />
          </div>
        </div>

        {/* Text Section */}
        <div className="mb-10">
          <span className={`animate-fade-in inline-block rounded-full border px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-0 ${
            isDark 
              ? "border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]" 
              : "border-[#c85a32]/20 bg-[#c85a32]/5 text-[#c85a32]"
          }`} style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            Hoş Geldiniz
          </span>
          <div className="mt-6 flex justify-center overflow-hidden">
            <h1 className={`bg-gradient-to-b bg-clip-text text-5xl font-serif-cormorant font-bold italic tracking-tight text-transparent border-r-4 animate-typing whitespace-nowrap pr-2 ${
              isDark ? "from-white to-[#f7ebd4] border-white" : "from-[#122b1c] to-[#c85a32] border-[#122b1c]"
            }`} style={{ width: '0', animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {displayName}
            </h1>
          </div>
          <p className={`animate-fade-in mt-6 text-xs font-serif-cormorant italic leading-relaxed opacity-0 ${
            isDark ? "text-[#f7ebd4]/70" : "text-[#122b1c]/70"
          }`} style={{ animationFillMode: 'forwards', animationDelay: '1s' }}>
            Damak tadınıza hitap eden dijital menümüzü keşfedin <br className="hidden sm:block" /> ya da profesyonel yönetim sistemine erişin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/menu"
            onClick={handleNav}
            className={`animate-slide-up group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] px-6 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl opacity-0 ${
              isDark 
                ? "bg-[#d4af37] text-[#050d09] shadow-none border border-[#d4af37]" 
                : "bg-[#143d28] text-[#faf6f2] shadow-[#122b1c]/10 border border-[#143d28]"
            }`}
            style={{ animationFillMode: 'forwards', animationDelay: '1.2s' }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            Dijital Menüyü İncele
          </Link>

          <Link
            href="/dashboard"
            onClick={handleNav}
            className={`animate-slide-up group flex w-full items-center justify-center gap-3 rounded-[1.5rem] border px-6 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm opacity-0 ${
              isDark
                ? "border-white/10 bg-[#0e241b]/60 text-[#f7ebd4]/80 hover:bg-[#143d28] hover:text-white"
                : "border-[#122b1c]/15 bg-white text-[#122b1c]/80 hover:bg-[#f5f1ea]"
            }`}
            style={{ animationFillMode: 'forwards', animationDelay: '1.3s' }}
          >
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Yönetim Paneli
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center animate-fade-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '1.5s' }}>
        <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? "text-[#f7ebd4]/40" : "text-[#122b1c]/40"}`}>
          {displayName} Premium Deneyimi
        </p>
      </footer>
    </div>
  );
}
