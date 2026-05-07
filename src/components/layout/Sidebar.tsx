"use client";

import { useState } from "react";
import { AppUser, TabType, UserRole } from "@/lib/types";
import Image from "next/image";

type NavItem = {
  key: TabType;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

export function Sidebar({
  tab,
  setTab,
  restaurantName,
  darkMode,
  navItems,
  canAccessTab,
  onSettingsClick,
  pushToast,
  onCollapseChange,
}: {
  user?: AppUser;
  tab: TabType;
  setTab: (tab: TabType) => void;
  restaurantName: string;
  darkMode: boolean;
  navItems: NavItem[];
  canAccessTab: (tab: TabType) => boolean;
  onSettingsClick: () => void;
  pushToast: (msg: string, type: "warning") => void;
  onCollapseChange?: (collapsed: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapseChange?.(next);
  };

  return (
    <aside
      className={`sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden rounded-3xl border py-5 shadow-xl shadow-slate-900/20 backdrop-blur transition-all duration-300 ${
        collapsed ? "px-0 w-[72px]" : "px-0 w-[280px]"
      } ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200/80 bg-white/90"}`}
    >
      {/* Toggle butonu */}
      <div className={`flex ${collapsed ? "justify-center px-0 mb-4" : "justify-end px-4 mb-2"}`}>
        <button
          onClick={toggle}
          title={collapsed ? "Genişlet" : "Daralt"}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
            darkMode
              ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Logo / Marka alanı */}
      {!collapsed && (
        <div
          className={`mx-4 rounded-2xl border px-4 py-4 ${
            darkMode
              ? "border-white/10 bg-slate-900/60"
              : "border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50"
          }`}
        >
          <div className="mb-3">
            <Image
              src="/logo.png"
              alt={`${restaurantName || "LUMINOX"} logosu`}
              width={100}
              height={50}
              className="h-12 w-auto rounded-lg object-contain"
            />
          </div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-indigo-200" : "text-indigo-500"}`}>
            Marka
          </p>
          <p className={`mt-1 text-lg font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            {restaurantName || "LUMINOX"}
          </p>
          <p className={`mt-1 text-xs ${darkMode ? "text-slate-300" : "text-slate-500"}`}>Restoran Analitiği</p>
        </div>
      )}

      {/* Collapsed logo */}
      {collapsed && (
        <div className="flex justify-center mb-4 px-2">
          <Image
            src="/logo.png"
            alt={`${restaurantName || "LUMINOX"} logosu`}
            width={40}
            height={40}
            className="h-9 w-9 rounded-xl object-contain"
          />
        </div>
      )}

      {!collapsed && (
        <p className={`px-6 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
          Ana Menü
        </p>
      )}

      {collapsed && <div className="pt-3" />}

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const isAllowed = canAccessTab(item.key);
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
              title={collapsed ? item.label : undefined}
              className={`group flex w-full items-center rounded-2xl border px-1.5 py-2.5 text-left transition ${
                collapsed ? "justify-center gap-0" : "gap-3 px-3"
              } ${
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
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm leading-none transition ${
                  darkMode
                    ? "bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-[15px] font-semibold whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
