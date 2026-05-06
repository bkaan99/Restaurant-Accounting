"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { AppUser, AuditLog, Expense, MenuCategory, MenuItem, PermissionKey, ROLE_PERMISSION_DEFAULTS, RolePermissionConfig, Sale, SaleItem, RestaurantSettings, ToastType, UserRole } from "@/lib/types";

export function useRestaurantData(pushToast: (msg: string, type?: ToastType) => void, userId?: string | null) {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig>({
    admin: ROLE_PERMISSION_DEFAULTS.admin,
    manager: ROLE_PERMISSION_DEFAULTS.manager,
    staff: ROLE_PERMISSION_DEFAULTS.staff,
  });
  const [loading, setLoading] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    restaurantName: "LUMINOX",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    taxRate: "10",
  });
  const [expenseForm, setExpenseForm] = useState({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });

  const loadData = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const usersWithPermissionsRes = await supabase
        .from("users")
        .select("id, name, role, email, auth_user_id, permissions");

      const usersRes = usersWithPermissionsRes.error
        ? await supabase.from("users").select("id, name, role, email, auth_user_id")
        : usersWithPermissionsRes;

      const menuWithDescriptionRes = await supabase
        .from("menu_items")
        .select("id, name, description, category_id, price, active, menu_categories(id, name, active)")
        .order("name", { ascending: true });

      const menuRes = menuWithDescriptionRes.error
        ? await supabase.from("menu_items").select("id, name, description, category_id, price, active").order("name", { ascending: true })
        : menuWithDescriptionRes;

      const [categoriesRes, salesRes, saleItemsRes, expensesRes, auditLogsRes] = await Promise.all([
        supabase.from("menu_categories").select("id, name, active").order("name", { ascending: true }),
        supabase.from("sales").select("id, receipt_no, created_at, created_by, total_amount").order("created_at", { ascending: false }),
        supabase.from("sale_items").select("sale_id, menu_item_id, name, qty, unit_price, line_total"),
        supabase.from("expenses").select("id, receipt_no, title, supplier, amount, expense_date, note").order("expense_date", { ascending: false }),
        supabase
          .from("audit_logs")
          .select("id, event_type, table_name, record_id, changed_by_role, changed_at, old_data, new_data, metadata, changed_by_profile_id, users!audit_logs_changed_by_profile_id_fkey(name)")
          .order("changed_at", { ascending: false }),
      ]);

      if (usersRes.error || menuRes.error || salesRes.error || saleItemsRes.error || expensesRes.error) {
        pushToast("Supabase verileri alınamadı.", "warning");
        setLoading(false);
        return;
      }

      const mappedUsers: AppUser[] = (usersRes.data ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email,
        authUserId: u.auth_user_id,
        permissions: ("permissions" in u ? (u.permissions as PermissionKey[] | null) : null) ?? null,
      }));

      const mappedMenu: MenuItem[] = (menuRes.data ?? []).map((m) => {
        const categoryRelation = (m as { menu_categories?: unknown }).menu_categories;
        const constCategoryName =
          Array.isArray(categoryRelation)
            ? (categoryRelation[0] as { name?: string } | undefined)?.name
            : (categoryRelation as { name?: string } | null | undefined)?.name;

        return {
          id: m.id,
          name: m.name,
          description: "description" in m && typeof m.description === "string" ? m.description : null,
          category: constCategoryName ?? "Kategorisiz",
          categoryId: m.category_id ?? null,
          price: Number(m.price),
          active: Boolean(m.active),
        };
      });

      const mappedCategories: MenuCategory[] = (categoriesRes?.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        active: Boolean(c.active),
      }));

      const fallbackFromMenuItems: MenuCategory[] = Array.from(new Set(mappedMenu.map((m) => m.category))).map((name) => ({
        id: name,
        name,
        active: true,
      }));

      const saleItemsBySale = (saleItemsRes.data ?? []).reduce<Record<string, SaleItem[]>>((acc, row) => {
        acc[row.sale_id] = [...(acc[row.sale_id] ?? []), {
          menuItemId: row.menu_item_id,
          name: row.name,
          qty: Number(row.qty),
          unitPrice: Number(row.unit_price),
          lineTotal: Number(row.line_total),
        }];
        return acc;
      }, {});

      const usersById = mappedUsers.reduce<Record<string, string>>((acc, appUser) => {
        acc[appUser.id] = appUser.name;
        return acc;
      }, {});

      const mappedSales: Sale[] = (salesRes.data ?? []).map((s) => ({
        id: s.id,
        receiptNo: s.receipt_no ?? `SAT-${s.id.slice(0, 12).toUpperCase()}`,
        createdAt: s.created_at,
        createdBy: usersById[s.created_by] ?? "Bilinmiyor",
        totalAmount: Number(s.total_amount),
        items: saleItemsBySale[s.id] ?? [],
      }));

      const mappedExpenses: Expense[] = (expensesRes.data ?? []).map((e) => ({
        id: e.id,
        receiptNo: e.receipt_no ?? `GDR-${e.id.slice(0, 12).toUpperCase()}`,
        title: e.title,
        supplier: e.supplier ?? "Bilinmiyor",
        amount: Number(e.amount),
        expenseDate: e.expense_date,
        note: e.note ?? "",
      }));

      const mappedLogs: AuditLog[] = (auditLogsRes?.data || []).map((log) => {
        const eventType: AuditLog["eventType"] =
          log.event_type === "record_created" ||
          log.event_type === "record_updated" ||
          log.event_type === "record_deleted" ||
          log.event_type === "role_changed"
            ? log.event_type
            : "record_updated";

        return {
          id: Number(log.id),
          eventType,
          tableName: log.table_name,
          recordId: log.record_id,
          changedByRole: (log.changed_by_role as UserRole | null) ?? null,
          changedAt: log.changed_at,
          oldData: log.old_data,
          newData: log.new_data,
          metadata: log.metadata ?? {},
          actorName: log.users?.[0]?.name || "Sistem",
        };
      });

      setAuditLogs(mappedLogs);

      setAppUsers(mappedUsers);
      setMenuItems(mappedMenu);
      setMenuCategories(mappedCategories.length > 0 ? mappedCategories : fallbackFromMenuItems);
      setSales(mappedSales);
      setExpenses(mappedExpenses);

      const settingsRes = await supabase.from("app_settings").select("ayar_anahtari, ayar_degeri");
      if (!settingsRes.error && settingsRes.data) {
        const settingsByKey = settingsRes.data.reduce<Record<string, string>>((acc, row) => {
          acc[row.ayar_anahtari] = row.ayar_degeri;
          return acc;
        }, {});
        setRestaurantSettings({
          restaurantName: settingsByKey.restaurant_name || "LUMINOX",
          currency: settingsByKey.currency || "TRY",
          timezone: settingsByKey.timezone || "Europe/Istanbul",
          taxRate: settingsByKey.tax_rate || "10",
        });

        const parsePermissionSetting = (key: string, fallback: PermissionKey[]) => {
          const raw = settingsByKey[key];
          if (!raw) return fallback;
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as PermissionKey[]) : fallback;
          } catch {
            return fallback;
          }
        };

        setRolePermissions({
          admin: ROLE_PERMISSION_DEFAULTS.admin,
          manager: parsePermissionSetting("role_permissions_manager", ROLE_PERMISSION_DEFAULTS.manager),
          staff: parsePermissionSetting("role_permissions_staff", ROLE_PERMISSION_DEFAULTS.staff),
        });
      }
    } catch (err) {
      console.error("Data loading error:", err);
      pushToast("Veri yüklenirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (!userId) return; // Kullanıcı giriş yapmadan veri çekme
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [userId, loadData]);

  const stats = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      totalSales,
      totalExpenses,
      net: totalSales - totalExpenses,
      orderCount: sales.length,
    };
  }, [sales, expenses]);

  const salesChartData = useMemo(() => {
    const grouped = sales.reduce<Record<string, number>>((acc, sale) => {
      const key = sale.createdAt.slice(0, 10);
      acc[key] = (acc[key] ?? 0) + sale.totalAmount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  }, [sales]);

  // Handlers for MenuItem
  const createMenuItem = async (form: { name: string; description?: string; category: string; price: string }) => {
    const price = Number(form.price);
    if (!form.name || !form.category || isNaN(price) || price <= 0) return;
    
    const selectedCategory = menuCategories.find((c) => c.name === form.category) ?? null;
    const newItem: MenuItem = { id: crypto.randomUUID(), name: form.name, description: form.description || null, category: form.category, categoryId: selectedCategory?.id ?? null, price, active: true };
    if (hasSupabaseConfig && supabase) {
      if (!newItem.categoryId) {
        pushToast("Geçerli bir kategori seçin.", "warning");
        return;
      }
      const { data, error } = await supabase
        .from("menu_items")
        .insert({ name: newItem.name, description: newItem.description, category_id: newItem.categoryId, price: newItem.price, active: true })
        .select("id, category_id")
        .single();
      if (error || !data) {
        pushToast("Menü ürünü kaydedilemedi.");
        return;
      }
      newItem.id = data.id;
      newItem.categoryId = data.category_id ?? newItem.categoryId;
    }
    setMenuItems((prev) => [...prev, newItem]);
    pushToast("Ürün başarıyla eklendi.", "success");
  };

  const createMenuCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = menuCategories.some((c) => c.name.toLocaleLowerCase("tr-TR") === trimmed.toLocaleLowerCase("tr-TR"));
    if (exists) {
      pushToast("Bu kategori zaten mevcut.", "warning");
      return;
    }

    const newCategory: MenuCategory = {
      id: crypto.randomUUID(),
      name: trimmed,
      active: true,
    };

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from("menu_categories")
        .insert({ name: newCategory.name, active: true })
        .select("id, name, active")
        .single();

      if (error || !data) {
        pushToast("Kategori kaydedilemedi.");
        return;
      }

      newCategory.id = data.id;
      newCategory.name = data.name;
      newCategory.active = Boolean(data.active);
    }

    setMenuCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "tr")));
    pushToast("Kategori oluşturuldu.", "success");
  };

  const toggleMenuItem = async (item: MenuItem) => {
    const nextActive = !item.active;
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("menu_items").update({ active: nextActive }).eq("id", item.id);
      if (error) {
        pushToast("Menü durumu güncellenemedi.");
        return;
      }
    }
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, active: nextActive } : m)));
  };

  const deleteMenuItem = async (item: MenuItem) => {
    const hasSaleDependency = sales.some((sale) => sale.items.some((saleItem) => saleItem.menuItemId === item.id));
    if (hasSaleDependency) {
      pushToast("Bu ürün geçmiş satışlarda kullanıldığı için silinemez.", "warning");
      return;
    }
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
      if (error) {
        pushToast("Menü ürünü silinemedi.");
        return;
      }
    }
    setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
  };

  const updateMenuItem = async (item: MenuItem, updates: Partial<Pick<MenuItem, "name" | "description" | "category" | "price">>) => {
    const nextCategoryName = updates.category ?? item.category;
    const matchedCategory = menuCategories.find((c) => c.name === nextCategoryName) ?? null;
    const updated: MenuItem = { ...item, ...updates, categoryId: matchedCategory?.id ?? null };
    if (hasSupabaseConfig && supabase) {
      if (!updated.categoryId) {
        pushToast("Geçerli bir kategori seçin.", "warning");
        return;
      }
      const { error } = await supabase
        .from("menu_items")
        .update({ name: updated.name, description: updated.description, category_id: updated.categoryId, price: updated.price })
        .eq("id", item.id);
      if (error) {
        pushToast("Ürün güncellenemedi.");
        return;
      }
    }
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? updated : m)));
    pushToast("Ürün güncellendi.", "success");
  };

  // Handlers for Settings
  const saveRestaurantSettings = async (settings: RestaurantSettings, actorUserId?: string | null) => {
    setRestaurantSettings(settings);
    // Demo modda localStorage'a kaydet (landing page okuyabilsin)
    try {
      localStorage.setItem("restaurantSettings", JSON.stringify(settings));
    } catch {
      // sessizce geç
    }
    if (!hasSupabaseConfig || !supabase) return;
    const payload = [
      { ayar_anahtari: "restaurant_name", ayar_degeri: settings.restaurantName, guncelleyen_kullanici: actorUserId ?? null },
      { ayar_anahtari: "currency", ayar_degeri: settings.currency, guncelleyen_kullanici: actorUserId ?? null },
      { ayar_anahtari: "timezone", ayar_degeri: settings.timezone, guncelleyen_kullanici: actorUserId ?? null },
      { ayar_anahtari: "tax_rate", ayar_degeri: settings.taxRate, guncelleyen_kullanici: actorUserId ?? null },
    ];
    const fallbackPayload = payload.map(({ ayar_anahtari, ayar_degeri }) => ({ ayar_anahtari, ayar_degeri }));

    const { error } = await supabase.from("app_settings").upsert(payload, { onConflict: "ayar_anahtari" });
    if (error) {
      const { error: retryError } = await supabase.from("app_settings").upsert(fallbackPayload, { onConflict: "ayar_anahtari" });
      if (retryError) {
        pushToast(`Ayarlar kaydedilemedi: ${retryError.message}`);
      } else {
        pushToast("Ayarlar güncellendi.", "success");
      }
      return;
    }
    pushToast("Ayarlar güncellendi.", "success");
  };

  const updateUserRole = async (targetUserId: string, nextRole: UserRole) => {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("users").update({ role: nextRole }).eq("id", targetUserId);
      if (error) {
        pushToast("Kullanıcı rolü güncellenemedi.");
        return;
      }
    }
    setAppUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u)));
    pushToast("Kullanıcı rolü güncellendi.", "success");
  };

  const updateUserPermissions = async (targetUserId: string, permissions: PermissionKey[]) => {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("users").update({ permissions }).eq("id", targetUserId);
      if (error) {
        pushToast("Kullanıcı yetkileri güncellenemedi.");
        return;
      }
    }
    setAppUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, permissions } : u)));
    pushToast("Kullanıcı yetkileri güncellendi.", "success");
  };

  const updateRolePermissions = async (role: "manager" | "staff", permissions: PermissionKey[], actorUserId?: string | null) => {
    const settingKey = role === "manager" ? "role_permissions_manager" : "role_permissions_staff";
    if (hasSupabaseConfig && supabase) {
      const payload = [{
        ayar_anahtari: settingKey,
        ayar_degeri: JSON.stringify(permissions),
        guncelleyen_kullanici: actorUserId ?? null,
        aciklama: `${role} rolü izinleri`,
      }];
      const fallbackPayload = [{ ayar_anahtari: settingKey, ayar_degeri: JSON.stringify(permissions) }];

      const { error } = await supabase.from("app_settings").upsert(payload, { onConflict: "ayar_anahtari" });
      if (error) {
        const { error: retryError } = await supabase.from("app_settings").upsert(fallbackPayload, { onConflict: "ayar_anahtari" });
        if (retryError) {
          pushToast(`Rol yetkileri kaydedilemedi: ${retryError.message}`);
          return;
        }
      }
    }

    setRolePermissions((prev) => ({ ...prev, [role]: permissions }));
    pushToast("Rol yetkileri güncellendi.", "success");
  };

  const createSale = async (
    cart: Record<string, number>,
    actorUser: AppUser | null
  ) => {
    const items: SaleItem[] = Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find(m => m.id === id);
      if (!item || qty <= 0) return null;
      return { menuItemId: id, name: item.name, qty, unitPrice: item.price, lineTotal: item.price * qty };
    }).filter((i): i is SaleItem => i !== null);

    if (items.length === 0 || !actorUser) return;
    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const newSale: Sale = { id: crypto.randomUUID(), receiptNo: "", createdAt: new Date().toISOString(), createdBy: actorUser.name, totalAmount, items };

    if (hasSupabaseConfig && supabase) {
      const { data, error: saleError } = await supabase
        .rpc("create_sale_with_items", {
          p_items: items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            qty: i.qty,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
          })),
        })
        .single();
      const saleInsert = data as { id: string; receipt_no: string | null; created_at: string; total_amount: number | string } | null;
      if (saleError || !saleInsert) {
        pushToast("Satış kaydedilemedi.");
        return;
      }
      newSale.id = saleInsert.id;
      newSale.receiptNo = saleInsert.receipt_no ?? `SAT-${saleInsert.id.slice(0, 12).toUpperCase()}`;
      newSale.createdAt = saleInsert.created_at;
      newSale.totalAmount = Number(saleInsert.total_amount ?? totalAmount);
    } else {
      newSale.receiptNo = `SAT-${newSale.id.slice(0, 12).toUpperCase()}`;
    }
    setSales(prev => [newSale, ...prev]);
    pushToast("Satış başarıyla kaydedildi.", "success");
  };

  const createExpense = async (makeReceiptNo: (d: string, s: number) => string, actorUserId?: string | null) => {
    const amount = Number(expenseForm.amount);
    if (!expenseForm.title || isNaN(amount) || amount <= 0 || !expenseForm.expenseDate) return;
    
    const receiptNo = makeReceiptNo(expenseForm.expenseDate, expenses.filter(e => e.expenseDate === expenseForm.expenseDate).length + 1);
    const newExpense: Expense = { id: crypto.randomUUID(), receiptNo, title: expenseForm.title, supplier: expenseForm.supplier || "Bilinmiyor", amount, expenseDate: expenseForm.expenseDate, note: expenseForm.note };

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from("expenses").insert({ receipt_no: receiptNo, title: newExpense.title, supplier: newExpense.supplier, amount: newExpense.amount, expense_date: newExpense.expenseDate, note: newExpense.note, created_by: actorUserId ?? null }).select("id, receipt_no").single();
      if (error || !data) {
        pushToast("Gider kaydedilemedi.");
        return;
      }
      newExpense.id = data.id;
      newExpense.receiptNo = data.receipt_no ?? receiptNo;
    }
    setExpenses(prev => [newExpense, ...prev]);
    setExpenseForm({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
    pushToast("Gider kaydedildi.", "success");
  };

  const createUserByAdmin = async (payload: { name: string; email: string; password: string; role: UserRole }) => {
    if (!supabase) {
      pushToast("Supabase bağlantısı gerekli.");
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      pushToast("Oturum bulunamadı.");
      return;
    }
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      pushToast(body.error ?? "Kullanıcı oluşturulamadı.");
      return;
    }
    setAppUsers(prev => [body.user, ...prev]);
    pushToast("Kullanıcı oluşturuldu.", "success");
  };

  return {
    appUsers,
    menuItems,
    menuCategories,
    sales,
    expenses,
    auditLogs,
    loading,
    rolePermissions,
    restaurantSettings,
    stats,
    salesChartData,
    createMenuItem,
    createMenuCategory,
    toggleMenuItem,
    deleteMenuItem,
    updateMenuItem,
    saveRestaurantSettings,
    updateUserRole,
    updateUserPermissions,
    updateRolePermissions,
    setAppUsers,
    setExpenses,
    createSale,
    createExpense,
    createUserByAdmin,
    expenseForm,
    setExpenseForm,
  };
}
