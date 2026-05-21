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
    <main className="relative min-h-[100dvh] overflow-x-hidden">
      <LandingClient displayName={displayName} />
    </main>
  );
}
