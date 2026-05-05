import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getRestaurantName(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
  const displayName = restaurantName || "Restoran";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020408] px-6 selection:bg-violet-500/30">
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-indigo-600/5 blur-[100px]" />
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-fuchsia-600/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {/* Animated Glow Logo Container */}
        <div className="group relative mb-12">
          <div className="absolute -inset-4 animate-pulse rounded-[2.5rem] bg-violet-600/20 blur-2xl transition duration-1000 group-hover:bg-violet-600/40 group-hover:duration-200" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-900/40 transition-transform duration-500 group-hover:scale-110">
            <svg
              className="h-12 w-12 text-white"
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
        </div>

        {/* Text Section */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">
            Hoş Geldiniz
          </span>
          <h1 className="mt-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-black tracking-tighter text-transparent">
            {displayName}
          </h1>
          <p className="mt-6 text-sm font-medium leading-relaxed text-slate-500">
            Damak tadınıza hitap eden dijital menümüzü keşfedin <br className="hidden sm:block" /> ya da profesyonel yönetim sistemine erişin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/menu"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] bg-white px-6 py-5 text-sm font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
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
            className="group flex w-full items-center justify-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-6 py-5 text-sm font-black text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
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

      {/* Footer Info */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Powered by <span className="text-slate-500">Antigravity Premium</span>
        </p>
      </div>
    </main>
  );
}
