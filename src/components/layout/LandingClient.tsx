"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden selection:bg-violet-500/10 transition-colors duration-500 ${
        isDark ? "bg-[#020408]" : "bg-[#fafafa]"
      }`}
    >
      {isLoading && <ChefLoading />}

      {/* Premium Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${
          isDark ? "border-white/5 bg-black/20" : "border-black/5 bg-white/40"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left: Logo & Name */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/70"}`}>
              <img src="/logo.png" alt={`${displayName} logosu`} className="h-full w-full object-contain p-1" />
            </div>
            <span className={`text-sm font-black tracking-tight sm:text-base ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</span>
          </div>

          {/* Right: Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/menu" onClick={handleNav} className={`text-xs font-bold uppercase tracking-widest transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-violet-600"}`}>
              Menü
            </Link>
            <Link href="/contact" onClick={handleNav} className={`text-xs font-bold uppercase tracking-widest transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-violet-600"}`}>
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
      
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className={`absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-[120px] ${isDark ? "bg-violet-600/10" : "bg-violet-500/5"}`} />
        <div className={`absolute -bottom-40 left-0 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-indigo-600/5" : "bg-indigo-500/5"}`} />
        <div
          className={`absolute inset-0 ${isDark ? "opacity-[0.02] text-white/30" : "opacity-[0.05] text-black/30"}`}
          style={{
            backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center text-center">
        {/* Animated Glow Logo Container */}
        <div className="group relative mb-12">
          <div className={`absolute -inset-4 animate-pulse rounded-[2.5rem] blur-2xl transition duration-1000 ${isDark ? "bg-violet-600/20 group-hover:bg-violet-600/40" : "bg-violet-600/10 group-hover:bg-violet-600/20"}`} />
          <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2.2rem] border shadow-xl transition-transform duration-500 group-hover:scale-110 ${
            isDark ? "border-white/10 bg-white/5 shadow-violet-900/40" : "border-black/10 bg-white/85 shadow-violet-200"
          }`}>
            <img src="/logo.png" alt={`${displayName} logosu`} className="h-full w-full object-contain p-3" />
          </div>
        </div>

        {/* Text Section */}
        <div className="mb-10">
          <span className="animate-fade-in inline-block rounded-full border border-violet-500/10 bg-violet-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            Hoş Geldiniz
          </span>
          <div className="mt-6 flex justify-center overflow-hidden">
            <h1 className={`bg-gradient-to-b bg-clip-text text-5xl font-black tracking-tighter text-transparent border-r-4 animate-typing whitespace-nowrap pr-2 ${isDark ? "from-white to-slate-400 border-white" : "from-slate-900 to-slate-500 border-slate-900"}`} style={{ width: '0', animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {displayName}
            </h1>
          </div>
          <p className={`animate-fade-in mt-6 text-sm font-medium leading-relaxed opacity-0 ${isDark ? "text-slate-400" : "text-slate-500"}`} style={{ animationFillMode: 'forwards', animationDelay: '1s' }}>
            Damak tadınıza hitap eden dijital menümüzü keşfedin <br className="hidden sm:block" /> ya da profesyonel yönetim sistemine erişin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/menu"
            onClick={handleNav}
            className={`animate-slide-up group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] px-6 py-5 text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl opacity-0 ${
              isDark ? "bg-white text-black shadow-none" : "bg-slate-900 text-white shadow-slate-200"
            }`}
            style={{ animationFillMode: 'forwards', animationDelay: '1.2s' }}
          >
            <svg
              className="h-5 w-5"
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
            className={`animate-slide-up group flex w-full items-center justify-center gap-3 rounded-[1.5rem] border px-6 py-5 text-sm font-black transition-all active:scale-[0.98] shadow-sm opacity-0 ${
              isDark
                ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            style={{ animationFillMode: 'forwards', animationDelay: '1.3s' }}
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:rotate-12"
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
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {displayName} Premium Deneyimi
        </p>
      </footer>
    </div>
  );
}
