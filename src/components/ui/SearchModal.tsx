"use client";

import { MenuItem, Sale, Expense, TabType } from "@/lib/types";

export function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  results,
  darkMode,
  tl,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  results: { sales: Sale[]; expenses: Expense[]; menu: MenuItem[] };
  darkMode: boolean;
  tl: Intl.NumberFormat;
  onNavigate: (tab: TabType) => void;
}) {
  if (!isOpen) return null;

  const handleNavigate = (tab: TabType) => {
    onNavigate(tab);
    onClose();
  };

  const hasAnyResult = results.sales.length > 0 || results.expenses.length > 0 || results.menu.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ${
        darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? "border-white/5" : "border-slate-100"}`}>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            className={`flex-1 bg-transparent border-none outline-none text-lg font-medium ${darkMode ? "text-white" : "text-slate-900"}`}
            placeholder="Satış, gider veya ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="hidden sm:block px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-500 font-bold uppercase">ESC</kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!searchQuery && (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-bold">Aramaya başlayın...</p>
              <p className="text-xs mt-1">Örn: "Pizza", "F-2024", "Kira"</p>
            </div>
          )}

          {searchQuery && !hasAnyResult && (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-bold">Sonuç bulunamadı.</p>
              <p className="text-xs mt-1">Farklı bir kelime deneyin.</p>
            </div>
          )}

          {searchQuery && hasAnyResult && (
            <>
              {results.menu.length > 0 && (
                <div>
                  <h3 className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">Menü Ürünleri</h3>
                  <div className="space-y-1">
                    {results.menu.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => handleNavigate("menu")}
                        className={`p-3 rounded-xl flex justify-between items-center transition cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{m.name}</p>
                            <p className="text-[10px] opacity-50 uppercase font-black">{m.category}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-indigo-400">{tl.format(m.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.sales.length > 0 && (
                <div>
                  <h3 className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">Satışlar</h3>
                  <div className="space-y-1">
                    {results.sales.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleNavigate("transactions")}
                        className={`p-3 rounded-xl flex justify-between items-center transition cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{s.receiptNo}</p>
                            <p className="text-[10px] opacity-50 uppercase font-black">{new Date(s.createdAt).toLocaleDateString("tr-TR")}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-500">{tl.format(s.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.expenses.length > 0 && (
                <div>
                  <h3 className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-rose-500">Giderler</h3>
                  <div className="space-y-1">
                    {results.expenses.map(e => (
                      <div 
                        key={e.id} 
                        onClick={() => handleNavigate("expenses")}
                        className={`p-3 rounded-xl flex justify-between items-center transition cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{e.title}</p>
                            <p className="text-[10px] opacity-50 uppercase font-black">{e.supplier}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-rose-400">{tl.format(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
