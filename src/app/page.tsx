"use client";

import { useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { ALL_PERMISSIONS, PermissionKey, TabType, UserRole } from "@/lib/types";

// Components
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { ExpensesTab } from "@/components/dashboard/ExpensesTab";
import { MenuTab } from "@/components/dashboard/MenuTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { TransactionsTab } from "@/components/dashboard/TransactionsTab";
import { AuditLogsTab } from "@/components/dashboard/AuditLogsTab";
import { LoginView } from "@/components/dashboard/LoginView";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { SearchModal } from "@/components/ui/SearchModal";

// Hooks
import { useAuth } from "@/lib/hooks/useAuth";
import { useRestaurantData } from "@/lib/hooks/useRestaurantData";
import { useToast } from "@/lib/hooks/useToast";

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const basePanelClass = "rounded-3xl border p-5 shadow-xl backdrop-blur";
const baseInputClass = "w-full rounded-xl border px-3 py-2 text-sm outline-none transition";
const makeReceiptNo = (dateIso: string, seq: number) => `F-${dateIso}-${String(seq).padStart(3, "0")}`;

export default function Home() {
  // Global App State
  const [tab, setTab] = useState<TabType>("dashboard");
  
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab") as TabType;
    if (savedTab) {
      setTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", tab);
  }, [tab]);

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [menuForm, setMenuForm] = useState({ name: "", category: "", price: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  
  // Custom Hooks
  const { toasts, pushToast } = useToast();
  const { 
    appUsers, 
    menuItems, 
    sales, 
    expenses, 
    auditLogs,
    rolePermissions,
    loading, 
    restaurantSettings, 
    stats, 
    salesChartData,
    createMenuItem,
    toggleMenuItem,
    deleteMenuItem,
    saveRestaurantSettings,
    updateUserRole,
    updateRolePermissions,
    createSale: executeSale,
    createExpense,
    createUserByAdmin,
    expenseForm,
    setExpenseForm,
  } = useRestaurantData(pushToast);

  const { 
    user, 
    loginError, 
    loginSubmitting, 
    showSplash, 
    isCheckingAuth,
    handleLogin, 
    handleLogout,
    email,
    password,
    setEmail,
    setPassword
  } = useAuth(appUsers);

  // Computed styles
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

  const hasPermission = (permission: PermissionKey) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const effectivePermissions = user.permissions ?? rolePermissions[user.role];
    return effectivePermissions.includes(permission);
  };

  // Role/Permission Checks
  const canManageMenu = hasPermission("menu_manage");
  const canManageSettings = hasPermission("settings_manage");
  const canManageUsers = hasPermission("users_manage");
  const canManagePermissions = hasPermission("permissions_manage");

  const navItems: Array<{ key: TabType; label: string; icon: React.ReactNode; roles: UserRole[] }> = [
    { 
      key: "dashboard", label: "Dashboard", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    { 
      key: "sales", label: "Satışlar", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    { 
      key: "menu", label: "Menü Paneli", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    { 
      key: "transactions", label: "İşlemler", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    },
    { 
      key: "expenses", label: "Giderler", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    },
    { 
      key: "settings", label: "Ayarlar", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      key: "audit", label: "Audit Log", roles: ["admin", "manager", "staff"],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M9 8h6m-9 12h12a2 2 0 002-2V6a2 2 0 00-2-2h-3.5a1.5 1.5 0 01-3 0H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
  ];

  const tabPermissionMap: Record<TabType, PermissionKey> = {
    dashboard: "dashboard_view",
    sales: "sales_manage",
    transactions: "transactions_view",
    expenses: "expenses_manage",
    menu: "menu_manage",
    settings: "settings_manage",
    audit: "audit_view",
  };

  const canAccessTab = (tabKey: TabType) => {
    return hasPermission(tabPermissionMap[tabKey]);
  };

  const activeTab = canAccessTab(tab) ? tab : "dashboard";

  // Effects
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setDashboardVisible(true), 50);
      return () => clearTimeout(timer);
    }
    setDashboardVisible(false);
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { sales: [], expenses: [], menu: [] };
    const q = searchQuery.toLowerCase();
    return {
      sales: sales.filter(s => 
        s.receiptNo.toLowerCase().includes(q) || 
        s.createdBy.toLowerCase().includes(q) ||
        s.items.some(i => i.name.toLowerCase().includes(q))
      ).slice(0, 5),
      expenses: expenses.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.supplier.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q))
      ).slice(0, 5),
      menu: menuItems.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      ).slice(0, 5)
    };
  }, [searchQuery, sales, expenses, menuItems]);

  const activeMenu = useMemo(() => menuItems.filter((item) => item.active), [menuItems]);
  const orderTotal = useMemo(() => Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return item ? sum + item.price * qty : sum;
  }, 0), [cart, menuItems]);

  const createSale = () => executeSale(cart, makeReceiptNo, user).then(() => setCart({}));

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-block h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <span className="text-2xl text-white">◻︎</span>
        </div>
        <p className="text-sm font-semibold tracking-widest text-indigo-300 uppercase">Sistem Hazırlanıyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showSplash && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inline-block h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
              <span className="text-2xl text-white">◻︎</span>
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
    <main className={`relative min-h-screen w-full overflow-hidden p-4 transition-opacity duration-700 ${
        darkMode ? "theme-dark bg-slate-950 text-slate-100" : "theme-light bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100"
      } ${dashboardVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <Sidebar 
          user={user} 
          tab={activeTab} 
          setTab={setTab} 
          restaurantName={restaurantSettings.restaurantName} 
          darkMode={darkMode}
          navItems={navItems}
          canAccessTab={canAccessTab}
          onSettingsClick={() => setTab("settings")}
          pushToast={pushToast}
        />

        <div className="space-y-4">
          <header className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition ${
                  darkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-sm font-medium">Hızlı ara...</span>
                <kbd className="text-[10px] opacity-40 font-bold">⌘K</kbd>
              </button>
            </div>
            
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  darkMode 
                    ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                title={darkMode ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v20" />
                  <path d="M12 22A10 10 0 0 1 12 2V22z" fill="currentColor" />
                </svg>
              </button>

              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition ${
                  isProfileOpen 
                    ? (darkMode ? "border-indigo-500/50 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50")
                    : (darkMode ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-slate-200 bg-white hover:bg-slate-50")
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white shadow-sm">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="hidden text-left sm:block">
                  <p className={`text-[10px] font-bold leading-tight ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{user.name}</p>
                  <p className="text-[9px] font-medium text-slate-400 capitalize">{user.role}</p>
                </div>
                <svg className={`h-3 w-3 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className={`absolute right-0 top-full z-20 mt-2 w-48 origin-top-right rounded-2xl border p-2 shadow-xl animate-in fade-in zoom-in duration-200 ${
                    darkMode ? "border-white/10 bg-slate-900 text-slate-200" : "border-slate-100 bg-white text-slate-700"
                  }`}>
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { setTab("settings"); setIsProfileOpen(false); }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profil Ayarları
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          <section className="min-h-[80vh]">
            {activeTab === "dashboard" && <DashboardTab darkMode={darkMode} panelClass={panelClass} stats={stats} salesChartData={salesChartData} sales={sales} expenses={expenses} menuItems={menuItems} tl={tl} />}
            {activeTab === "sales" && <SalesTab darkMode={darkMode} panelClass={panelClass} inputClass={inputClass} menuItems={menuItems} activeMenu={activeMenu} cart={cart} orderTotal={orderTotal} addToCart={(id) => setCart(p => ({...p, [id]: (p[id]??0)+1}))} clearCart={() => setCart({})} createSale={createSale} sales={sales} tl={tl} />}
            {activeTab === "transactions" && <TransactionsTab darkMode={darkMode} panelClass={panelClass} sales={sales} expenses={expenses} tl={tl} />}
            {activeTab === "expenses" && <ExpensesTab darkMode={darkMode} panelClass={panelClass} inputClass={inputClass} expenses={expenses} expenseForm={expenseForm} setExpenseForm={setExpenseForm} createExpense={() => createExpense(makeReceiptNo, user?.id ?? null)} tl={tl} />}
            {activeTab === "menu" && (
              <MenuTab
                darkMode={darkMode}
                panelClass={panelClass}
                inputClass={inputClass}
                menuForm={menuForm}
                setMenuForm={setMenuForm}
                createMenuItem={async () => {
                  await createMenuItem(menuForm);
                  setMenuForm({ name: "", category: "", price: "" });
                }}
                menuItems={menuItems}
                tl={tl}
                toggleMenuItem={toggleMenuItem}
                deleteMenuItem={deleteMenuItem}
                canManageMenu={canManageMenu}
              />
            )}
            {activeTab === "settings" && <SettingsTab user={user} panelClass={panelClass} inputClass={inputClass} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} restaurantSettings={restaurantSettings} onSaveRestaurantSettings={(settings) => saveRestaurantSettings(settings, user?.id ?? null)} canManageSettings={canManageSettings} appUsers={appUsers} canManageUsers={canManageUsers} canManagePermissions={canManagePermissions} onUpdateUserRole={updateUserRole} onUpdateRolePermissions={updateRolePermissions} rolePermissions={rolePermissions} onCreateUser={createUserByAdmin} allPermissions={ALL_PERMISSIONS} />}
            {activeTab === "audit" && <AuditLogsTab panelClass={panelClass} darkMode={darkMode} auditLogs={auditLogs} />}
          </section>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchQuery={searchQuery} setSearchQuery={setSearchQuery} results={searchResults} darkMode={darkMode} tl={tl} onNavigate={setTab} />
      <ToastContainer toasts={toasts} />
    </main>
  );
}
