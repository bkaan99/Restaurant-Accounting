"use client";

import { useMemo, useState } from "react";
import { Ingredient, MenuCategory, MenuItem, MenuItemIngredient } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  "Ana Yemek": "🍽️",
  "Icecek": "🥤",
  "İçecek": "🥤",
  "Tatli": "🍮",
  "Tatlı": "🍮",
  "Corba": "🍲",
  "Çorba": "🍲",
  "Salata": "🥗",
  "Atistirmalik": "🥨",
  "Atıştırmalık": "🥨",
  "Kahvalti": "🍳",
  "Kahvaltı": "🍳",
};
const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] ?? "🍴";

type EditForm = { name: string; description: string; category: string; price: string };

type MenuTabProps = {
  panelClass: string;
  inputClass: string;
  darkMode?: boolean;
  menuForm: { name: string; description?: string; category: string; price: string };
  setMenuForm: React.Dispatch<React.SetStateAction<{ name: string; description?: string; category: string; price: string }>>;
  createMenuItem: () => Promise<void>;
  menuCategories: MenuCategory[];
  createMenuCategory: (name: string) => Promise<void>;
  ingredients: Ingredient[];
  menuItemIngredients: MenuItemIngredient[];
  upsertMenuItemIngredient: (payload: { menuItemId: string; ingredientId: string; qtyPerItem: string }) => Promise<void>;
  deleteMenuItemIngredient: (id: string) => Promise<void>;
  menuItems: MenuItem[];
  tl: Intl.NumberFormat;
  toggleMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (item: MenuItem, updates: Partial<Pick<MenuItem, "name" | "description" | "category" | "price">>) => Promise<void>;
  canManageMenu: boolean;
};

export function MenuTab({
  panelClass,
  inputClass,
  darkMode,
  menuForm,
  setMenuForm,
  createMenuItem,
  menuCategories,
  createMenuCategory,
  ingredients,
  menuItemIngredients,
  upsertMenuItemIngredient,
  deleteMenuItemIngredient,
  menuItems,
  tl,
  toggleMenuItem,
  deleteMenuItem,
  updateMenuItem,
  canManageMenu,
}: MenuTabProps) {
  const dm = darkMode ?? false;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", category: "", price: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [recipeForm, setRecipeForm] = useState<{ ingredientId: string; qtyPerItem: string }>({ ingredientId: "", qtyPerItem: "" });

  const activeCount = menuItems.filter((m) => m.active).length;
  const passiveCount = menuItems.length - activeCount;

  const categories = useMemo(() => {
    const fromTable = menuCategories.filter((c) => c.active).map((c) => c.name);
    const fromItems = menuItems.map((m) => m.category);
    const unique = Array.from(new Set([...fromTable, ...fromItems]));
    return ["Tümü", ...unique];
  }, [menuCategories, menuItems]);

  const filtered = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "Tümü") items = items.filter((m) => m.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({ name: item.name, description: item.description || "", category: item.category, price: String(item.price) });
    setRecipeForm({ ingredientId: "", qtyPerItem: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const price = Number(editForm.price);
    if (!editForm.name || !editForm.category || isNaN(price) || price <= 0) return;
    setSaving(true);
    await updateMenuItem(editingItem, { name: editForm.name, description: editForm.description || null, category: editForm.category, price });
    setSaving(false);
    setEditingItem(null);
  };

  const handleDelete = async (item: MenuItem) => {
    await deleteMenuItem(item);
    setDeleteConfirm(null);
  };

  const card = dm
    ? "rounded-2xl border border-white/5 bg-white/[0.03]"
    : "rounded-2xl border border-slate-200 bg-white";

  return (
    <section className="space-y-4">
      <div className={panelClass}>

        {/* Üst istatistikler */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className={`${card} px-4 py-3`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-slate-500" : "text-slate-400"}`}>Toplam</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-slate-100" : "text-slate-900"}`}>{menuItems.length}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>ürün</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${dm ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-emerald-400" : "text-emerald-600"}`}>Aktif</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-emerald-300" : "text-emerald-700"}`}>{activeCount}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-emerald-500" : "text-emerald-500"}`}>satışta</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${dm ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? "text-slate-500" : "text-slate-400"}`}>Pasif</p>
            <p className={`mt-1 text-2xl font-black ${dm ? "text-slate-400" : "text-slate-600"}`}>{passiveCount}</p>
            <p className={`text-[10px] font-medium ${dm ? "text-slate-600" : "text-slate-400"}`}>gizli</p>
          </div>
        </div>

        {/* Başlık + Ekle butonu */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-black tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>Menü Yönetimi</h2>
            <p className={`text-xs font-medium ${dm ? "text-slate-500" : "text-slate-400"}`}>Ürünleri düzenleyin, fiyat güncelleyin, aktif/pasif yapın</p>
          </div>
          {canManageMenu && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ürün Ekle
            </button>
          )}
        </div>

        {/* Arama + Kategori filtresi */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${dm ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : dm
                    ? "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {cat !== "Tümü" && <span>{getCategoryIcon(cat)}</span>}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ürün listesi */}
        {filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl py-16 ${dm ? "bg-white/[0.02]" : "bg-slate-50"}`}>
            <span className="text-4xl">🍽️</span>
            <p className={`text-sm font-bold ${dm ? "text-slate-400" : "text-slate-500"}`}>
              {menuItems.length === 0 ? "Henüz ürün eklenmedi" : "Ürün bulunamadı"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  dm
                    ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                    : "border-slate-100 bg-white hover:bg-slate-50/80"
                } ${!item.active ? "opacity-50" : ""}`}
              >
                {/* Kategori ikonu */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${dm ? "bg-white/5" : "bg-slate-100"}`}>
                  {getCategoryIcon(item.category)}
                </div>

                {/* Bilgiler */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm font-bold ${dm ? "text-slate-100" : "text-slate-900"}`}>{item.name}</p>
                    {!item.active && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                        Pasif
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className={`text-[11px] font-medium ${dm ? "text-indigo-400" : "text-indigo-600"}`}>{item.category}</p>
                    {item.description && (
                      <p className={`truncate text-[11px] ${dm ? "text-slate-500" : "text-slate-500"}`}>{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Fiyat */}
                <div className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-black ${dm ? "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20" : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"}`}>
                  {tl.format(item.price)}
                </div>

                {/* Aksiyonlar */}
                {canManageMenu && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {/* Aktif/Pasif toggle */}
                    <button
                      onClick={() => toggleMenuItem(item)}
                      title={item.active ? "Pasife al" : "Aktife al"}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                        item.active
                          ? dm ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : dm ? "bg-white/5 text-slate-500 hover:bg-white/10" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {item.active ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                    </button>

                    {/* Düzenle */}
                    <button
                      onClick={() => openEdit(item)}
                      title="Düzenle"
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${dm ? "bg-white/5 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400" : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Sil */}
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      title="Sil"
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${dm ? "bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-400" : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ürün Ekle Modalı */}
      {showAddModal && canManageMenu && (
        <Modal dm={dm} title="Yeni Ürün Ekle" subtitle="Menüye yeni bir ürün ekleyin" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <Field dm={dm} label="Ürün Adı">
              <input className={inputClass} placeholder="Örn: Izgara Köfte" value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field dm={dm} label="Açıklama (İsteğe Bağlı)">
              <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Örn: 200gr antrikot, patates kızartması ile..." value={menuForm.description || ""} onChange={(e) => setMenuForm((p) => ({ ...p, description: e.target.value }))} />
            </Field>
            <Field dm={dm} label="Kategori">
              <div className="space-y-2">
                <select
                  className={inputClass}
                  value={menuForm.category}
                  onChange={(e) => setMenuForm((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="">Kategori secin</option>
                  {categories
                    .filter((cat) => cat !== "Tümü")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="Yeni kategori adi"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    onClick={async () => {
                      const nextName = newCategoryName.trim();
                      if (!nextName) return;
                      await createMenuCategory(nextName);
                      setMenuForm((p) => ({ ...p, category: nextName }));
                      setNewCategoryName("");
                    }}
                    className="shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white transition hover:bg-emerald-500 active:scale-95"
                  >
                    Kategori Ekle
                  </button>
                </div>
              </div>
            </Field>
            <Field dm={dm} label="Satış Fiyatı (₺)">
              <input className={inputClass} type="number" placeholder="0" min="0" value={menuForm.price} onChange={(e) => setMenuForm((p) => ({ ...p, price: e.target.value }))} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <CancelBtn dm={dm} onClick={() => setShowAddModal(false)} />
              <button
                onClick={async () => {
                  if (!menuForm.name || !menuForm.category || !menuForm.price) return;
                  await createMenuItem();
                  setShowAddModal(false);
                }}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-95"
              >
                Ekle
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Düzenle Modalı */}
      {editingItem && (
        <Modal dm={dm} title="Ürünü Düzenle" subtitle={`"${editingItem.name}" ürününü güncelleyin`} onClose={() => setEditingItem(null)}>
          <div className="space-y-4">
            <Field dm={dm} label="Ürün Adı">
              <input className={inputClass} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field dm={dm} label="Açıklama (İsteğe Bağlı)">
              <textarea className={`${inputClass} resize-none`} rows={2} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
            </Field>
            <Field dm={dm} label="Kategori">
              <select
                className={inputClass}
                value={editForm.category}
                onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="">Kategori secin</option>
                {categories
                  .filter((cat) => cat !== "Tümü")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </Field>
            <Field dm={dm} label="Satış Fiyatı (₺)">
              <input className={inputClass} type="number" min="0" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
            </Field>

            <div className={`rounded-2xl border p-4 ${dm ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-500"}`}>Reçete</p>
              <p className={`mt-1 text-xs ${dm ? "text-slate-500" : "text-slate-500"}`}>Ürün başına malzeme miktarını tanımlayın.</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  className={inputClass}
                  value={recipeForm.ingredientId}
                  onChange={(e) => setRecipeForm((p) => ({ ...p, ingredientId: e.target.value }))}
                >
                  <option value="">Malzeme seçin</option>
                  {ingredients
                    .filter((i) => i.active)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                </select>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="Miktar"
                  value={recipeForm.qtyPerItem}
                  onChange={(e) => setRecipeForm((p) => ({ ...p, qtyPerItem: e.target.value }))}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={async () => {
                    if (!editingItem) return;
                    if (!recipeForm.ingredientId || !recipeForm.qtyPerItem) return;
                    await upsertMenuItemIngredient({ menuItemId: editingItem.id, ingredientId: recipeForm.ingredientId, qtyPerItem: recipeForm.qtyPerItem });
                    setRecipeForm({ ingredientId: "", qtyPerItem: "" });
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition active:scale-95 ${
                    dm ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Malzeme Ekle
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {menuItemIngredients
                  .filter((r) => r.menuItemId === editingItem.id)
                  .map((r) => {
                    const ing = ingredients.find((i) => i.id === r.ingredientId);
                    return (
                      <div key={r.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${dm ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                        <div className="min-w-0">
                          <p className={`truncate text-xs font-bold ${dm ? "text-slate-200" : "text-slate-800"}`}>{ing?.name ?? "Malzeme"}</p>
                          <p className={`text-[10px] ${dm ? "text-slate-500" : "text-slate-500"}`}>{r.qtyPerItem} {ing?.unit ?? ""} / ürün</p>
                        </div>
                        <button
                          onClick={() => deleteMenuItemIngredient(r.id)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-black transition ${
                            dm ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          Sil
                        </button>
                      </div>
                    );
                  })}
                {menuItemIngredients.filter((r) => r.menuItemId === editingItem.id).length === 0 && (
                  <p className={`text-[11px] ${dm ? "text-slate-600" : "text-slate-500"}`}>Henüz reçete yok.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CancelBtn dm={dm} onClick={() => setEditingItem(null)} />
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-60"
              >
                {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                Kaydet
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Silme onay modalı */}
      {deleteConfirm && (
        <Modal dm={dm} title="Ürünü Sil" subtitle="Bu işlem geri alınamaz." onClose={() => setDeleteConfirm(null)}>
          <div className="space-y-4">
            <p className={`text-sm ${dm ? "text-slate-300" : "text-slate-600"}`}>
              <span className="font-bold">{menuItems.find((m) => m.id === deleteConfirm)?.name}</span> ürününü silmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-2">
              <CancelBtn dm={dm} onClick={() => setDeleteConfirm(null)} />
              <button
                onClick={() => {
                  const item = menuItems.find((m) => m.id === deleteConfirm);
                  if (item) handleDelete(item);
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-500 active:scale-95"
              >
                Sil
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// --- Yardımcı bileşenler ---

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

function CancelBtn({ dm, onClick }: { dm: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition ${dm ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
    >
      Vazgeç
    </button>
  );
}
