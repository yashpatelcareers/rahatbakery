"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import {
  softDeleteMenuItemAction,
  permanentDeleteMenuItemAction,
} from "@/app/admin/menu/actions";
import type { MenuData } from "@/types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  itemIndex: number;
  itemName: string;
  itemPrice: string;
  mode?: "soft" | "permanent";
  onSuccess: (updatedMenu: MenuData, message: string) => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  categoryName,
  itemIndex,
  itemName,
  itemPrice,
  mode = "soft",
  onSuccess,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPermanent = mode === "permanent";

  async function handleConfirm() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = isPermanent
        ? await permanentDeleteMenuItemAction(itemIndex)
        : await softDeleteMenuItemAction(categoryName, itemIndex);

      if (!result.success || !result.updatedMenu) {
        setErrorMessage(result.error || "Failed to delete item.");
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      onSuccess(
        result.updatedMenu,
        isPermanent
          ? `Item "${itemName}" permanently deleted. This action cannot be undone.`
          : `"${itemName}" was moved to Recently Deleted.`
      );
      onClose();
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-destructive/30 shadow-2xl z-10 p-6 sm:p-7 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          {isPermanent ? "Delete Item Permanently?" : "Move Menu Item to Trash?"}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {isPermanent
            ? `Are you sure you want to permanently delete "${itemName}"? This item cannot be recovered once removed.`
            : `Are you sure you want to remove "${itemName}" (${itemPrice}) from ${categoryName}? You can restore it anytime from Recently Deleted.`}
        </p>

        <div
          className={`p-3 rounded-xl text-[11px] font-medium mb-6 ${
            isPermanent
              ? "bg-destructive/15 text-destructive border border-destructive/30"
              : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
          }`}
        >
          {isPermanent
            ? "⚠️ Danger: This will permanently delete this item from the database."
            : "💡 Reversible: Item will be hidden from the public menu and stored in Trash for easy restoration."}
        </div>

        {errorMessage && (
          <p className="text-xs text-destructive font-medium mb-4">
            {errorMessage}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-[#faf9f6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-destructive/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{isPermanent ? "Deleting..." : "Moving to Trash..."}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isPermanent ? "Delete Permanently" : "Move to Trash"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
