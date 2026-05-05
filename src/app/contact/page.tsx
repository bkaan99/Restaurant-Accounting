import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getRestaurantName() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return "Restoran";

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data } = await supabase
      .from("app_settings")
      .select("ayar_anahtari, ayar_degeri");

    const nameRow = (data ?? []).find((row) => row.ayar_anahtari === "restaurant_name");
    return nameRow?.ayar_degeri ?? "Restoran";
  } catch {
    return "Restoran";
  }
}

export default async function ContactPage() {
  const displayName = await getRestaurantName();

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-black tracking-tight text-white sm:text-base">{displayName}</span>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/menu" className="text-xs font-bold uppercase tracking-widest text-slate-400 transition hover:text-white">
              Menü
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-white">İletişim</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-28">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-300">Bize Ulasin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Iletisim</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Sorulariniz, rezervasyon talepleriniz veya geri bildirimleriniz icin bizimle istediginiz zaman iletisime gecebilirsiniz.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Telefon</p>
              <p className="mt-2 text-lg font-black text-white">+90 (555) 123 45 67</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">E-posta</p>
              <p className="mt-2 text-lg font-black text-white">iletisim@restoran.com</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Adres</p>
              <p className="mt-2 text-lg font-black text-white">Ataturk Caddesi No: 10, Istanbul</p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black transition hover:opacity-90">
              Menuye Don
            </Link>
            <Link href="/" className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-black text-slate-200 transition hover:bg-white/[0.08]">
              Anasayfa
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
