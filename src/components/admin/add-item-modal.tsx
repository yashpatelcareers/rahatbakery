"use client";

import { useState } from "react";
import { X, Plus, Sparkles, AlertCircle } from "lucide-react";
import { addMenuItemAction } from "@/app/admin/menu/actions";
import type { MenuCategory, MenuData } from "@/types";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  defaultCategory?: string;
  onSuccess: (updatedMenu: MenuData, message: string) => void;
}

export function AddItemModal({
  isOpen,
  onClose,
  categories,
  defaultCategory,
  onSuccess,
}: AddItemModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategory || categories[0]?.name || "Cakes"
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedPrice = price.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter an item name.");
      return;
    }
    if (!trimmedPrice) {
      setErrorMessage("Please enter a price (e.g. $4.99 or $13.99/lb).");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addMenuItemAction(selectedCategory, {
        name: trimmedName,
        price: trimmedPrice,
      });

      if (!result.success || !result.updatedMenu) {
        setErrorMessage(result.error || "Failed to add item. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Reset & close
      setName("");
      setPrice("");
      setIsSubmitting(false);
      onSuccess(
        result.updatedMenu,
        `"${trimmedName}" added to ${selectedCategory} successfully!`
      );
      onClose();
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-border/40 shadow-2xl z-10 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Add New Menu Item
              </h2>
              <p className="text-xs text-muted-foreground">
                Publish a new item directly to the live menu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#faf9f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Menu Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.items.length} items)
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label
              htmlFor="item-name"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Item Name
            </label>
            <input
              id="item-name"
              type="text"
              required
              placeholder="e.g. Pistachio Cake, Chicken Roll, Rose Lassi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-serif font-semibold"
            />
          </div>

          {/* Item Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="item-price"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80"
              >
                Price
              </label>
              <span className="text-[10px] text-muted-foreground">
                Examples: $4.99, $26.99, $13.99/lb
              </span>
            </div>
            <input
              id="item-price"
              type="text"
              required
              placeholder="$4.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono font-bold text-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-[#faf9f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add to Menu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
