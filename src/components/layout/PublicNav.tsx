"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export type PublicNavLink = {
  href: string;
  label: string;
  active?: boolean;
};

export function PublicNav({
  displayName,
  isDark,
  links,
  onToggleTheme,
  trailing,
  onLinkClick,
}: {
  displayName: string;
  isDark: boolean;
  links: PublicNavLink[];
  onToggleTheme: () => void;
  trailing?: ReactNode;
  onLinkClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLinkClick = () => {
    closeMenu();
    onLinkClick?.();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const linkClass = (active?: boolean) =>
    active
      ? isDark
        ? "text-[#d4af37]"
        : "text-[#143d28]"
      : isDark
      ? "text-[#f7ebd4]/60 hover:text-[#d4af37]"
      : "text-[#122b1c]/60 hover:text-[#143d28]";

  const iconBtnClass = isDark
    ? "border-[#f7ebd4]/10 bg-[#0e241b] text-[#f7ebd4] hover:bg-[#143d28]"
    : "border-[#122b1c]/10 bg-[#f5f1ea] text-[#122b1c] hover:bg-[#faf6f2]";

  const themeToggle = (
    <button
      type="button"
      onClick={onToggleTheme}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition duration-300 ${iconBtnClass}`}
      title="Temayı değiştir"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          isDark ? "border-[#f7ebd4]/5 bg-[#050d09]/75" : "border-[#122b1c]/5 bg-[#faf6f2]/75"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" onClick={handleLinkClick}>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition sm:h-10 sm:w-10 ${
                isDark ? "border-[#f7ebd4]/10 bg-white/5" : "border-[#122b1c]/10 bg-[#f5f1ea]"
              }`}
            >
              <Image
                src="/logo.png"
                alt={`${displayName} logosu`}
                width={40}
                height={40}
                className="h-full w-full object-contain p-1"
              />
            </div>
            <span
              className={`truncate text-sm font-black tracking-tight sm:text-base ${
                isDark ? "text-[#f7ebd4]" : "text-[#122b1c]"
              }`}
            >
              {displayName}
            </span>
          </Link>

          {/* Masaüstü */}
          <div className="hidden items-center gap-6 md:flex md:gap-8">
            {links.map((link) =>
              link.active ? (
                <span
                  key={link.href}
                  className={`text-xs font-black uppercase tracking-widest ${linkClass(true)}`}
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`text-xs font-bold uppercase tracking-widest transition ${linkClass(false)}`}
                >
                  {link.label}
                </Link>
              )
            )}
            {trailing}
            {themeToggle}
          </div>

          {/* Mobil */}
          <div className="flex items-center gap-2 md:hidden">
            {trailing}
            {themeToggle}
            <button
              type="button"
              aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition duration-300 ${iconBtnClass}`}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobil menü paneli */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <div
            className={`absolute left-0 right-0 top-[57px] border-b px-4 py-4 shadow-xl sm:top-[65px] ${
              isDark
                ? "border-[#f7ebd4]/10 bg-[#050d09]/95"
                : "border-[#122b1c]/10 bg-[#faf6f2]/95"
            }`}
          >
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className={`block rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition ${
                    isDark ? "text-[#f7ebd4]/80 hover:bg-white/5" : "text-[#122b1c]/80 hover:bg-[#f5f1ea]"
                  }`}
                >
                  Ana Sayfa
                </Link>
              </li>
              {links.map((link) => (
                <li key={link.href}>
                  {link.active ? (
                    <span
                      className={`block rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-widest ${linkClass(true)}`}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`block rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition ${linkClass(false)}`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className={`block rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition ${
                    isDark ? "text-[#f7ebd4]/60 hover:bg-white/5" : "text-[#122b1c]/60 hover:bg-[#f5f1ea]"
                  }`}
                >
                  Yönetim Paneli
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
