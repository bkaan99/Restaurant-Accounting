"use client";

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur">
      <h3 className="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}
