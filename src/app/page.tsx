import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getRestaurantName(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service role key RLS'yi bypass eder, sadece server tarafında kullanılır
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return "";

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data } = await supabase
      .from("app_settings")
      .select("ayar_anahtari, ayar_degeri");
    if (!data) return "";
    const row = data.find((r: { ayar_anahtari: string; ayar_degeri: string }) => r.ayar_anahtari === "restaurant_name");
    return row?.ayar_degeri ?? "";
  } catch {
    return "";
  }
}

export default async function LandingPage() {
  const restaurantName = await getRestaurantName();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Arka plan efektleri */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-60 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-600/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Logo / İkon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        {/* Başlık */}
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-400">
          Hoş Geldiniz
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
          {restaurantName || "Restoran"}
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400">
          Dijital menümüzü inceleyin ya da yönetim paneline giriş yapın.
        </p>

        {/* Ana buton — QR Menü */}
        <Link
          href="/menu"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-base font-black text-white shadow-2xl shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
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
          QR Menüyü Görüntüle
        </Link>

        {/* Özellik kartları */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {[
            { icon: "🍽️", label: "Tüm Ürünler" },
            { icon: "📂", label: "Kategoriler" },
            { icon: "💰", label: "Güncel Fiyatlar" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2 py-3"
            >
              <span className="text-xl">{f.icon}</span>
              <p className="text-[10px] font-bold text-slate-500">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Ayırıcı */}
        <div className="mt-8 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Personel
          </p>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Yönetici girişi */}
        <Link
          href="/dashboard"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Yönetim Paneline Giriş
        </Link>
      </div>

      {/* Alt bilgi */}
      <p className="absolute bottom-6 text-[10px] font-medium text-slate-700">
        {restaurantName || "Restoran"} · Dijital Menü Sistemi
      </p>
    </main>
  );
}
