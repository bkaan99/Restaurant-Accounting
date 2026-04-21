"use client";

import { useEffect, useState } from "react";
import { AppUser } from "@/lib/types";
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
  restaurantName,
  onRestaurantNameChange,
}: {
  user: AppUser;
  panelClass: string;
  inputClass: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  restaurantName: string;
  onRestaurantNameChange: (name: string) => void;
}) {
  const defaultRestaurantSettings: RestaurantSettings = {
    restaurantName: "LUMINOX Restaurant",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    taxRate: "10",
  };

  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    ...defaultRestaurantSettings,
    restaurantName,
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "restaurant" | "appearance" | "system">("profile");

  useEffect(() => {
    setRestaurantSettings((prev) => ({ ...prev, restaurantName }));
  }, [restaurantName]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { id: "profile", label: "Profil", icon: "👤" },
    { id: "restaurant", label: "Restoran", icon: "🍽️" },
    { id: "appearance", label: "Görünüm", icon: "🎨" },
    { id: "system", label: "Sistem", icon: "⚙️" },
  ] as const;

  const getSectionDescription = () => {
    if (activeSection === "profile") return "Hesap bilgilerinizi görüntüleyin";
    if (activeSection === "restaurant") return "İşletme bilgilerini ve tercihlerini yönetin";
    if (activeSection === "appearance") return "Arayüz tercihlerinizi özelleştirin";
    return "Uygulama sağlığı ve altyapı durumu";
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {/* Sol menü */}
      <div className={`${panelClass} h-max lg:sticky lg:top-4`}>
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Ayarlar</p>
          <p className="mt-1 text-sm font-medium text-slate-700">Sisteminizi özelleştirin</p>
        </div>
        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                activeSection === s.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* İçerik */}
      <div className="space-y-4">
        <div className={`${panelClass} border border-slate-100 bg-gradient-to-r from-white via-slate-50 to-indigo-50/40`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ayar Merkezi</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            {sections.find((section) => section.id === activeSection)?.label} Ayarları
          </h1>
          <p className="mt-1 text-sm text-slate-500">{getSectionDescription()}</p>
        </div>

        {/* Profil */}
        {activeSection === "profile" && (
          <div className={panelClass}>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
            <p className="mb-5 text-sm text-slate-400">Hesap bilgilerinizi görüntüleyin</p>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{user.name}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  user.role === "admin"
                    ? "bg-violet-100 text-violet-700"
                    : user.role === "manager"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Ad Soyad</label>
                <input
                  className={inputClass}
                  value={user.name}
                  readOnly
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">E-posta</label>
                <input
                  className={inputClass}
                  value={user.email}
                  readOnly
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Rol</label>
                <input
                  className={inputClass}
                  value={user.role}
                  readOnly
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Profil bilgilerini değiştirmek için yöneticinizle iletişime geçin.
            </div>
          </div>
        )}

        {/* Restoran */}
        {activeSection === "restaurant" && (
          <div className={panelClass}>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Restoran Ayarları</h2>
            <p className="mb-5 text-sm text-slate-400">İşletme bilgilerini ve tercihlerini yönetin</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Restoran Adı</label>
                <input
                  className={inputClass}
                  value={restaurantSettings.restaurantName}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setRestaurantSettings((p) => ({ ...p, restaurantName: nextName }));
                    onRestaurantNameChange(nextName);
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Para Birimi</label>
                <select
                  className={inputClass}
                  value={restaurantSettings.currency}
                  onChange={(e) => setRestaurantSettings((p) => ({ ...p, currency: e.target.value }))}
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Saat Dilimi</label>
                <select
                  className={inputClass}
                  value={restaurantSettings.timezone}
                  onChange={(e) => setRestaurantSettings((p) => ({ ...p, timezone: e.target.value }))}
                >
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">KDV Oranı (%)</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  value={restaurantSettings.taxRate}
                  onChange={(e) => setRestaurantSettings((p) => ({ ...p, taxRate: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={handleSave}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                {saved ? "✓ Kaydedildi" : "Kaydet"}
              </button>
              <button
                onClick={() => {
                  setRestaurantSettings({ ...defaultRestaurantSettings });
                  onRestaurantNameChange(defaultRestaurantSettings.restaurantName);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* Görünüm */}
        {activeSection === "appearance" && (
          <div className={panelClass}>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Görünüm</h2>
            <p className="mb-5 text-sm text-slate-400">Arayüz tercihlerinizi özelleştirin</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">Karanlık Mod</p>
                  <p className="text-xs text-slate-400">Koyu renk temasına geç</p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                    darkMode ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      darkMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">Kompakt Görünüm</p>
                  <p className="text-xs text-slate-400">Daha az boşluk, daha fazla içerik</p>
                </div>
                <button className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors duration-200">
                  <span className="absolute top-0.5 h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-200" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">Animasyonlar</p>
                  <p className="text-xs text-slate-400">Geçiş animasyonlarını etkinleştir</p>
                </div>
                <button className="relative h-6 w-11 rounded-full bg-indigo-600 transition-colors duration-200">
                  <span className="absolute top-0.5 h-5 w-5 translate-x-5 rounded-full bg-white shadow transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sistem */}
        {activeSection === "system" && (
          <div className="space-y-4">
            <div className={panelClass}>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Sistem Bilgisi</h2>
              <p className="mb-5 text-sm text-slate-400">Uygulama ve bağlantı durumu</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Uygulama Versiyonu</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">v0.1.0</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Framework</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Next.js 16</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Supabase Bağlantısı</span>
                  <span className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${hasSupabaseConfig ? "text-emerald-600" : "text-amber-600"}`}>
                    <span className={`h-2 w-2 rounded-full ${hasSupabaseConfig ? "bg-emerald-500" : "bg-amber-400"}`} />
                    {hasSupabaseConfig ? "Bağlı" : "Demo Mod"}
                  </span>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Veri Kaynağı</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {hasSupabaseConfig ? "Supabase" : "Örnek Veri"}
                  </p>
                </div>
              </div>
            </div>

            <div className={panelClass}>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Tehlikeli Bölge</h2>
              <p className="mb-4 text-sm text-slate-400">Bu işlemler geri alınamaz</p>
              <div className="space-y-2">
                <button className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-100">
                  🗑️ Tüm Satış Verilerini Temizle
                </button>
                <button className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-100">
                  🗑️ Tüm Gider Verilerini Temizle
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Bu butonlar şu an yalnızca görsel amaçlıdır. Gerçek silme işlemi için onay mekanizması eklenmelidir.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
