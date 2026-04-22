"use client";

import { useEffect, useState } from "react";

const heroTitle = "Restoran operasyonunu tek ekranda yonet.";

export function LoginView({
  hasSupabaseConfig,
  loading,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
  errorMessage,
  isSubmitting,
}: {
  hasSupabaseConfig: boolean;
  loading: boolean;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void | Promise<void>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
}) {
  const [typedHeroTitle, setTypedHeroTitle] = useState("");
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    let charIndex = 0;
    const intervalId = setInterval(() => {
      charIndex += 1;
      setTypedHeroTitle(heroTitle.slice(0, charIndex));
      if (charIndex >= heroTitle.length) clearInterval(intervalId);
    }, 55);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const delays = [200, 400, 600, 800];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setVisibleCards((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFormVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="mx-auto grid min-h-[90vh] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900/50 to-cyan-500/10 p-8 shadow-2xl backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">Panel</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            {typedHeroTitle}
            <span className="ml-0.5 inline-block h-8 w-[2px] animate-pulse bg-indigo-200 align-middle" />
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Satis, gider, menu ve raporlari ayni panelde takip edin. Rol bazli guvenli girisle ekibinizin yetkilerini kontrol edin.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            {[
              "Anlik gelir/gider ozetleri",
              "Rol bazli erisim yonetimi",
              "Supabase ile guvenli veri akisi",
              "Detayli islem ve raporlar",
            ].map((text, i) => (
              <div
                key={text}
                className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-500 ${
                  visibleCards[i]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {text}
              </div>
            ))}
          </div>
        </section>

        <div className={`relative w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/20 via-white/10 to-indigo-200/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-700 md:p-8 ${
          formVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        }`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100">Hosgeldiniz</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Giris Yap</h2>
          <p className="mt-2 text-sm text-slate-200">Hesabinizla giris yapip yonetim paneline devam edin.</p>

          <div
            className={`mt-5 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
              hasSupabaseConfig
                ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-800"
                : "border-amber-200/70 bg-amber-50/90 text-amber-900"
            }`}
          >
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${hasSupabaseConfig ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span>Supabase baglantisi {hasSupabaseConfig ? "basarili" : "bulunamadi (simdilik demo veri ile calisiyor)"}</span>
          </div>
          {loading ? <p className="mt-2 text-xs text-blue-700">Supabase verileri yukleniyor...</p> : null}

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">E-posta</label>
              <input
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSubmitting && onLogin()}
                placeholder="ornek@restaurant.com"
                className="w-full rounded-xl border border-white/30 bg-white/85 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">Sifre</label>
              <input
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSubmitting && onLogin()}
                type="password"
                placeholder="Sifrenizi girin"
                className="w-full rounded-xl border border-white/30 bg-white/85 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {errorMessage ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-300/70 bg-red-50/90 px-3 py-2.5 text-sm text-red-700">
                <span className="mt-0.5 shrink-0 text-base leading-none">⚠</span>
                <span>{errorMessage}</span>
              </div>
            ) : null}
            <button
              onClick={onLogin}
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2.5 font-semibold text-white transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-200/90">Supabase Auth ile e-posta/sifre girisi kullanilir.</p>
        </div>
      </div>
    </main>
  );
}
