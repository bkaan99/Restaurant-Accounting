"use client";

type CardTone = "blue" | "orange" | "green" | "slate";

const toneMap: Record<CardTone, string> = {
  blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900",
  orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-900",
  green: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-900",
  slate: "border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-900",
};

export function Card({ title, value, tone = "blue" }: { title: string; value: string; tone?: CardTone }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${toneMap[tone]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
