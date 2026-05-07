"use client";

import { useMemo, useState } from "react";
import { Ingredient, InventoryMovement } from "@/lib/types";

export function StockTab({
  darkMode,
  panelClass,
  inputClass,
  ingredients,
  inventoryMovements,
  createIngredient,
  deleteIngredient,
  updateIngredientReorderLevel,
  recordInventoryMovement,
}: {
  darkMode?: boolean;
  panelClass: string;
  inputClass: string;
  ingredients: Ingredient[];
  inventoryMovements: InventoryMovement[];
  createIngredient: (payload: { name: string; unit: string; onHand?: string; reorderLevel?: string }) => Promise<void>;
  deleteIngredient: (ingredientId: string) => Promise<void>;
  updateIngredientReorderLevel: (payload: { ingredientId: string; reorderLevel: string }) => Promise<void>;
  recordInventoryMovement: (payload: { ingredientId: string; movementType: "in" | "out" | "adjust"; qty: string; reason?: string }) => Promise<void>;
}) {
  const dm = darkMode ?? false;

  const [showAdd, setShowAdd] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [deletingIngredientId, setDeletingIngredientId] = useState<string | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editingReorderLevel, setEditingReorderLevel] = useState("");
  const [savingReorderId, setSavingReorderId] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingMove, setSavingMove] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const MOVEMENTS_PER_PAGE = 8;
  const [ingredientForm, setIngredientForm] = useState({ name: "", unit: "adet", onHand: "0", reorderLevel: "0" });
  const [moveForm, setMoveForm] = useState<{ ingredientId: string; movementType: "in" | "out" | "adjust"; qty: string; reason: string }>({
    ingredientId: "",
    movementType: "in",
    qty: "",
    reason: "",
  });

  const critical = useMemo(
    () => ingredients.filter((i) => i.active && i.onHand <= i.reorderLevel),
    [ingredients]
  );

  const card = dm
    ? "rounded-2xl border border-white/10 bg-white/[0.03]"
    : "rounded-2xl border border-slate-200 bg-white";

  return (
    <section className="space-y-4">
      <div className={panelClass}>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`text-lg font-black tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>Stok Takibi</h2>
            <p className={`text-xs font-medium ${dm ? "text-slate-500" : "text-slate-500"}`}>
              Malzeme ekleyin, stok giris/cikis yapin, kritik stoklari takip edin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMove(true)}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition active:scale-95 ${
                dm ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Stok Hareketi
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 active:scale-95"
            >
              Malzeme Ekle
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className={`${card} px-4 py-3`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-slate-500" : "text-slate-400"}`}>Toplam</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-slate-100" : "text-slate-900"}`}>{ingredients.length}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>malzeme</p>
          </div>
          <div className={`${card} px-4 py-3`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-slate-500" : "text-slate-400"}`}>Aktif</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-slate-100" : "text-slate-900"}`}>{ingredients.filter((i) => i.active).length}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>kullanımda</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${dm ? "border-rose-500/20 bg-rose-500/10" : "border-rose-200 bg-rose-50"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-rose-300" : "text-rose-700"}`}>Kritik</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-rose-200" : "text-rose-800"}`}>{critical.length}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-rose-300/70" : "text-rose-700/70"}`}>uyarı</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/5">
          <div className={`flex items-center justify-between px-4 py-3 ${dm ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs font-black uppercase tracking-widest ${dm ? "text-slate-400" : "text-slate-500"}`}>Malzemeler</p>
            {critical.length > 0 && (
              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${dm ? "bg-rose-500/10 text-rose-300" : "bg-rose-100 text-rose-700"}`}>
                Kritik stok var
              </span>
            )}
          </div>
          <div className={`${dm ? "bg-white/[0.02]" : "bg-white"} divide-y ${dm ? "divide-white/5" : "divide-slate-100"}`}>
            {ingredients.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className={`text-sm font-bold ${dm ? "text-slate-400" : "text-slate-500"}`}>Henüz malzeme yok</p>
                <p className={`mt-1 text-xs ${dm ? "text-slate-600" : "text-slate-400"}`}>Malzeme ekleyerek baslayin.</p>
              </div>
            ) : (
              ingredients.map((ing) => {
                const isCritical = ing.active && ing.onHand <= ing.reorderLevel;
                return (
                  <div key={ing.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-black ${
                      isCritical
                        ? (dm ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700")
                        : (dm ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")
                    }`}>
                      {ing.unit}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-bold ${dm ? "text-slate-100" : "text-slate-900"}`}>{ing.name}</p>
                      <p className={`text-[11px] font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>
                        Kritik seviye: {ing.reorderLevel} {ing.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isCritical ? (dm ? "text-rose-200" : "text-rose-700") : (dm ? "text-slate-100" : "text-slate-900")}`}>
                        {ing.onHand} {ing.unit}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${dm ? "text-slate-600" : "text-slate-400"}`}>
                        stok
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingIngredient(ing);
                        setEditingReorderLevel(String(ing.reorderLevel));
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-black transition ${
                        dm
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      Düzenle
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-500"}`}>Son hareketler</p>
          <div className={`${card} overflow-hidden`}>
            {inventoryMovements.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className={`text-sm font-bold ${dm ? "text-slate-400" : "text-slate-500"}`}>Hareket yok</p>
              </div>
            ) : (() => {
              const totalPages = Math.ceil(inventoryMovements.length / MOVEMENTS_PER_PAGE);
              const paginated = inventoryMovements.slice(
                (movementsPage - 1) * MOVEMENTS_PER_PAGE,
                movementsPage * MOVEMENTS_PER_PAGE
              );
              return (
                <>
                  <div className={`${dm ? "divide-white/5" : "divide-slate-100"} divide-y`}>
                    {paginated.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3">
                        <div className="min-w-0">
                          <p className={`truncate text-xs font-bold ${dm ? "text-slate-200" : "text-slate-700"}`}>
                            {ingredients.find((i) => i.id === m.ingredientId)?.name ?? "Malzeme"}
                          </p>
                          <p className={`mt-0.5 text-[10px] ${dm ? "text-slate-600" : "text-slate-400"}`}>
                            {new Date(m.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-black ${
                            m.movementType === "in" ? "text-emerald-500" : m.movementType === "out" ? "text-rose-500" : "text-indigo-500"
                          }`}>
                            {m.movementType === "in" ? "+" : m.movementType === "out" ? "-" : "≡"} {m.qty}
                          </p>
                          {m.reason ? <p className={`text-[10px] ${dm ? "text-slate-600" : "text-slate-400"}`}>{m.reason}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`flex items-center justify-between border-t px-4 py-3 ${dm ? "border-white/5" : "border-slate-100"}`}>
                      <p className={`text-[11px] font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>
                        {(movementsPage - 1) * MOVEMENTS_PER_PAGE + 1}–{Math.min(movementsPage * MOVEMENTS_PER_PAGE, inventoryMovements.length)} / {inventoryMovements.length} hareket
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMovementsPage((p) => Math.max(1, p - 1))}
                          disabled={movementsPage === 1}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            dm
                              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setMovementsPage(page)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] font-bold transition ${
                              page === movementsPage
                                ? dm
                                  ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                                  : "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : dm
                                ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setMovementsPage((p) => Math.min(totalPages, p + 1))}
                          disabled={movementsPage === totalPages}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            dm
                              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal dm={dm} title="Malzeme Ekle" subtitle="Yeni malzeme tanimlayin" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field dm={dm} label="Ad">
              <input className={inputClass} value={ingredientForm.name} onChange={(e) => setIngredientForm((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field dm={dm} label="Birim">
                <select className={inputClass} value={ingredientForm.unit} onChange={(e) => setIngredientForm((p) => ({ ...p, unit: e.target.value }))}>
                  <option value="adet">adet</option>
                  <option value="gr">gr</option>
                  <option value="ml">ml</option>
                </select>
              </Field>
              <Field dm={dm} label="Kritik Seviye">
                <input className={inputClass} type="number" min="0" value={ingredientForm.reorderLevel} onChange={(e) => setIngredientForm((p) => ({ ...p, reorderLevel: e.target.value }))} />
              </Field>
            </div>
            <Field dm={dm} label="Mevcut Stok">
              <input className={inputClass} type="number" min="0" value={ingredientForm.onHand} onChange={(e) => setIngredientForm((p) => ({ ...p, onHand: e.target.value }))} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <CancelBtn dm={dm} onClick={() => setShowAdd(false)} disabled={savingAdd} />
              <button
                disabled={savingAdd}
                onClick={async () => {
                  setSavingAdd(true);
                  try {
                    await createIngredient(ingredientForm);
                    setIngredientForm({ name: "", unit: "adet", onHand: "0", reorderLevel: "0" });
                    setShowAdd(false);
                  } finally {
                    setSavingAdd(false);
                  }
                }}
                className={`rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {savingAdd ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showMove && (
        <Modal dm={dm} title="Stok Hareketi" subtitle="Stok giris/cikis veya ayarlama" onClose={() => setShowMove(false)}>
          <div className="space-y-4">
            <Field dm={dm} label="Malzeme">
              <select className={inputClass} value={moveForm.ingredientId} onChange={(e) => setMoveForm((p) => ({ ...p, ingredientId: e.target.value }))}>
                <option value="">Secin</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field dm={dm} label="Tip">
                <select className={inputClass} value={moveForm.movementType} onChange={(e) => setMoveForm((p) => ({ ...p, movementType: e.target.value as "in" | "out" | "adjust" }))}>
                  <option value="in">Giris (+)</option>
                  <option value="out">Cikis (-)</option>
                  <option value="adjust">Ayarla (=)</option>
                </select>
              </Field>
              <Field dm={dm} label={moveForm.movementType === "adjust" ? "Yeni Stok" : "Miktar"}>
                <input className={inputClass} type="number" min="0" value={moveForm.qty} onChange={(e) => setMoveForm((p) => ({ ...p, qty: e.target.value }))} />
              </Field>
            </div>
            <Field dm={dm} label="Aciklama (opsiyonel)">
              <input className={inputClass} value={moveForm.reason} onChange={(e) => setMoveForm((p) => ({ ...p, reason: e.target.value }))} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <CancelBtn dm={dm} onClick={() => setShowMove(false)} disabled={savingMove} />
              <button
                disabled={savingMove}
                onClick={async () => {
                  setSavingMove(true);
                  try {
                    await recordInventoryMovement(moveForm);
                    setMoveForm({ ingredientId: "", movementType: "in", qty: "", reason: "" });
                    setShowMove(false);
                  } finally {
                    setSavingMove(false);
                  }
                }}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingMove ? "Uygulanıyor…" : "Uygula"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingIngredient && (
        <Modal
          dm={dm}
          title="Malzeme Düzenle"
          subtitle={`${editingIngredient.name} için kritik seviye ve silme işlemleri`}
          onClose={() => setEditingIngredient(null)}
        >
          <div className="space-y-4">
            <Field dm={dm} label="Kritik Seviye">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={editingReorderLevel}
                onChange={(e) => setEditingReorderLevel(e.target.value)}
              />
            </Field>
            <div className="flex justify-between gap-2 pt-1">
              <button
                onClick={async () => {
                  const ok = window.confirm(`"${editingIngredient.name}" malzemesini silmek istiyor musunuz?`);
                  if (!ok) return;
                  setDeletingIngredientId(editingIngredient.id);
                  try {
                    await deleteIngredient(editingIngredient.id);
                    setEditingIngredient(null);
                  } finally {
                    setDeletingIngredientId(null);
                  }
                }}
                disabled={deletingIngredientId === editingIngredient.id || savingReorderId === editingIngredient.id}
                className={`rounded-xl border px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  dm
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                {deletingIngredientId === editingIngredient.id ? "Siliniyor..." : "Sil"}
              </button>
              <div className="flex gap-2">
                <CancelBtn
                  dm={dm}
                  onClick={() => setEditingIngredient(null)}
                  disabled={deletingIngredientId === editingIngredient.id || savingReorderId === editingIngredient.id}
                />
                <button
                  disabled={savingReorderId === editingIngredient.id || deletingIngredientId === editingIngredient.id}
                  onClick={async () => {
                    setSavingReorderId(editingIngredient.id);
                    try {
                      await updateIngredientReorderLevel({
                        ingredientId: editingIngredient.id,
                        reorderLevel: editingReorderLevel,
                      });
                      setEditingIngredient(null);
                    } finally {
                      setSavingReorderId(null);
                    }
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingReorderId === editingIngredient.id ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Modal({ dm, title, subtitle, onClose, children }: {
  dm: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${dm ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className={`text-base font-black tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>{title}</h3>
            <p className={`mt-0.5 text-xs font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${dm ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ dm, label, children }: { dm: boolean; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-400"}`}>{label}</label>
      {children}
    </div>
  );
}

function CancelBtn({ dm, onClick, disabled }: { dm: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        dm ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      Vazgeç
    </button>
  );
}
