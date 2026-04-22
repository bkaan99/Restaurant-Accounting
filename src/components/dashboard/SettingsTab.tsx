"use client";

import { useState } from "react";
import { AppUser, UserRole } from "@/lib/types";
import { hasSupabaseConfig } from "@/lib/supabase";

type RestaurantSettings = {
  restaurantName: string;
  currency: string;
  timezone: string;
  taxRate: string;
};

export function SettingsTab({
  user,
  panelClass,
  inputClass,
  darkMode,
  onToggleDarkMode,
  restaurantSettings,
  onSaveRestaurantSettings,
  canManageSettings,
  appUsers,
  canManageUsers,
  onUpdateUserRole,
  onCreateUser,
}: {
  user: AppUser;
  panelClass: string;
  inputClass: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  restaurantSettings: RestaurantSettings;
  onSaveRestaurantSettings: (settings: RestaurantSettings) => Promise<void>;
  canManageSettings: boolean;
  appUsers: AppUser[];
  canManageUsers: boolean;
  onUpdateUserRole: (targetUserId: string, nextRole: UserRole) => Promise<void>;
  onCreateUser: (payload: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
}) {
  const defaultRestaurantSettings: RestaurantSettings = {
    restaurantName: "LUMINOX",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    taxRate: "10",
  };

  const [localRestaurantSettings, setLocalRestaurantSettings] = useState<RestaurantSettings>(restaurantSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "restaurant" | "users" | "appearance" | "system">("profile");
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [newUserForm, setNewUserForm] = useState<{ name: string; email: string; password: string; role: UserRole }>({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const handleSave = async () => {
    await onSaveRestaurantSettings(localRestaurantSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { 
      id: "profile", 
      label: "Profil", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: "restaurant", 
      label: "İşletme", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: "users", 
      label: "Kullanıcılar", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: "appearance", 
      label: "Görünüm", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    { 
      id: "system", 
      label: "Sistem", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ] as const;

  const getSectionTitle = () => {
    return sections.find((s) => s.id === activeSection)?.label + " Ayarları";
  };

  const getSectionDescription = () => {
    if (activeSection === "profile") return "Hesap bilgilerinizi ve profil detaylarınızı buradan yönetebilirsiniz.";
    if (activeSection === "restaurant") return "İşletme bilgilerini, para birimini ve vergi oranlarını güncelleyin.";
    if (activeSection === "users") return "Ekip üyelerini ekleyin, rollerini ve yetkilerini düzenleyin.";
    if (activeSection === "appearance") return "Uygulamanın görünümünü ve kullanıcı arayüzünü özelleştirin.";
    return "Sistem bağlantı durumunu ve altyapı detaylarını inceleyin.";
  };

  return (
    <div className={`${panelClass} overflow-hidden p-0 flex flex-col md:flex-row min-h-[600px]`}>
      {/* Birleşik Sidebar */}
      <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r ${darkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-sm font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Ayarlar</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kontrol Paneli</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                  activeSection === s.id
                    ? darkMode
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className={`transition-colors ${activeSection === s.id ? (darkMode ? "text-indigo-400" : "text-indigo-600") : "text-slate-400 group-hover:text-slate-500"}`}>
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 hidden md:block">
          <div className={`p-4 rounded-2xl border ${darkMode ? "border-white/5 bg-white/5" : "border-slate-100 bg-white"}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destek</p>
            <p className={`text-xs font-medium leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Yardıma mı ihtiyacınız var? Destek ekibimizle görüşün.</p>
          </div>
        </div>
      </aside>

      {/* Birleşik İçerik Alanı */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-8 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-transparent to-indigo-500/[0.02]">
          <h1 className={`text-2xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{getSectionTitle()}</h1>
          <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{getSectionDescription()}</p>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-300px)]">
          {/* Profil */}
          {activeSection === "profile" && (
            <div className="max-w-3xl space-y-8">
              <div className="flex items-center gap-6">
                <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-inner ${
                  darkMode ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-white/10" : "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{user.name}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider ring-1 ring-emerald-500/20">Aktif</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider ring-1 ring-indigo-500/20">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ad Soyad</label>
                  <div className={`px-4 py-3 rounded-xl border font-bold ${darkMode ? "bg-white/5 border-white/5 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">E-posta</label>
                  <div className={`px-4 py-3 rounded-xl border font-bold ${darkMode ? "bg-white/5 border-white/5 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    {user.email}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-start gap-3 border ${darkMode ? "bg-amber-500/5 border-amber-500/20 text-amber-200" : "bg-amber-50 border-amber-100 text-amber-900"}`}>
                <span className="text-lg">ℹ️</span>
                <p className="text-xs font-bold leading-relaxed">Güvenlik gereği profil bilgileri ve şifre yalnızca sistem yöneticisi tarafından değiştirilebilir.</p>
              </div>
            </div>
          )}

          {/* Restoran */}
          {activeSection === "restaurant" && (
            <div className="max-w-3xl space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Restoran Adı</label>
                  <input
                    className={inputClass}
                    value={localRestaurantSettings.restaurantName}
                    disabled={!canManageSettings}
                    onChange={(e) => setLocalRestaurantSettings((p) => ({ ...p, restaurantName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Para Birimi</label>
                  <select
                    className={inputClass}
                    value={localRestaurantSettings.currency}
                    disabled={!canManageSettings}
                    onChange={(e) => setLocalRestaurantSettings((p) => ({ ...p, currency: e.target.value }))}
                  >
                    <option value="TRY">Türk Lirası (₺)</option>
                    <option value="USD">Amerikan Doları ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Saat Dilimi</label>
                  <select
                    className={inputClass}
                    value={localRestaurantSettings.timezone}
                    disabled={!canManageSettings}
                    onChange={(e) => setLocalRestaurantSettings((p) => ({ ...p, timezone: e.target.value }))}
                  >
                    <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">KDV Oranı (%)</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={localRestaurantSettings.taxRate}
                    disabled={!canManageSettings}
                    onChange={(e) => setLocalRestaurantSettings((p) => ({ ...p, taxRate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!canManageSettings}
                  className={`h-11 px-8 rounded-xl font-black text-sm transition-all shadow-lg ${
                    saved 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95"
                  } disabled:opacity-50`}
                >
                  {saved ? "✓ Kaydedildi" : "Ayarları Kaydet"}
                </button>
                <button
                  onClick={() => setLocalRestaurantSettings({ ...defaultRestaurantSettings })}
                  disabled={!canManageSettings}
                  className={`h-11 px-6 rounded-xl border font-bold text-sm transition-all ${
                    darkMode ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Sıfırla
                </button>
              </div>
            </div>
          )}

          {/* Kullanıcılar */}
          {activeSection === "users" && (
            <div className="space-y-8">
              {canManageUsers && (
                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-indigo-500">Yeni Personel Ekle</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <input className={inputClass} placeholder="Ad Soyad" value={newUserForm.name} onChange={(e) => setNewUserForm(p => ({...p, name: e.target.value}))} />
                    <input className={inputClass} placeholder="E-posta" value={newUserForm.email} onChange={(e) => setNewUserForm(p => ({...p, email: e.target.value}))} />
                    <input className={inputClass} type="password" placeholder="Şifre" value={newUserForm.password} onChange={(e) => setNewUserForm(p => ({...p, password: e.target.value}))} />
                    <select className={inputClass} value={newUserForm.role} onChange={(e) => setNewUserForm(p => ({...p, role: e.target.value as UserRole}))}>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button onClick={() => onCreateUser(newUserForm)} className="mt-4 h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">Ekle</button>
                </div>
              )}

              <div className={`rounded-2xl border overflow-hidden ${darkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                <table className="w-full text-left">
                  <thead className={`text-[10px] font-black uppercase tracking-widest text-slate-500 border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}>
                    <tr>
                      <th className="px-6 py-4">Kullanıcı</th>
                      <th className="px-6 py-4">Yetki</th>
                      <th className="px-6 py-4">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {appUsers.map((u) => {
                      const draft = roleDrafts[u.id] ?? u.role;
                      return (
                        <tr key={u.id} className="transition-colors hover:bg-indigo-500/[0.02]">
                          <td className="px-6 py-4">
                            <p className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{u.name}</p>
                            <p className="text-[11px] font-medium text-slate-500">{u.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className={`h-9 px-2 rounded-lg border text-xs font-bold outline-none ${darkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}
                              value={draft}
                              disabled={!canManageUsers}
                              onChange={(e) => setRoleDrafts(p => ({...p, [u.id]: e.target.value as UserRole}))}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={!canManageUsers || draft === u.role}
                              onClick={() => onUpdateUserRole(u.id, draft)}
                              className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 disabled:opacity-20 transition-all active:scale-95"
                            >
                              Kaydet
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Görünüm */}
          {activeSection === "appearance" && (
            <div className="max-w-xl space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                <div>
                  <p className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Karanlık Mod</p>
                  <p className="text-[11px] font-medium text-slate-500">Sistem temasını değiştirin</p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`relative h-6 w-11 rounded-full border transition-all duration-300 ${
                    darkMode ? "border-indigo-500 bg-indigo-600" : "border-slate-300 bg-slate-300"
                  }`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${darkMode ? "translate-x-[24px]" : "translate-x-[4px]"}`} />
                </button>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center justify-between opacity-50 ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                <div>
                  <p className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Kompakt Arayüz</p>
                  <p className="text-[11px] font-medium text-slate-500">Daha fazla içerik sığdırın</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-200 border border-slate-300 relative">
                  <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Sistem */}
          {activeSection === "system" && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Durum", value: "Aktif", color: "text-emerald-500" },
                  { label: "Versiyon", value: "v2.0.1" },
                  { label: "Bağlantı", value: hasSupabaseConfig ? "Bulut" : "Demo", color: hasSupabaseConfig ? "text-indigo-500" : "text-amber-500" },
                  { label: "Gecikme", value: "24ms", color: "text-emerald-500" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                    <p className={`text-sm font-black ${s.color || (darkMode ? "text-slate-200" : "text-slate-800")}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-3xl border border-red-500/20 ${darkMode ? "bg-red-500/5" : "bg-red-50"}`}>
                <h3 className="text-red-500 font-black text-sm uppercase tracking-widest mb-4">Tehlikeli Bölge</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <button className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 transition hover:bg-red-500/10 text-left">
                    <span className="text-xl">🗑️</span>
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-wider">Satışları Temizle</p>
                      <p className="text-[10px] font-bold text-red-500/60 leading-tight">Bu işlem geri alınamaz.</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 transition hover:bg-red-500/10 text-left">
                    <span className="text-xl">🧹</span>
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-wider">Önbelleği Boşalt</p>
                      <p className="text-[10px] font-bold text-red-500/60 leading-tight">Uygulamayı sıfırla.</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
