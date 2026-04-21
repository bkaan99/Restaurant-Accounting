"use client";

import { useEffect, useMemo, useState } from "react";
import { expensesSeed, menuItemsSeed, salesSeed, users } from "@/lib/mock-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { AppUser, Expense, MenuItem, Sale, SaleItem } from "@/lib/types";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { ExpensesTab } from "@/components/dashboard/ExpensesTab";
import { MenuTab } from "@/components/dashboard/MenuTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

type TabType = "dashboard" | "sales" | "expenses" | "menu" | "settings";

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const panelClass = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm";
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [syncError, setSyncError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const user = appUsers.find((u) => u.id === currentUserId) ?? null;
  const activeMenu = useMemo(() => menuItems.filter((item) => item.active), [menuItems]);

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
      setSyncError("");

      const [usersRes, menuRes, salesRes, saleItemsRes, expensesRes] = await Promise.all([
        supabase.from("users").select("id, name, role, email, auth_user_id"),
        supabase.from("menu_items").select("id, name, category, price, active").order("name", { ascending: true }),
        supabase.from("sales").select("id, created_at, created_by, total_amount").order("created_at", { ascending: false }),
        supabase.from("sale_items").select("sale_id, menu_item_id, name, qty, unit_price, line_total"),
        supabase.from("expenses").select("id, title, supplier, amount, expense_date, note").order("expense_date", { ascending: false }),
      ]);

      const hasError = usersRes.error || menuRes.error || salesRes.error || saleItemsRes.error || expensesRes.error;
      if (hasError) {
        setSyncError("Supabase verileri alinamadi. Demo veriler gosteriliyor.");
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
        createdAt: s.created_at,
        createdBy: usersById[s.created_by] ?? "Bilinmiyor",
        totalAmount: Number(s.total_amount),
        items: saleItemsBySale[s.id] ?? [],
      }));
      const mappedExpenses: Expense[] = (expensesRes.data ?? []).map((e) => ({
        id: e.id,
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
    if (!email || !password) {
      setLoginError("E-posta ve sifre gerekli.");
      return;
    }

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setLoginError("Giris basarisiz. E-posta veya sifre hatali.");
        return;
      }
      const found = appUsers.find((u) => u.authUserId === data.user.id || u.email === data.user.email);
      if (!found) {
        setLoginError("Kullanici profili bulunamadi. users tablosunu kontrol edin.");
        return;
      }
      setLoginError("");
      setCurrentUserId(found.id);
      return;
    }

    const fallbackUser = appUsers.find((u) => u.email === email);
    if (!fallbackUser || password !== "123456") {
      setLoginError("Demo giris: e-posta veya sifre hatali.");
      return;
    }
    setLoginError("");
    setCurrentUserId(fallbackUser.id);
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
    const newSale: Sale = {
      id: crypto.randomUUID(),
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
          total_amount: totalAmount,
          payment_status: "paid_manual",
        })
        .select("id, created_at")
        .single();
      if (saleError || !saleInsert) {
        setSyncError("Satis Supabase'e kaydedilemedi.");
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
        setSyncError("Satis kalemleri Supabase'e kaydedilemedi.");
        return;
      }
      newSale.id = saleInsert.id;
      newSale.createdAt = saleInsert.created_at;
    }

    setSales((prev) => [newSale, ...prev]);
    setCart({});
  };

  const createExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.expenseDate) return;
    const amount = Number(expenseForm.amount);
    if (Number.isNaN(amount) || amount <= 0) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
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
          title: newExpense.title,
          supplier: newExpense.supplier,
          amount: newExpense.amount,
          expense_date: newExpense.expenseDate,
          note: newExpense.note,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (error || !data) {
        setSyncError("Gider Supabase'e kaydedilemedi.");
        return;
      }
      newExpense.id = data.id;
    }

    setExpenses((prev) => [newExpense, ...prev]);
    setExpenseForm({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
  };

  const createMenuItem = async () => {
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
        setSyncError("Menu urunu Supabase'e kaydedilemedi.");
        return;
      }
      newItem.id = data.id;
    }

    setMenuItems((prev) => [...prev, newItem]);
    setMenuForm({ name: "", category: "", price: "" });
  };

  const toggleMenuItem = async (item: MenuItem) => {
    const nextActive = !item.active;
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("menu_items").update({ active: nextActive }).eq("id", item.id);
      if (error) {
        setSyncError("Menu durumu Supabase'de guncellenemedi.");
        return;
      }
    }
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, active: nextActive } : m)));
  };

  const orderTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Restaurant Takip Sistemi</h1>
          <p className="mb-4 text-sm text-slate-500">Rol bazli giris ile siparis, gider ve analiz yonetimi</p>
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Supabase baglantisi: {hasSupabaseConfig ? "Hazir" : "Yok (simdilik demo veri ile calisiyor)"}
          </div>
          {loading ? <p className="mb-3 text-xs text-blue-700">Supabase verileri yukleniyor...</p> : null}
          {syncError ? <p className="mb-3 text-xs text-red-600">{syncError}</p> : null}
          <div className="space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inputClass} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Sifre" className={inputClass} />
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button onClick={handleLogin} className="w-full rounded-xl bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700">
              Giris Yap
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">Supabase Auth ile e-posta/sifre girisi kullanilir.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4">
      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <aside className="sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-5 text-2xl font-bold tracking-wide text-slate-800">LUMINOX</p>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Ana Menü</p>
          <nav className="space-y-1.5">
            {(["dashboard", "sales", "expenses", "menu", "settings"] as TabType[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  tab === item ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item === "dashboard" && "Gösterge Paneli"}
                {item === "sales" && "Satışlar"}
                {item === "expenses" && "Giderler"}
                {item === "menu" && "Menü"}
                {item === "settings" && "Ayarlar"}
              </button>
            ))}
          </nav>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Destek</p>
            <button onClick={() => setTab("settings")} className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50">Ayarlar</button>
            <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50">Yardım Merkezi</button>
            <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600">
              <span>Karanlık Mod</span>
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${darkMode ? "bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <header className={`${panelClass} flex flex-wrap items-center justify-between gap-3`}>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Satış Paneli</h1>
            <div className="min-w-[260px] flex-1">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-slate-400">🔎</span>
                <input
                  readOnly
                  value="Ara..."
                  className="w-full bg-transparent text-sm text-slate-400 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">🔔</button>
              <button onClick={() => setTab("settings")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">⚙️</button>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {loading ? "Yükleniyor..." : "Canlı"}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Çıkış
                </button>
              </div>
            </div>
            {syncError ? <p className="w-full text-xs text-red-600">{syncError}</p> : null}
          </header>

          {tab === "dashboard" ? (
            <DashboardTab
              tl={tl}
              stats={stats}
              sales={sales}
              salesChartData={salesChartData}
              menuItems={menuItems}
            />
          ) : null}

          {tab === "sales" ? (
            <SalesTab
              panelClass={panelClass}
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

          {tab === "expenses" ? (
            <ExpensesTab
              panelClass={panelClass}
              inputClass={inputClass}
              expenseForm={expenseForm}
              setExpenseForm={setExpenseForm}
              createExpense={createExpense}
              expenses={expenses}
              tl={tl}
            />
          ) : null}

          {tab === "menu" ? (
            <MenuTab
              panelClass={panelClass}
              inputClass={inputClass}
              menuForm={menuForm}
              setMenuForm={setMenuForm}
              createMenuItem={createMenuItem}
              menuItems={menuItems}
              tl={tl}
              toggleMenuItem={toggleMenuItem}
            />
          ) : null}

          {tab === "settings" ? (
            <SettingsTab
              user={user}
              panelClass={panelClass}
              inputClass={inputClass}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
