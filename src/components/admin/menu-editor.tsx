"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Undo2,
  Info,
} from "lucide-react";
import {
  updateMenuItemAction,
  updateCategorySubtitleAction,
  restoreMenuItemAction,
} from "@/app/admin/menu/actions";
import { AddItemModal } from "@/components/admin/add-item-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import type { MenuData } from "@/types";
import Link from "next/link";

interface MenuEditorProps {
  initialData: MenuData;
}

interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error";
}

export function MenuEditor({ initialData }: MenuEditorProps) {
  const [menuData, setMenuData] = useState<MenuData>(initialData);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inline editing state for items: key = "categoryName:itemIndex"
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false);

  // Subtitle editing state: key = categoryName
  const [editingSubtitleCategory, setEditingSubtitleCategory] = useState<string | null>(null);
  const [editSubtitleText, setEditSubtitleText] = useState<string>("");
  const [isSavingSubtitle, setIsSavingSubtitle] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState<string>("Cakes");

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    categoryName: string;
    itemIndex: number;
    itemName: string;
    itemPrice: string;
    mode: "soft" | "permanent";
  }>({
    isOpen: false,
    categoryName: "",
    itemIndex: -1,
    itemName: "",
    itemPrice: "",
    mode: "soft",
  });

  const [restoringIdx, setRestoringIdx] = useState<number | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  function showToast(message: string, type: "success" | "error" = "success") {
    const nextId = String(toastCounter + 1);
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id: nextId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== nextId));
    }, 4500);
  }

  const isTrashView = activeCategoryFilter === "trash";
  const deletedItems = menuData.deletedItems || [];

  // Handle Restore
  async function handleRestore(deletedIdx: number) {
    setRestoringIdx(deletedIdx);
    try {
      const res = await restoreMenuItemAction(deletedIdx);
      if (res.success && res.updatedMenu) {
        setMenuData(res.updatedMenu);
        showToast("Menu item restored.");
      } else {
        showToast(res.error || "Failed to restore menu item.", "error");
      }
    } catch {
      showToast("A network error occurred while restoring.", "error");
    } finally {
      setRestoringIdx(null);
    }
  }

  // Handle Item Save
  async function handleSaveItem(categoryName: string, itemIndex: number) {
    if (!editName.trim() || !editPrice.trim()) {
      showToast("Item name and price cannot be empty.", "error");
      return;
    }

    setIsSavingItem(true);
    try {
      const result = await updateMenuItemAction(categoryName, itemIndex, {
        name: editName,
        price: editPrice,
      });

      if (!result.success || !result.updatedMenu) {
        showToast(result.error || "Failed to update menu item.", "error");
        setIsSavingItem(false);
        return;
      }

      setMenuData(result.updatedMenu);
      setEditingItemKey(null);
      showToast(`Updated "${editName}" successfully.`);
    } catch {
      showToast("A network error occurred. Please try again.", "error");
    } finally {
      setIsSavingItem(false);
    }
  }

  // Handle Subtitle Save
  async function handleSaveSubtitle(categoryName: string) {
    setIsSavingSubtitle(true);
    try {
      const result = await updateCategorySubtitleAction(categoryName, editSubtitleText);

      if (!result.success || !result.updatedMenu) {
        showToast(result.error || "Failed to update category note.", "error");
        setIsSavingSubtitle(false);
        return;
      }

      setMenuData(result.updatedMenu);
      setEditingSubtitleCategory(null);
      showToast(`Category note for "${categoryName}" updated.`);
    } catch {
      showToast("A network error occurred. Please try again.", "error");
    } finally {
      setIsSavingSubtitle(false);
    }
  }

  // Filter categories and search items
  const filteredCategories = menuData.categories
    .filter((cat) =>
      activeCategoryFilter === "all"
        ? true
        : cat.name.toLowerCase() === activeCategoryFilter.toLowerCase()
    )
    .map((cat) => {
      if (!searchQuery.trim()) return cat;
      const q = searchQuery.toLowerCase();
      const matchedItems = cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.price.toLowerCase().includes(q)
      );
      return { ...cat, items: matchedItems };
    })
    .filter((cat) => cat.items.length > 0 || !searchQuery.trim());

  const totalActiveItems = menuData.categories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-800"
                : "bg-destructive text-white border-destructive/80"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium leading-snug">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border border-primary/20">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Management CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Bakery Menu
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update prices, edit item names, and manage category pricing notes with instant live sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Menu</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedAddCategory(menuData.categories[0]?.name || "Cakes");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total Categories
          </p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">
            {menuData.categories.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Active Menu Items
          </p>
          <p className="font-serif text-2xl font-bold text-primary mt-1">
            {totalActiveItems}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Live Cache Status
          </p>
          <p className="font-serif text-base font-bold text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Synchronized
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveCategoryFilter(isTrashView ? "all" : "trash")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            isTrashView
              ? "bg-destructive/10 border-destructive/40 shadow-sm"
              : "bg-white border-border/40 hover:border-border shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Trash
            </p>
            <Trash2
              className={`w-3 h-3 ${
                deletedItems.length > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </div>
          <p
            className={`font-serif text-2xl font-bold mt-1 ${
              deletedItems.length > 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {deletedItems.length}
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategoryFilter === "all"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories ({totalActiveItems})
          </button>
          {menuData.categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategoryFilter(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name} ({cat.items.length})
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("trash")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === "trash"
                ? "bg-destructive text-white shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-destructive"
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Trash ({deletedItems.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTrashView ? "Search deleted menu items..." : "Search menu items..."
            }
            className="w-full pl-8 pr-8 py-1.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trash View / Active Categories View */}
      {isTrashView ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-0.5">Recently Deleted Menu Items (Trash)</p>
              <p className="font-light">
                These items have been removed from the live public menu but preserved for recovery. Click{" "}
                <strong>Restore</strong> to return an item to its original category, or{" "}
                <strong>Delete Permanently</strong> to remove it forever.
              </p>
            </div>
          </div>

          {deletedItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-3">
              <Trash2 className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Trash is Empty
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Deleted menu items will appear here where you can restore them anytime.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/40 divide-y divide-border/30 overflow-hidden shadow-2xs">
              {deletedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-50/10 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-foreground">
                        {item.name}
                      </span>
                      <span className="font-sans text-xs font-semibold text-primary">
                        {item.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-[#faf9f6] border border-border/40 font-medium">
                        Original Category: {item.categoryName || "Cakes"}
                      </span>
                      {item.deletedAt && (
                        <span>
                          Deleted: {new Date(item.deletedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestore(idx)}
                      disabled={restoringIdx === idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>{restoringIdx === idx ? "Restoring..." : "Restore"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModalState({
                          isOpen: true,
                          categoryName: item.categoryName || "Cakes",
                          itemIndex: idx,
                          itemName: item.name,
                          itemPrice: item.price,
                          mode: "permanent",
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-destructive hover:bg-destructive/10 text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Categories Accordion / Grid */
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const isEditingSubtitle =
              editingSubtitleCategory === category.name;

            return (
              <div
                key={category.name}
                className="bg-white rounded-2xl border border-border/40 overflow-hidden shadow-2xs"
              >
                {/* Category Header */}
                <div className="p-5 sm:p-6 bg-[#faf9f6] border-b border-border/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                        {category.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {category.items.length} items
                      </span>
                    </div>

                    {/* Category Subtitle / Note */}
                    <div className="mt-1.5 flex items-center gap-2">
                      {isEditingSubtitle ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            value={editSubtitleText}
                            onChange={(e) => setEditSubtitleText(e.target.value)}
                            placeholder="e.g. $4.99 Each or Sold by the Pound"
                            className="px-2.5 py-1 text-xs bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSubtitle(category.name)}
                            disabled={isSavingSubtitle}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Save Note"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubtitleCategory(null)}
                            className="p-1 rounded-lg bg-border text-muted-foreground hover:text-foreground"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          {category.subtitle ? (
                            <span className="text-primary font-medium">
                              {category.subtitle}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-light italic">
                              No pricing subtitle note
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubtitleCategory(category.name);
                              setEditSubtitleText(category.subtitle || "");
                            }}
                            className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Edit Note</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Item Quick Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddCategory(category.name);
                      setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item to {category.name}</span>
                  </button>
                </div>

                {/* Items Table / List */}
                <div className="divide-y divide-border/30">
                  {category.items.map((item, idx) => {
                    const itemKey = `${category.name}:${idx}`;
                    const isEditing = editingItemKey === itemKey;

                    return (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f6]/50 transition-colors"
                      >
                        {isEditing ? (
                          /* Inline Edit Row */
                          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Item Name"
                              className="flex-1 px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="$0.00"
                              className="w-full sm:w-28 px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-mono font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveItem(category.name, idx)}
                                disabled={isSavingItem}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemKey(null)}
                                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Readonly Row */
                          <>
                            <div className="flex items-baseline gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 relative top-[-2px]" />
                              <div>
                                <p className="font-serif text-base font-bold text-foreground">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground font-light">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-center">
                              <span className="font-sans text-sm font-bold text-primary shrink-0">
                                {item.price}
                              </span>

                              <div className="flex items-center gap-1 border-l border-border/40 pl-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItemKey(itemKey);
                                    setEditName(item.name);
                                    setEditPrice(item.price);
                                  }}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Edit Item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteModalState({
                                      isOpen: true,
                                      categoryName: category.name,
                                      itemIndex: idx,
                                      itemName: item.name,
                                      itemPrice: item.price,
                                      mode: "soft",
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Move to Recently Deleted"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={menuData.categories}
        defaultCategory={selectedAddCategory}
        onSuccess={(updatedMenu, message) => {
          setMenuData(updatedMenu);
          showToast(message);
        }}
      />

      {/* Delete / Permanent Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            categoryName: "",
            itemIndex: -1,
            itemName: "",
            itemPrice: "",
            mode: "soft",
          })
        }
        categoryName={deleteModalState.categoryName}
        itemIndex={deleteModalState.itemIndex}
        itemName={deleteModalState.itemName}
        itemPrice={deleteModalState.itemPrice}
        mode={deleteModalState.mode}
        onSuccess={(updatedMenu, message) => {
          setMenuData(updatedMenu);
          showToast(message);
        }}
      />
    </div>
  );
}
