"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { expensesSeed, menuItemsSeed, salesSeed, users } from "@/lib/mock-data";
import { hasSupabaseConfig } from "@/lib/supabase";
import { Expense, MenuItem, Sale, SaleItem } from "@/lib/types";

type TabType = "dashboard" | "sales" | "expenses" | "menu";

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function Home() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("dashboard");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuItemsSeed);
  const [sales, setSales] = useState<Sale[]>(salesSeed);
  const [expenses, setExpenses] = useState<Expense[]>(expensesSeed);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [expenseForm, setExpenseForm] = useState({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
  const [menuForm, setMenuForm] = useState({ name: "", category: "", price: "" });
  const [loginError, setLoginError] = useState("");

  const user = users.find((u) => u.id === currentUserId) ?? null;
  const activeMenu = useMemo(() => menuItems.filter((item) => item.active), [menuItems]);

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
    const found = users.find((u) => u.username === username && u.password === password);
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

  const createSale = () => {
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
    setSales((prev) => [newSale, ...prev]);
    setCart({});
  };

  const createExpense = () => {
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
    setExpenses((prev) => [newExpense, ...prev]);
    setExpenseForm({ title: "", supplier: "", amount: "", expenseDate: new Date().toISOString().slice(0, 10), note: "" });
  };

  const createMenuItem = () => {
    if (!menuForm.name || !menuForm.category || !menuForm.price) return;
    const price = Number(menuForm.price);
    if (Number.isNaN(price) || price <= 0) return;
    const newItem: MenuItem = { id: crypto.randomUUID(), name: menuForm.name, category: menuForm.category, price, active: true };
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
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-semibold">Restaurant Takip Sistemi</h1>
          <p className="mb-4 text-sm text-gray-500">Rol bazli giris ile siparis, gider ve analiz yonetimi</p>
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Supabase baglantisi: {hasSupabaseConfig ? "Hazir" : "Yok (simdilik demo veri ile calisiyor)"}
          </div>
          <div className="space-y-3">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kullanici adi" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Sifre" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button onClick={handleLogin} className="w-full rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">
              Giris Yap
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">Demo hesaplar: admin / manager / staff (sifre: 123456)</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl p-4">
      <header className="mb-4 rounded-2xl bg-white p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Restaurant Takip Sistemi</h1>
            <p className="text-sm text-gray-600">{user.name} - {user.role}</p>
          </div>
          <button onClick={() => setCurrentUserId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">
            Cikis
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["dashboard", "sales", "expenses", "menu"] as TabType[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-3 py-2 text-sm capitalize ${tab === item ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
              {item}
            </button>
          ))}
        </div>
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
          <div className="rounded-2xl bg-white p-4 shadow lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Menu Sec ve Siparis Olustur</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {activeMenu.map((item) => (
                <button key={item.id} onClick={() => addToCart(item.id)} className="rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                  <p className="text-sm text-blue-700">{tl.format(item.price)}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-semibold">Siparis Ozeti</h2>
            <div className="space-y-2">
              {Object.entries(cart).length === 0 ? <p className="text-sm text-gray-500">Sepet bos.</p> : null}
              {Object.entries(cart).map(([id, qty]) => {
                const item = menuItems.find((m) => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center justify-between rounded-lg border border-gray-200 p-2 text-sm">
                    <span>{item.name} x {qty}</span>
                    <span>{tl.format(item.price * qty)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-lg font-semibold">Toplam: {tl.format(orderTotal)}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={createSale} className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                Siparisi Kaydet
              </button>
              <button onClick={clearCart} className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">
                Temizle
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow lg:col-span-3">
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
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-semibold">Gider Ekle</h2>
            <div className="space-y-2">
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Baslik" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Tedarikci" value={expenseForm.supplier} onChange={(e) => setExpenseForm((prev) => ({ ...prev, supplier: e.target.value }))} />
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Tutar" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseDate: e.target.value }))} />
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Not" value={expenseForm.note} onChange={(e) => setExpenseForm((prev) => ({ ...prev, note: e.target.value }))} />
              <button onClick={createExpense} className="w-full rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
                Gider Kaydet
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow lg:col-span-2">
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
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-semibold">Menuye Urun Ekle</h2>
            <div className="space-y-2">
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Urun Adi" value={menuForm.name} onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Kategori" value={menuForm.category} onChange={(e) => setMenuForm((prev) => ({ ...prev, category: e.target.value }))} />
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Satis Fiyati" type="number" value={menuForm.price} onChange={(e) => setMenuForm((prev) => ({ ...prev, price: e.target.value }))} />
              <button onClick={createMenuItem} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Urun Ekle
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow lg:col-span-2">
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
                        <button onClick={() => setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, active: !m.active } : m)))} className={`rounded-md px-2 py-1 text-xs ${item.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
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
