"use client";

import { useEffect, useMemo, useState } from "react";
import { expensesSeed, menuItemsSeed, salesSeed, users } from "@/lib/mock-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { AppUser, Expense, MenuItem, Sale, SaleItem, UserRole } from "@/lib/types";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { ExpensesTab } from "@/components/dashboard/ExpensesTab";
import { MenuTab } from "@/components/dashboard/MenuTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { TransactionsTab } from "@/components/dashboard/TransactionsTab";
import { LoginView } from "@/components/dashboard/LoginView";

type TabType = "dashboard" | "sales" | "transactions" | "expenses" | "menu" | "settings";
type RestaurantSettings = { restaurantName: string; currency: string; timezone: string; taxRate: string };
type ToastType = "error" | "warning" | "success";
type Toast = { id: number; message: string; type: ToastType; title: string };

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const basePanelClass = "rounded-3xl border p-5 shadow-xl backdrop-blur";
const baseInputClass = "w-full rounded-xl border px-3 py-2 text-sm outline-none transition";
const RESTAURANT_NAME_STORAGE_KEY = "restaurant_name";
const makeReceiptNo = (dateIso: string, seq: number) => `F-${dateIso}-${String(seq).padStart(3, "0")}`;

export default function Home() {
  const [email, setEmail] = useState("admin@restaurant.local");
  const [password, setPassword] = useState("123456");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [appUsers, setAppUsers] = useState<AppUser[]>(users);
  const [tab, setTab] = useState<TabType>("dashboard");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuItemsSeed);
  const [sales, setSales] = useState<Sale[]>(salesSeed);
  const [expenses, setExpenses] = useState<Expense[]>(expensesSeed);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [expenseForm, setExpenseForm] = useState({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
  const [menuForm, setMenuForm] = useState({ name: "", category: "", price: "" });
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [restaurantName, setRestaurantName] = useState(() => {
    if (typeof window === "undefined") return "LUMINOX";
    return localStorage.getItem(RESTAURANT_NAME_STORAGE_KEY) || "LUMINOX";
  });
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    restaurantName: restaurantName || "LUMINOX",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    taxRate: "10",
  });

  const user = appUsers.find((u) => u.id === currentUserId) ?? null;
  const activeMenu = useMemo(() => menuItems.filter((item) => item.active), [menuItems]);
  const panelClass = `${basePanelClass} ${
    darkMode
      ? "border-white/10 bg-white/5 text-slate-100 shadow-slate-950/40 [&_.bg-white]:!bg-white/5 [&_.bg-slate-50]:!bg-white/5 [&_.border-slate-200]:!border-white/10 [&_.border-slate-300]:!border-white/15 [&_.text-slate-900]:!text-slate-100 [&_.text-slate-800]:!text-slate-100 [&_.text-slate-700]:!text-slate-200 [&_.text-slate-600]:!text-slate-300 [&_.text-slate-500]:!text-slate-400 [&_.text-slate-400]:!text-slate-500 [&_thead]:!bg-white/5"
      : "border-slate-200/80 bg-white/95 text-slate-900 shadow-slate-900/5"
  }`;
  const inputClass = `${baseInputClass} ${
    darkMode
      ? "border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;
  const canManageMenu = user?.role === "admin" || user?.role === "manager";
  const canManageSettings = user?.role === "admin" || user?.role === "manager";
  const canManageUsers = user?.role === "admin";

  const navItems: Array<{ key: TabType; label: string; icon: string; roles: Array<"admin" | "manager" | "staff"> }> = [
    { key: "dashboard", label: "Gösterge", icon: "◻︎", roles: ["admin", "manager", "staff"] },
    { key: "sales", label: "Satış", icon: "↗", roles: ["admin", "manager", "staff"] },
    { key: "menu", label: "Menü", icon: "⌂", roles: ["admin", "manager"] },
    { key: "transactions", label: "İşlemler", icon: "◫", roles: ["admin", "manager", "staff"] },
    { key: "expenses", label: "Gider", icon: "◔", roles: ["admin", "manager", "staff"] },
    { key: "settings", label: "Ayarlar", icon: "◌", roles: ["admin", "manager"] },
  ];
  const canAccessTab = (tabKey: TabType) => {
    if (!user) return false;
    const item = navItems.find((nav) => nav.key === tabKey);
    return item ? item.roles.includes(user.role) : false;
  };

  const pushToast = (message: string, type: ToastType = "error") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const titleByType: Record<ToastType, string> = {
      success: "Başarılı",
      warning: "Uyarı",
      error: "Hata",
    };
    setToasts((prev) => [...prev, { id, message, type, title: titleByType[type] }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  useEffect(() => {
    localStorage.setItem(RESTAURANT_NAME_STORAGE_KEY, restaurantName);
  }, [restaurantName]);

  useEffect(() => {
    if (currentUserId) {
      const timer = setTimeout(() => setDashboardVisible(true), 50);
      return () => clearTimeout(timer);
    }
    setDashboardVisible(false);
  }, [currentUserId]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;
    const supabaseClient = supabase;

    let isMounted = true;
    const mapAuthUserToAppUser = (authUser: { id: string; email?: string | null }) => {
      return appUsers.find((u) => u.authUserId === authUser.id || u.email === authUser.email) ?? null;
    };

    const syncSessionToAppUser = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!isMounted) return;
      const authUser = data.session?.user;
      if (!authUser) {
        setCurrentUserId(null);
        return;
      }
      const found = mapAuthUserToAppUser(authUser);
      setCurrentUserId(found?.id ?? null);
    };

    syncSessionToAppUser();

    const { data: authSubscription } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const authUser = session?.user;
      if (!authUser) {
        setCurrentUserId(null);
        return;
      }
      const found = mapAuthUserToAppUser(authUser);
      setCurrentUserId(found?.id ?? null);
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [appUsers]);

  useEffect(() => {
    const loadData = async () => {
      if (!hasSupabaseConfig || !supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const [usersRes, menuRes, salesRes, saleItemsRes, expensesRes] = await Promise.all([
        supabase.from("users").select("id, name, role, email, auth_user_id"),
        supabase.from("menu_items").select("id, name, category, price, active").order("name", { ascending: true }),
        supabase.from("sales").select("id, receipt_no, created_at, created_by, total_amount").order("created_at", { ascending: false }),
        supabase.from("sale_items").select("sale_id, menu_item_id, name, qty, unit_price, line_total"),
        supabase.from("expenses").select("id, receipt_no, title, supplier, amount, expense_date, note").order("expense_date", { ascending: false }),
      ]);

      const hasError = usersRes.error || menuRes.error || salesRes.error || saleItemsRes.error || expensesRes.error;
      if (hasError) {
        pushToast("Supabase verileri alinamadi. Demo veriler gosteriliyor.", "warning");
        setLoading(false);
        return;
      }

      const mappedUsers: AppUser[] = (usersRes.data ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email,
        authUserId: u.auth_user_id,
      }));
      const mappedMenu: MenuItem[] = (menuRes.data ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        price: Number(m.price),
        active: Boolean(m.active),
      }));
      const saleItemsBySale = (saleItemsRes.data ?? []).reduce<Record<string, SaleItem[]>>((acc, row) => {
        const item: SaleItem = {
          menuItemId: row.menu_item_id,
          name: row.name,
          qty: Number(row.qty),
          unitPrice: Number(row.unit_price),
          lineTotal: Number(row.line_total),
        };
        acc[row.sale_id] = [...(acc[row.sale_id] ?? []), item];
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

      if (mappedUsers.length > 0) setAppUsers(mappedUsers);
      setMenuItems(mappedMenu.length > 0 ? mappedMenu : menuItemsSeed);
      setSales(mappedSales.length > 0 ? mappedSales : []);
      setExpenses(mappedExpenses.length > 0 ? mappedExpenses : []);

      const settingsRes = await supabase
        .from("app_settings")
        .select("ayar_anahtari, ayar_degeri");

      if (!settingsRes.error && settingsRes.data) {
        const settingsByKey = settingsRes.data.reduce<Record<string, string>>((acc, row) => {
          acc[row.ayar_anahtari] = row.ayar_degeri;
          return acc;
        }, {});
        const nextRestaurantSettings: RestaurantSettings = {
          restaurantName: settingsByKey.restaurant_name || restaurantName || "LUMINOX",
          currency: settingsByKey.currency || "TRY",
          timezone: settingsByKey.timezone || "Europe/Istanbul",
          taxRate: settingsByKey.tax_rate || "10",
        };
        setRestaurantSettings(nextRestaurantSettings);
        setRestaurantName(nextRestaurantSettings.restaurantName);
      }

      setLoading(false);
    };

    loadData();
  }, []);

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

  const handleLogin = async () => {
    setLoginError(null);
    if (!email || !password) {
      setLoginError("E-posta ve şifre gerekli.");
      return;
    }

    setLoginSubmitting(true);

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setLoginError("Giriş başarısız. E-posta veya şifre hatalı.");
        setLoginSubmitting(false);
        return;
      }
      const found = appUsers.find((u) => u.authUserId === data.user.id || u.email === data.user.email);
      if (!found) {
        setLoginError("Kullanıcı profili bulunamadı. Lütfen yöneticinizle iletişime geçin.");
        setLoginSubmitting(false);
        return;
      }
      setShowSplash(true);
      setTimeout(() => {
        setCurrentUserId(found.id);
        setShowSplash(false);
        setLoginSubmitting(false);
        setTimeout(() => setDashboardVisible(true), 50);
      }, 1000);
      return;
    }

    const fallbackUser = appUsers.find((u) => u.email === email);
    if (!fallbackUser || password !== "123456") {
      setLoginError("Demo giriş: e-posta veya şifre hatalı.");
      setLoginSubmitting(false);
      return;
    }
    setShowSplash(true);
    setTimeout(() => {
      setCurrentUserId(fallbackUser.id);
      setShowSplash(false);
      setLoginSubmitting(false);
      setTimeout(() => setDashboardVisible(true), 50);
    }, 1000);
  };

  const handleLogout = async () => {
    if (hasSupabaseConfig && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUserId(null);
  };

  const addToCart = (menuItemId: string) => {
    setCart((prev) => ({ ...prev, [menuItemId]: (prev[menuItemId] ?? 0) + 1 }));
  };

  const clearCart = () => setCart({});

  const createSale = async () => {
    if (!user) return;
    const items: SaleItem[] = Object.entries(cart)
      .map(([id, qty]) => {
        const menuItem = menuItems.find((m) => m.id === id);
        if (!menuItem || qty <= 0) return null;
        return { menuItemId: id, name: menuItem.name, qty, unitPrice: menuItem.price, lineTotal: menuItem.price * qty };
      })
      .filter((item): item is SaleItem => Boolean(item));

    if (items.length === 0) return;
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const saleDateIso = new Date().toISOString().slice(0, 10);
    const saleSeq = sales.filter((sale) => sale.createdAt.slice(0, 10) === saleDateIso).length + 1;
    const receiptNo = makeReceiptNo(saleDateIso, saleSeq);
    const newSale: Sale = {
      id: crypto.randomUUID(),
      receiptNo,
      createdAt: new Date().toISOString(),
      createdBy: user.name,
      totalAmount,
      items,
    };

    if (hasSupabaseConfig && supabase) {
      const { data: saleInsert, error: saleError } = await supabase
        .from("sales")
        .insert({
          created_by: user.id,
          receipt_no: receiptNo,
          total_amount: totalAmount,
          payment_status: "paid_manual",
        })
        .select("id, receipt_no, created_at")
        .single();
      if (saleError || !saleInsert) {
        pushToast("Satis Supabase'e kaydedilemedi.");
        return;
      }

      const saleItemsPayload = items.map((item) => ({
        sale_id: saleInsert.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        qty: item.qty,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
      }));
      const { error: itemError } = await supabase.from("sale_items").insert(saleItemsPayload);
      if (itemError) {
        pushToast("Satis kalemleri Supabase'e kaydedilemedi.");
        return;
      }
      newSale.id = saleInsert.id;
      newSale.receiptNo = saleInsert.receipt_no ?? receiptNo;
      newSale.createdAt = saleInsert.created_at;
    }

    setSales((prev) => [newSale, ...prev]);
    setCart({});
    pushToast("Sipariş başarıyla kaydedildi.", "success");
  };

  const createExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.expenseDate) return;
    const amount = Number(expenseForm.amount);
    if (Number.isNaN(amount) || amount <= 0) return;
    const expenseDateIso = expenseForm.expenseDate;
    const expenseSeq = expenses.filter((expense) => expense.expenseDate === expenseDateIso).length + 1;
    const receiptNo = makeReceiptNo(expenseDateIso, expenseSeq);
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      receiptNo,
      title: expenseForm.title,
      supplier: expenseForm.supplier || "Bilinmiyor",
      amount,
      expenseDate: expenseForm.expenseDate,
      note: expenseForm.note,
    };

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          receipt_no: receiptNo,
          title: newExpense.title,
          supplier: newExpense.supplier,
          amount: newExpense.amount,
          expense_date: newExpense.expenseDate,
          note: newExpense.note,
          created_by: user?.id ?? null,
        })
        .select("id, receipt_no")
        .single();
      if (error || !data) {
        pushToast("Gider Supabase'e kaydedilemedi.");
        return;
      }
      newExpense.id = data.id;
      newExpense.receiptNo = data.receipt_no ?? receiptNo;
    }

    setExpenses((prev) => [newExpense, ...prev]);
    setExpenseForm({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
  };

  const createMenuItem = async () => {
    if (!canManageMenu) {
      pushToast("Bu işlem için yetkiniz yok.", "warning");
      return;
    }
    if (!menuForm.name || !menuForm.category || !menuForm.price) return;
    const price = Number(menuForm.price);
    if (Number.isNaN(price) || price <= 0) return;
    const newItem: MenuItem = { id: crypto.randomUUID(), name: menuForm.name, category: menuForm.category, price, active: true };

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: newItem.name,
          category: newItem.category,
          price: newItem.price,
          active: true,
        })
        .select("id")
        .single();
      if (error || !data) {
        pushToast("Menu urunu Supabase'e kaydedilemedi.");
        return;
      }
      newItem.id = data.id;
    }

    setMenuItems((prev) => [...prev, newItem]);
    setMenuForm({ name: "", category: "", price: "" });
  };

  const toggleMenuItem = async (item: MenuItem) => {
    if (!canManageMenu) {
      pushToast("Bu işlem için yetkiniz yok.", "warning");
      return;
    }
    const nextActive = !item.active;
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("menu_items").update({ active: nextActive }).eq("id", item.id);
      if (error) {
        pushToast("Menu durumu Supabase'de guncellenemedi.");
        return;
      }
    }
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, active: nextActive } : m)));
  };

  const deleteMenuItem = async (item: MenuItem) => {
    if (!canManageMenu) {
      pushToast("Bu işlem için yetkiniz yok.", "warning");
      return;
    }
    const hasSaleDependency = sales.some((sale) => sale.items.some((saleItem) => saleItem.menuItemId === item.id));
    if (hasSaleDependency) {
      pushToast("Bu ürün geçmiş satışlarda kullanıldığı için silinemez.", "warning");
      return;
    }

    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
      if (error) {
        pushToast("Menü ürünü Supabase'den silinemedi.");
        return;
      }
    }

    setMenuItems((prev) => prev.filter((menuItem) => menuItem.id !== item.id));
  };

  const saveRestaurantSettings = async (settings: RestaurantSettings) => {
    if (!canManageSettings) {
      pushToast("Ayarları değiştirme yetkiniz yok.", "warning");
      return;
    }
    setRestaurantSettings(settings);
    setRestaurantName(settings.restaurantName);

    if (!hasSupabaseConfig || !supabase) return;
    const payload = [
      { ayar_anahtari: "restaurant_name", ayar_degeri: settings.restaurantName, guncelleyen_kullanici: user?.id ?? null },
      { ayar_anahtari: "currency", ayar_degeri: settings.currency, guncelleyen_kullanici: user?.id ?? null },
      { ayar_anahtari: "timezone", ayar_degeri: settings.timezone, guncelleyen_kullanici: user?.id ?? null },
      { ayar_anahtari: "tax_rate", ayar_degeri: settings.taxRate, guncelleyen_kullanici: user?.id ?? null },
    ];
    const { error } = await supabase
      .from("app_settings")
      .upsert(payload, { onConflict: "ayar_anahtari" });

    if (error) {
      pushToast("Uygulama ayarlari Supabase'e kaydedilemedi.");
    }
  };

  const updateUserRole = async (targetUserId: string, nextRole: UserRole) => {
    if (!canManageUsers) {
      pushToast("Kullanıcı rolü güncelleme yetkiniz yok.", "warning");
      return;
    }

    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("users").update({ role: nextRole }).eq("id", targetUserId);
      if (error) {
        pushToast("Kullanıcı rolü Supabase'de güncellenemedi.");
        return;
      }
    }

    setAppUsers((prev) => prev.map((appUser) => (appUser.id === targetUserId ? { ...appUser, role: nextRole } : appUser)));
    pushToast("Kullanıcı rolü güncellendi.", "success");
  };

  const createUserByAdmin = async (payload: { name: string; email: string; password: string; role: UserRole }) => {
    if (!canManageUsers) {
      pushToast("Kullanıcı oluşturma yetkiniz yok.", "warning");
      return;
    }
    if (!supabase) {
      pushToast("Supabase baglantisi gerekli.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      pushToast("Oturum bulunamadi. Tekrar giris yapin.");
      return;
    }

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    const responseBody = await response.json();
    if (!response.ok) {
      pushToast(responseBody.error ?? "Kullanıcı oluşturulamadı.");
      return;
    }

    setAppUsers((prev) => [responseBody.user, ...prev]);
    pushToast("Kullanıcı başarıyla oluşturuldu.", "success");
  };

  const orderTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

  const activeTab = canAccessTab(tab) ? tab : "dashboard";

  if (!user) {
    return (
      <>
        {showSplash && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inline-block h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
              <span className="text-2xl">◻︎</span>
            </div>
            <p className="text-sm font-semibold tracking-widest text-indigo-300 uppercase">Yükleniyor...</p>
          </div>
        )}
        {!showSplash && (
          <LoginView
            hasSupabaseConfig={hasSupabaseConfig}
            loading={loading}
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={handleLogin}
            errorMessage={loginError}
            isSubmitting={loginSubmitting}
          />
        )}
      </>
    );
  }

  return (
    <main
      className={`relative min-h-screen w-full overflow-hidden p-4 transition-opacity duration-700 ${
        darkMode
          ? "theme-dark bg-slate-950 text-slate-100"
          : "theme-light bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100"
      } ${
        dashboardVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {!darkMode ? <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" /> : null}
      {!darkMode ? <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" /> : null}
      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className={`sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border px-0 py-5 shadow-xl shadow-slate-900/20 backdrop-blur ${
          darkMode ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white/90"
        }`}>
          <div className={`mx-4 rounded-2xl border px-4 py-4 ${
            darkMode
              ? "border-white/10 bg-slate-900/60"
              : "border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50"
          }`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-indigo-200" : "text-indigo-500"}`}>Marka</p>
            <p className={`mt-1 text-lg font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{restaurantName || "LUMINOX"}</p>
            <p className={`mt-1 text-xs ${darkMode ? "text-slate-300" : "text-slate-500"}`}>Restoran Analitiği</p>
          </div>
          <p className={`px-6 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>Ana Menü</p>
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isAllowed = user ? item.roles.includes(user.role) : false;
              return (
              <button
                key={item.key}
                onClick={() => {
                  if (!isAllowed) {
                    pushToast("Bu menü için yetkiniz yok.", "warning");
                    return;
                  }
                  setTab(item.key);
                }}
                disabled={!isAllowed}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                  activeTab === item.key
                    ? darkMode
                      ? "border-white/20 bg-white/10 text-indigo-100 shadow-sm"
                      : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 text-violet-700 shadow-sm"
                    : isAllowed
                    ? darkMode
                      ? "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/10 hover:text-white"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-900"
                    : "cursor-not-allowed border-transparent text-slate-400/60"
                }`}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm leading-none transition ${
                  darkMode
                    ? "bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                }`}>
                  {item.icon}
                </span>
                <span className="text-[15px] font-semibold">{item.label}</span>
              </button>
            )})}
          </nav>
          <div className={`mx-3 mt-5 rounded-2xl border px-3 py-3 ${
            darkMode ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white/70"
          }`}>
            <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>Yardım</p>
            <button
              onClick={() => {
                if (!canManageSettings) {
                  pushToast("Ayarlar sayfası için yetkiniz yok.", "warning");
                  return;
                }
                setTab("settings");
              }}
              className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left text-[15px] font-semibold transition ${
                darkMode ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm leading-none transition ${
                darkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
              }`}>⚙</span>
              <span>Ayarlar</span>
            </button>
            <button className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left text-[15px] font-semibold transition ${
              darkMode ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
            }`}>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm leading-none transition ${
                darkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
              }`}>ⓘ</span>
              <span>Yardım Merkezi</span>
            </button>
            <div className={`mt-1 flex items-center justify-between rounded-2xl border px-2 py-2.5 text-[15px] font-semibold ${
              darkMode ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-50/70 text-slate-700"
            }`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm leading-none transition ${
                  darkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
                }`}>◔</span>
                <span className="truncate">Karanlık Mod</span>
              </div>
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-300 ${
                  darkMode ? "border-indigo-500 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.2)]" : "border-slate-300 bg-slate-100"
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                    darkMode ? "translate-x-[24px]" : "translate-x-[4px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <header className={`flex min-h-[68px] flex-wrap items-center justify-between gap-3 rounded-3xl border px-4 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur ${
            darkMode ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white/90"
          }`}>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${darkMode ? "text-indigo-200" : "text-indigo-500"}`}>Panel</p>
              <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Restorant Yönetim Sistemi</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className={`flex h-10 min-w-[240px] items-center gap-2 rounded-2xl border px-3 ${
                darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              }`}>
                <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-500"}`}>⌕</span>
                <input readOnly value="Ara" className={`w-full bg-transparent text-sm outline-none ${darkMode ? "text-slate-300" : "text-slate-500"}`} />
                <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>⌘+K</span>
              </div>
              <button className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-sm ${
                darkMode ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-600"
              }`}>✉</button>
              <button className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-sm ${
                darkMode ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-600"
              }`}>◔</button>
              <button
                onClick={() => {
                  if (!canManageSettings) {
                    pushToast("Ayarlar sayfası için yetkiniz yok.", "warning");
                    return;
                  }
                  setTab("settings");
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-sm ${
                  darkMode ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                ⚙
              </button>
              <div className={`flex items-center gap-2 rounded-2xl border px-2 py-1.5 ${
                darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              }`}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200" />
                <button
                  onClick={handleLogout}
                  className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                    darkMode
                      ? "border-white/20 text-slate-200 hover:bg-white/10"
                      : "border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Çıkış
                </button>
              </div>
            </div>
          </header>

          {activeTab === "dashboard" ? (
            <DashboardTab
              tl={tl}
              stats={stats}
              sales={sales}
              salesChartData={salesChartData}
              menuItems={menuItems}
              darkMode={darkMode}
            />
          ) : null}

          {activeTab === "sales" ? (
            <SalesTab
              panelClass={panelClass}
              darkMode={darkMode}
              activeMenu={activeMenu}
              menuItems={menuItems}
              cart={cart}
              tl={tl}
              orderTotal={orderTotal}
              addToCart={addToCart}
              createSale={createSale}
              clearCart={clearCart}
              sales={sales}
            />
          ) : null}

          {activeTab === "transactions" ? (
            <TransactionsTab
              panelClass={panelClass}
              darkMode={darkMode}
              sales={sales}
              expenses={expenses}
              tl={tl}
            />
          ) : null}

          {activeTab === "expenses" ? (
            <ExpensesTab
              panelClass={panelClass}
              inputClass={inputClass}
              darkMode={darkMode}
              expenseForm={expenseForm}
              setExpenseForm={setExpenseForm}
              createExpense={createExpense}
              expenses={expenses}
              tl={tl}
            />
          ) : null}

          {activeTab === "menu" ? (
            <MenuTab
              panelClass={panelClass}
              inputClass={inputClass}
              darkMode={darkMode}
              menuForm={menuForm}
              setMenuForm={setMenuForm}
              createMenuItem={createMenuItem}
              menuItems={menuItems}
              tl={tl}
              toggleMenuItem={toggleMenuItem}
              deleteMenuItem={deleteMenuItem}
              canManageMenu={canManageMenu}
            />
          ) : null}

          {activeTab === "settings" ? (
            <SettingsTab
              user={user}
              panelClass={panelClass}
              inputClass={inputClass}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
              restaurantSettings={restaurantSettings}
              onSaveRestaurantSettings={saveRestaurantSettings}
              canManageSettings={canManageSettings}
              appUsers={appUsers}
              canManageUsers={canManageUsers}
              onUpdateUserRole={updateUserRole}
              onCreateUser={createUserByAdmin}
            />
          ) : null}
        </section>
      </div>
      <div className="pointer-events-none fixed right-4 top-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative w-[340px] overflow-hidden rounded-2xl border p-3 shadow-xl backdrop-blur animate-[toast-in_220ms_ease-out] ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : toast.type === "warning"
                ? "border-amber-200 bg-amber-50/95 text-amber-900"
                : "border-rose-200 bg-rose-50/95 text-rose-800"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : toast.type === "warning"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}>
                {toast.type === "success" ? "✓" : toast.type === "warning" ? "!" : "×"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-0.5 text-sm leading-snug">{toast.message}</p>
              </div>
            </div>
            <div className={`mt-2 h-1 w-full origin-left animate-[toast-progress_3500ms_linear] rounded-full ${
              toast.type === "success"
                ? "bg-emerald-300"
                : toast.type === "warning"
                ? "bg-amber-300"
                : "bg-rose-300"
            }`} />
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </main>
  );
}
