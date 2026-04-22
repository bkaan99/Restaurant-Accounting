"use client";

import { AppUser, TabType, UserRole } from "@/lib/types";

type NavItem = {
  key: TabType;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

export function Sidebar({
  user,
  tab,
  setTab,
  restaurantName,
  darkMode,
  navItems,
  onSettingsClick,
  pushToast,
}: {
  user: AppUser;
  tab: TabType;
  setTab: (tab: TabType) => void;
  restaurantName: string;
  darkMode: boolean;
  navItems: NavItem[];
  onSettingsClick: () => void;
  pushToast: (msg: string, type: "warning") => void;
}) {
  return (
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
          const isAllowed = item.roles.includes(user.role);
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
                tab === item.key
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
          );
        })}
      </nav>

      <div className={`mx-3 mt-5 rounded-2xl border px-3 py-3 ${
        darkMode ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white/70"
      }`}>
        <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>Yardım</p>
        <button
          onClick={onSettingsClick}
          className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left text-[15px] font-semibold transition ${
            darkMode ? "text-slate-200 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
          }`}
        >
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm leading-none transition ${
            darkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500 shadow-sm"
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <span>Ayarlar</span>
        </button>
      </div>
    </aside>
  );
}
