import { createClient } from "@supabase/supabase-js";
import { LandingClient } from "@/components/layout/LandingClient";

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

      <LandingClient displayName={displayName} />

      {/* Footer Info */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Powered by <span className="text-slate-500">Antigravity Premium</span>
        </p>
      </div>
    </main>
  );
}
