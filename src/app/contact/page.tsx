import { createClient } from "@supabase/supabase-js";
import { ContactClient } from "@/components/layout/ContactClient";

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
  return <ContactClient displayName={displayName} />;
}
