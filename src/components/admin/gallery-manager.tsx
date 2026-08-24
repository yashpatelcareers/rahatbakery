"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Search,
  Eye,
  Video,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Undo2,
} from "lucide-react";
import { AddGalleryModal } from "@/components/admin/add-gallery-modal";
import { DeleteGalleryModal } from "@/components/admin/delete-gallery-modal";
import { restoreGalleryItemAction } from "@/app/admin/gallery/actions";
import type { GalleryMediaItem } from "@/types";

interface GalleryManagerProps {
  initialItems: GalleryMediaItem[];
  initialDeletedItems?: GalleryMediaItem[];
}

interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error";
}

export function GalleryManager({
  initialItems,
  initialDeletedItems = [],
}: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryMediaItem[]>(initialItems);
  const [deletedItems, setDeletedItems] =
    useState<GalleryMediaItem[]>(initialDeletedItems);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState<
    "bakery" | "food" | "sweets" | "videos"
  >("bakery");

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    item: GalleryMediaItem | null;
    mode: "soft" | "permanent";
  }>({
    isOpen: false,
    item: null,
    mode: "soft",
  });

  const [restoringId, setRestoringId] = useState<string | null>(null);

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

  // Restore action handler
  async function handleRestore(item: GalleryMediaItem) {
    setRestoringId(item.id);
    try {
      const res = await restoreGalleryItemAction(item.id);
      if (res.success && res.updatedItems) {
        setItems(res.updatedItems);
        setDeletedItems(res.deletedItems || []);
        showToast("Gallery item restored.");
      } else {
        showToast(res.error || "Failed to restore gallery item.", "error");
      }
    } catch {
      showToast("A network error occurred while restoring.", "error");
    } finally {
      setRestoringId(null);
    }
  }

  const isTrashView = activeCategoryFilter === "trash";

  // Filtered items
  const displayItems = isTrashView ? deletedItems : items;

  const filteredItems = displayItems
    .filter((item) => {
      if (isTrashView || activeCategoryFilter === "all") return true;
      return item.category === activeCategoryFilter;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.alt.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.src.toLowerCase().includes(q)
      );
    });

  const photosCount = items.filter((i) => i.type === "image").length;
  const videosCount = items.filter((i) => i.type === "video").length;
  const bakeryCount = items.filter((i) => i.category === "bakery").length;
  const foodCount = items.filter((i) => i.category === "food").length;
  const sweetsCount = items.filter((i) => i.category === "sweets").length;

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
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Media Management CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Gallery Media
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage photography and video assets displayed on the public gallery page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Gallery</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedAddCategory("bakery");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Media Asset</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total Active
          </p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">
            {items.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Photos
          </p>
          <p className="font-serif text-2xl font-bold text-primary mt-1">
            {photosCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Videos
          </p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">
            {videosCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border/40 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Categories
          </p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">
            3 Active
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveCategoryFilter(isTrashView ? "all" : "trash")}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
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
            All Active ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("bakery")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategoryFilter === "bakery"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
            }`}
          >
            Bakery ({bakeryCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("food")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategoryFilter === "food"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
            }`}
          >
            Food ({foodCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("sweets")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategoryFilter === "sweets"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
            }`}
          >
            Sweets ({sweetsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("videos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategoryFilter === "videos"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-[#faf9f6] text-muted-foreground hover:text-foreground"
            }`}
          >
            Videos ({videosCount})
          </button>
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
            <span>Recently Deleted ({deletedItems.length})</span>
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
              isTrashView ? "Search deleted items..." : "Search media..."
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

      {/* Trash View Info Banner */}
      {isTrashView && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-0.5">Recently Deleted (Trash)</p>
            <p className="font-light">
              These items are hidden from the public website but safely preserved. Click{" "}
              <strong>Restore</strong> to return an item to the live gallery, or{" "}
              <strong>Delete Permanently</strong> to remove it and purge its media file from storage.
            </p>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] text-muted-foreground mx-auto flex items-center justify-center">
            {isTrashView ? (
              <Trash2 className="w-6 h-6 text-muted-foreground/60" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground/60" />
            )}
          </div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            {isTrashView ? "Trash is Empty" : "No Media Items Found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isTrashView
              ? "Deleted items will appear here where you can restore them or permanently delete them."
              : searchQuery
              ? `No media matches "${searchQuery}". Try a different filter or search term.`
              : "Click 'Add Media Asset' to upload photography or videos to your gallery."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col ${
                isTrashView
                  ? "border-destructive/20 bg-red-50/10"
                  : "border-border/40"
              }`}
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-4/3 bg-black/5 overflow-hidden">
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={
                      item.src.startsWith("data:") ||
                      item.src.includes("placehold.co") ||
                      item.src.includes("supabase.co")
                    }
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white p-4">
                    <Video className="w-8 h-8 text-primary mb-2" />
                    <span className="text-[10px] font-mono text-white/70 truncate max-w-full">
                      {item.src}
                    </span>
                  </div>
                )}

                {/* Badge Overlays */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                  {item.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Trash Tag */}
                {isTrashView && (
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-destructive text-white shadow-xs">
                      Deleted
                    </span>
                  </div>
                )}
              </div>

              {/* Item Details & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="font-serif text-sm font-bold text-foreground line-clamp-2 leading-snug">
                    {item.alt || "Rahat Bakery Showcase"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 truncate">
                    ID: {item.id}
                  </p>
                  {item.deletedAt && (
                    <p className="text-[10px] text-destructive/80 mt-0.5">
                      Deleted: {new Date(item.deletedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2">
                  {isTrashView ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRestore(item)}
                        disabled={restoringId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>
                          {restoringId === item.id ? "Restoring..." : "Restore"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModalState({
                            isOpen: true,
                            item,
                            mode: "permanent",
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-destructive hover:bg-destructive/10 text-[11px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {item.type}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteModalState({
                            isOpen: true,
                            item,
                            mode: "soft",
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors"
                        title="Move to Recently Deleted"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Media Modal */}
      <AddGalleryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={selectedAddCategory}
        onSuccess={(updatedActive, message) => {
          setItems(updatedActive);
          showToast(message);
        }}
      />

      {/* Delete / Permanent Delete Modal */}
      <DeleteGalleryModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, item: null, mode: "soft" })
        }
        item={deleteModalState.item}
        mode={deleteModalState.mode}
        onSuccess={(updatedActive, updatedDeleted, message) => {
          setItems(updatedActive);
          setDeletedItems(updatedDeleted);
          showToast(message);
        }}
      />
    </div>
  );
}
