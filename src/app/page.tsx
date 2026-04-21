"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { expensesSeed, menuItemsSeed, salesSeed, users } from "@/lib/mock-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { AppUser, Expense, MenuItem, Sale, SaleItem } from "@/lib/types";

type TabType = "dashboard" | "sales" | "expenses" | "menu";

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const panelClass = "rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur";
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Home() {
  const [username, setUsername] = useState("admin");
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

  const user = appUsers.find((u) => u.id === currentUserId) ?? null;
  const activeMenu = useMemo(() => menuItems.filter((item) => item.active), [menuItems]);

  useEffect(() => {
    const loadData = async () => {
      if (!hasSupabaseConfig || !supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setSyncError("");

      const [usersRes, menuRes, salesRes, saleItemsRes, expensesRes] = await Promise.all([
        supabase.from("users").select("id, name, role, username, password"),
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
        username: u.username,
        password: u.password,
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

  const expenseChartData = useMemo(() => {
    const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.supplier] = (acc[expense.supplier] ?? 0) + expense.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([supplier, amount]) => ({ supplier, amount }));
  }, [expenses]);

  const handleLogin = () => {
    const found = appUsers.find((u) => u.username === username && u.password === password);
    if (!found) {
      setLoginError("Kullanici adi veya sifre hatali.");
      return;
    }
    setLoginError("");
    setCurrentUserId(found.id);
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
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kullanici adi" className={inputClass} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Sifre" className={inputClass} />
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button onClick={handleLogin} className="w-full rounded-xl bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700">
              Giris Yap
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">Demo hesaplar: admin / manager / staff (sifre: 123456)</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-6">
      <header className={`${panelClass} mb-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Restaurant Takip Sistemi</h1>
            <p className="text-sm text-gray-600">{user.name} - {user.role}</p>
          </div>
          <button onClick={() => setCurrentUserId(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100">
            Cikis
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["dashboard", "sales", "expenses", "menu"] as TabType[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-xl px-3 py-2 text-sm capitalize transition ${tab === item ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {item}
            </button>
          ))}
        </div>
        {syncError ? <p className="mt-3 text-xs text-red-600">{syncError}</p> : null}
      </header>

      {tab === "dashboard" ? (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Toplam Satis" value={tl.format(stats.totalSales)} />
            <Card title="Toplam Gider" value={tl.format(stats.totalExpenses)} />
            <Card title="Net Fark" value={tl.format(stats.net)} />
            <Card title="Toplam Siparis" value={String(stats.orderCount)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Gunluk Satis Trendi">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => tl.format(Number(value))} />
                  <Line dataKey="total" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Tedarikci Bazli Gider">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={expenseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="supplier" />
                  <YAxis />
                  <Tooltip formatter={(value) => tl.format(Number(value))} />
                  <Bar dataKey="amount" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>
      ) : null}

      {tab === "sales" ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className={`${panelClass} lg:col-span-2`}>
            <h2 className="mb-3 text-lg font-semibold">Menu Sec ve Siparis Olustur</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {activeMenu.map((item) => (
                <button key={item.id} onClick={() => addToCart(item.id)} className="rounded-xl border border-slate-200 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-50">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                  <p className="text-sm text-blue-700">{tl.format(item.price)}</p>
                </button>
              ))}
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-semibold">Siparis Ozeti</h2>
            <div className="space-y-2">
              {Object.entries(cart).length === 0 ? <p className="text-sm text-gray-500">Sepet bos.</p> : null}
              {Object.entries(cart).map(([id, qty]) => {
                const item = menuItems.find((m) => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center justify-between rounded-xl border border-slate-200 p-2 text-sm">
                    <span>{item.name} x {qty}</span>
                    <span>{tl.format(item.price * qty)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-lg font-semibold">Toplam: {tl.format(orderTotal)}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={createSale} className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700">
                Siparisi Kaydet
              </button>
              <button onClick={clearCart} className="rounded-xl border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100">
                Temizle
              </button>
            </div>
          </div>
          <div className={`${panelClass} lg:col-span-3`}>
            <h2 className="mb-3 text-lg font-semibold">Son Siparisler</h2>
            <div className="overflow-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2">Tarih</th>
                    <th>Personel</th>
                    <th>Kalem</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100">
                      <td className="py-2">{new Date(sale.createdAt).toLocaleString("tr-TR")}</td>
                      <td>{sale.createdBy}</td>
                      <td>{sale.items.map((item) => `${item.name} (${item.qty})`).join(", ")}</td>
                      <td>{tl.format(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "expenses" ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-semibold">Gider Ekle</h2>
            <div className="space-y-2">
              <input className={inputClass} placeholder="Baslik" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
              <input className={inputClass} placeholder="Tedarikci" value={expenseForm.supplier} onChange={(e) => setExpenseForm((prev) => ({ ...prev, supplier: e.target.value }))} />
              <input className={inputClass} placeholder="Tutar" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
              <input className={inputClass} type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
              <textarea className={inputClass} placeholder="Not" value={expenseForm.note} onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))} />
              <button onClick={createExpense} className="w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700">
                Gider Kaydet
              </button>
            </div>
          </div>
          <div className={`${panelClass} lg:col-span-2`}>
            <h2 className="mb-3 text-lg font-semibold">Gider Listesi</h2>
            <div className="overflow-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2">Tarih</th>
                    <th>Baslik</th>
                    <th>Tedarikci</th>
                    <th>Not</th>
                    <th>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100">
                      <td className="py-2">{expense.expenseDate}</td>
                      <td>{expense.title}</td>
                      <td>{expense.supplier}</td>
                      <td>{expense.note || "-"}</td>
                      <td>{tl.format(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "menu" ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-semibold">Menuye Urun Ekle</h2>
            <div className="space-y-2">
              <input className={inputClass} placeholder="Urun Adi" value={menuForm.name} onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className={inputClass} placeholder="Kategori" value={menuForm.category} onChange={(e) => setMenuForm((prev) => ({ ...prev, category: e.target.value }))} />
              <input className={inputClass} placeholder="Satis Fiyati" type="number" value={menuForm.price} onChange={(e) => setMenuForm((prev) => ({ ...prev, price: e.target.value }))} />
              <button onClick={createMenuItem} className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                Urun Ekle
              </button>
            </div>
          </div>
          <div className={`${panelClass} lg:col-span-2`}>
            <h2 className="mb-3 text-lg font-semibold">Menu Listesi</h2>
            <div className="overflow-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2">Urun</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2">{item.name}</td>
                      <td>{item.category}</td>
                      <td>{tl.format(item.price)}</td>
                      <td>
                        <button
                          onClick={async () => {
                            const nextActive = !item.active;
                            if (hasSupabaseConfig && supabase) {
                              const { error } = await supabase.from("menu_items").update({ active: nextActive }).eq("id", item.id);
                              if (error) {
                                setSyncError("Menu durumu Supabase'de guncellenemedi.");
                                return;
                              }
                            }
                            setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, active: nextActive } : m)));
                          }}
                          className={`rounded-md px-2 py-1 text-xs ${item.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
                        >
                          {item.active ? "Aktif" : "Pasif"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}
