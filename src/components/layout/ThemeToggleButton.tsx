"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggleButton() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white/60 text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      title="Temayı değiştir"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 000 18V3z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
