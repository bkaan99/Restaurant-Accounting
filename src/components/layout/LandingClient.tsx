"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChefLoading } from "@/components/ui/ChefLoading";
import { PublicNav } from "@/components/layout/PublicNav";
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
      className={`relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-grain selection:bg-emerald-500/10 transition-colors duration-500 ${
        isDark ? "bg-[#050d09]" : "bg-[#faf6f2]"
      }`}
    >
      {isLoading && <ChefLoading />}

      <PublicNav
        displayName={displayName}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLinkClick={handleNav}
        links={[
          { href: "/menu", label: "Menü" },
          { href: "/contact", label: "İletişim" },
        ]}
      />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={`absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[100px] sm:h-[560px] sm:w-[560px] md:h-[700px] md:w-[700px] ${
            isDark ? "bg-emerald-800/15" : "bg-emerald-600/5"
          }`}
        />
        <div
          className={`absolute -bottom-32 left-1/4 h-[280px] w-[280px] rounded-full blur-[90px] sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px] ${
            isDark ? "bg-amber-600/10" : "bg-amber-500/5"
          }`}
        />
        <div
          className={`absolute inset-0 ${isDark ? "text-[#f7ebd4]/20 opacity-[0.02]" : "text-[#122b1c]/30 opacity-[0.03]"}`}
          style={{
            backgroundImage: "radial-gradient(currentColor 0.6px, transparent 0.6px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-[4.5rem] sm:px-6 sm:pb-8 sm:pt-24 md:pt-28">
        <div className="flex w-full max-w-[min(100%,22rem)] flex-col items-center text-center sm:max-w-md md:max-w-lg">
          <div className="group relative mb-8 sm:mb-12">
            <div
              className={`absolute -inset-3 animate-pulse rounded-[2rem] blur-2xl sm:-inset-4 sm:rounded-[2.5rem] ${
                isDark ? "bg-[#d4af37]/15" : "bg-[#c85a32]/10"
              }`}
            />
            <div
              className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.75rem] border shadow-xl transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24 sm:rounded-[2.2rem] ${
                isDark ? "border-[#d4af37]/20 bg-[#0e241b]" : "border-[#143d28]/20 bg-[#faf6f2]"
              }`}
            >
              <Image
                src="/logo.png"
                alt={`${displayName} logosu`}
                width={96}
                height={96}
                className="h-full w-full object-contain p-2.5 sm:p-3"
              />
            </div>
          </div>

          <div className="mb-8 w-full sm:mb-10">
            <span
              className={`animate-fade-in inline-block rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.22em] opacity-0 sm:px-4 sm:py-1.5 sm:text-[9px] sm:tracking-[0.3em] ${
                isDark
                  ? "border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37]"
                  : "border-[#c85a32]/20 bg-[#c85a32]/5 text-[#c85a32]"
              }`}
              style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}
            >
              Hoş Geldiniz
            </span>

            <div className="mt-5 flex w-full justify-center sm:mt-6">
              <h1
                className={`animate-fade-in max-w-full break-words px-1 text-center font-serif-cormorant text-[2rem] font-bold italic leading-tight tracking-tight text-balance opacity-0 sm:text-4xl md:text-5xl ${
                  isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"
                }`}
                style={{ animationFillMode: "forwards", animationDelay: "0.3s" }}
              >
                {displayName}
              </h1>
            </div>

            <p
              className={`animate-fade-in mt-5 max-w-sm px-2 text-sm font-serif-cormorant italic leading-relaxed opacity-0 sm:mt-6 sm:max-w-md sm:text-base ${
                isDark ? "text-[#f7ebd4]/70" : "text-[#122b1c]/70"
              }`}
              style={{ animationFillMode: "forwards", animationDelay: "1s" }}
            >
              Damak tadınıza hitap eden dijital menümüzü keşfedin ya da profesyonel yönetim sistemine erişin.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <Link
              href="/menu"
              onClick={handleNav}
              className={`animate-slide-up flex w-full min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[1.25rem] px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-[0.98] opacity-0 sm:min-h-0 sm:gap-3 sm:rounded-[1.5rem] sm:px-6 sm:py-5 sm:text-xs sm:tracking-[0.2em] ${
                isDark
                  ? "border border-[#d4af37] bg-[#d4af37] text-[#050d09]"
                  : "border border-[#143d28] bg-[#143d28] text-[#faf6f2] shadow-lg shadow-[#122b1c]/10"
              }`}
              style={{ animationFillMode: "forwards", animationDelay: "1.2s" }}
            >
              <svg className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`animate-slide-up flex w-full min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[1.25rem] border px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] transition-all active:scale-[0.98] opacity-0 sm:min-h-0 sm:gap-3 sm:rounded-[1.5rem] sm:px-6 sm:py-5 sm:text-xs sm:tracking-[0.2em] ${
                isDark
                  ? "border-white/10 bg-[#0e241b]/60 text-[#f7ebd4]/80 hover:bg-[#143d28] hover:text-white"
                  : "border-[#122b1c]/15 bg-white text-[#122b1c]/80 hover:bg-[#f5f1ea]"
              }`}
              style={{ animationFillMode: "forwards", animationDelay: "1.3s" }}
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      <footer
        className="relative z-10 shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center opacity-0 animate-fade-in sm:pb-8"
        style={{ animationFillMode: "forwards", animationDelay: "1.5s" }}
      >
        <p
          className={`text-[8px] font-black uppercase tracking-[0.28em] sm:text-[9px] sm:tracking-[0.4em] ${
            isDark ? "text-[#f7ebd4]/40" : "text-[#122b1c]/40"
          }`}
        >
          {displayName} Premium Deneyimi
        </p>
      </footer>
    </div>
  );
}
