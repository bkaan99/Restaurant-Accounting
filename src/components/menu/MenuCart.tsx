"use client";

import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function MenuCart({
  isDark,
  lines,
  total,
  itemCount,
  isOpen,
  onOpen,
  onClose,
  onUpdateQty,
  onRemoveLine,
  onClear,
  whatsappPhone,
  restaurantName,
}: {
  isDark: boolean;
  lines: CartLine[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveLine: (id: string) => void;
  onClear: () => void;
  whatsappPhone: string;
  restaurantName: string;
}) {
  const canOrder = Boolean(whatsappPhone.trim()) && lines.length > 0;

  const handleWhatsAppOrder = () => {
    const url = buildWhatsAppOrderUrl(whatsappPhone, {
      restaurantName,
      lines: lines.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.price })),
    });
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Sepeti aç"
        className={`fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 ${
          isDark
            ? "border-white/15 bg-violet-600 text-white shadow-violet-900/40"
            : "border-violet-200 bg-violet-600 text-white shadow-violet-300/50"
        }`}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Sepeti kapat"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside
            className={`relative flex h-full w-full max-w-md flex-col border-l shadow-2xl ${
              isDark ? "border-white/10 bg-[#09090b] text-slate-100" : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Sepetim</p>
                <h2 className="text-lg font-black">Siparişiniz</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                  isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                Kapat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className={`py-12 text-center text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  Sepetiniz boş. Menüden ürün ekleyin.
                </p>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className={`rounded-2xl border p-4 ${isDark ? "border-white/5 bg-[#121217]/80" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{line.name}</p>
                          <p className={`mt-0.5 text-sm font-bold ${isDark ? "text-violet-300" : "text-violet-600"}`}>
                            {tl.format(line.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveLine(line.id)}
                          className={`text-xs font-bold ${isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-600"}`}
                        >
                          Kaldır
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(line.id, -1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-lg font-black ${
                              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                            }`}
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-black">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(line.id, 1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-lg font-black ${
                              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-black">{tl.format(line.price * line.qty)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Toplam</span>
                <span className="text-xl font-black">{tl.format(total)}</span>
              </div>

              {!whatsappPhone.trim() ? (
                <p className={`mb-3 text-xs font-semibold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  WhatsApp sipariş numarası henüz tanımlı değil. Yönetim paneli → Ayarlar → Restoran bölümünden ekleyin.
                </p>
              ) : null}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!canOrder}
                  onClick={handleWhatsAppOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-white transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp ile Sipariş Ver
                </button>
                {lines.length > 0 ? (
                  <button
                    type="button"
                    onClick={onClear}
                    className={`w-full rounded-xl border py-2.5 text-xs font-bold ${
                      isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Sepeti Temizle
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
