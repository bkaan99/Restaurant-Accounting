"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export function ContactClient({ displayName }: { displayName: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#020408] text-slate-100" : "bg-[#fafafa] text-slate-800"}`}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-violet-600/10" : "bg-violet-600/5"}`} />
        <div className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] ${isDark ? "bg-fuchsia-600/10" : "bg-fuchsia-600/5"}`} />
      </div>

      <nav className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-xl ${isDark ? "border-white/5 bg-black/20" : "border-black/5 bg-white/40"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg ${isDark ? "shadow-violet-900/20" : "shadow-violet-200"}`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className={`text-sm font-black tracking-tight sm:text-base ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</span>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/menu" className={`text-xs font-bold uppercase tracking-widest transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-violet-600"}`}>
              Menü
            </Link>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-violet-600"}`}>İletişim</span>
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

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-28">
        <section className={`rounded-3xl border p-8 backdrop-blur-sm ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white/50"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? "text-violet-300" : "text-violet-600"}`}>Bize Ulasin</p>
          <h1 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>Iletisim</h1>
          <p className={`mt-3 max-w-2xl text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Sorulariniz, rezervasyon talepleriniz veya geri bildirimleriniz icin bizimle istediginiz zaman iletisime gecebilirsiniz.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Telefon</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>+90 (555) 123 45 67</p>
            </article>
            <article className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>E-posta</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>iletisim@restoran.com</p>
            </article>
            <article className={`rounded-2xl border p-5 sm:col-span-2 ${isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-white/70"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Adres</p>
              <p className={`mt-2 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>Ataturk Caddesi No: 10, Istanbul</p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className={`rounded-xl px-5 py-2.5 text-sm font-black transition hover:opacity-90 ${isDark ? "bg-white text-black" : "bg-slate-900 text-white"}`}>
              Menuye Don
            </Link>
            <Link href="/" className={`rounded-xl border px-5 py-2.5 text-sm font-black transition ${isDark ? "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]" : "border-black/10 bg-white/60 text-slate-700 hover:bg-white"}`}>
              Anasayfa
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
