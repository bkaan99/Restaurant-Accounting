import { createClient } from "@supabase/supabase-js";
import { MenuItem } from "@/lib/types";
import { MenuClient } from "./MenuClient";

async function getMenuData(): Promise<{
  menuItems: MenuItem[];
  restaurantName: string;
  whatsappPhone: string;
  isClosed: boolean;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { menuItems: [], restaurantName: "", whatsappPhone: "", isClosed: false };
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const [menuRes, settingsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id, name, description, category_id, price, active, menu_categories(id, name)")
        .eq("active", true)
        .order("category_id", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("app_settings")
        .select("ayar_anahtari, ayar_degeri"),
    ]);

    const menuItems: MenuItem[] = (menuRes.data ?? []).map((m) => {
      const categoryRelation = (m as { menu_categories?: unknown }).menu_categories;
      const constCategoryName =
        Array.isArray(categoryRelation)
          ? (categoryRelation[0] as { name?: string } | undefined)?.name
          : (categoryRelation as { name?: string } | null | undefined)?.name;
      return {
        id: m.id,
        name: m.name,
        description: m.description || null,
        category: constCategoryName ?? "Kategorisiz",
        categoryId: m.category_id ?? null,
        price: Number(m.price),
        active: Boolean(m.active),
      };
    });

    const nameRow = (settingsRes.data ?? []).find(
      (r) => r.ayar_anahtari === "restaurant_name"
    );
    const restaurantName = nameRow?.ayar_degeri ?? "";
    const whatsappRow = (settingsRes.data ?? []).find(
      (r) => r.ayar_anahtari === "whatsapp_order_phone"
    );
    const whatsappPhone = whatsappRow?.ayar_degeri?.trim() ?? "";
    const closedRow = (settingsRes.data ?? []).find(
      (r) => r.ayar_anahtari === "is_closed"
    );
    const isClosed = closedRow?.ayar_degeri === "true";

    return { menuItems, restaurantName, whatsappPhone, isClosed };
  } catch {
    return { menuItems: [], restaurantName: "", whatsappPhone: "", isClosed: false };
  }
}

export default async function MenuPage() {
  const { menuItems, restaurantName, whatsappPhone, isClosed } = await getMenuData();
  return (
    <MenuClient
      menuItems={menuItems}
      restaurantName={restaurantName}
      whatsappPhone={whatsappPhone}
      isClosed={isClosed}
    />
  );
}
