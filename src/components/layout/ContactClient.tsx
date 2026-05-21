"use client";

import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";
import { useTheme } from "@/context/ThemeContext";

export function ContactClient({ displayName }: { displayName: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen bg-grain font-outfit transition-colors duration-500 ${
        isDark ? "bg-[#050d09] text-[#f7ebd4]" : "bg-[#faf6f2] text-[#122b1c]"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-emerald-600/10" : "bg-amber-600/5"}`} />
        <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-amber-600/10" : "bg-emerald-600/5"}`} />
      </div>

      <PublicNav
        displayName={displayName}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        links={[
          { href: "/menu", label: "Menü" },
          { href: "/contact", label: "İletişim", active: true },
        ]}
      />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <section
          className={`rounded-3xl border p-6 backdrop-blur-sm sm:p-8 ${
            isDark ? "border-[#f7ebd4]/10 bg-white/[0.03]" : "border-[#122b1c]/10 bg-white/50"
          }`}
        >
          <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? "text-[#d4af37]" : "text-[#c85a32]"}`}>
            Bize Ulaşın
          </p>
          <h1 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-[#122b1c]"}`}>
            İletişim
          </h1>
          <p className={`mt-3 max-w-2xl text-sm ${isDark ? "text-[#f7ebd4]/70" : "text-[#122b1c]/70"}`}>
            Sorularınız, rezervasyon talepleriniz veya geri bildirimleriniz için bizimle istediğiniz zaman iletişime geçebilirsiniz.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[#122b1c]/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#f7ebd4]/50" : "text-[#122b1c]/50"}`}>Telefon</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-[#122b1c]"}`}>+90 (555) 123 45 67</p>
            </article>
            <article className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[#122b1c]/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#f7ebd4]/50" : "text-[#122b1c]/50"}`}>E-posta</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-[#122b1c]"}`}>iletisim@restoran.com</p>
            </article>
            <article className={`rounded-2xl border p-5 sm:col-span-2 ${isDark ? "border-white/10 bg-black/20" : "border-[#122b1c]/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-[#f7ebd4]/50" : "text-[#122b1c]/50"}`}>Adres</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-[#122b1c]"}`}>Atatürk Caddesi No: 10, İstanbul</p>
            </article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/menu"
              className={`rounded-xl px-5 py-2.5 text-center text-sm font-black transition hover:opacity-90 ${
                isDark ? "bg-[#d4af37] text-[#050d09]" : "bg-[#143d28] text-[#faf6f2]"
              }`}
            >
              Menüye Dön
            </Link>
            <Link
              href="/"
              className={`rounded-xl border px-5 py-2.5 text-center text-sm font-black transition ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-[#f7ebd4] hover:bg-white/[0.08]"
                  : "border-[#122b1c]/10 bg-white/60 text-[#122b1c] hover:bg-white"
              }`}
            >
              Ana Sayfa
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
