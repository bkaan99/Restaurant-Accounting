import { createClient } from "@supabase/supabase-js";
import { MenuItem } from "@/lib/types";
import { MenuClient } from "./MenuClient";

async function getMenuData(): Promise<{ menuItems: MenuItem[]; restaurantName: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { menuItems: [], restaurantName: "" };
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const [menuRes, settingsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id, name, description, category, price, active")
        .eq("active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("app_settings")
        .select("ayar_anahtari, ayar_degeri"),
    ]);

    const menuItems: MenuItem[] = (menuRes.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description || null,
      category: m.category,
      price: Number(m.price),
      active: Boolean(m.active),
    }));

    const nameRow = (settingsRes.data ?? []).find(
      (r) => r.ayar_anahtari === "restaurant_name"
    );
    const restaurantName = nameRow?.ayar_degeri ?? "";

    return { menuItems, restaurantName };
  } catch {
    return { menuItems: [], restaurantName: "" };
  }
}

export default async function MenuPage() {
  const { menuItems, restaurantName } = await getMenuData();
  return <MenuClient menuItems={menuItems} restaurantName={restaurantName} />;
}
