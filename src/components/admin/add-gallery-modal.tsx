"use client";

import { useState, useRef } from "react";
import { X, Upload, Link as LinkIcon, Sparkles, AlertCircle, Image as ImageIcon, Video } from "lucide-react";
import type { GalleryMediaItem } from "@/types";
import Image from "next/image";

interface AddGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: "bakery" | "food" | "sweets" | "videos";
  onSuccess: (updatedItems: GalleryMediaItem[], message: string) => void;
}

export function AddGalleryModal({
  isOpen,
  onClose,
  defaultCategory = "bakery",
  onSuccess,
}: AddGalleryModalProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [category, setCategory] = useState<"bakery" | "food" | "sweets" | "videos">(defaultCategory);
  const [alt, setAlt] = useState("");
  const [srcUrl, setSrcUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSrcUrl("");
    setAlt("");
    setIsFeatured(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (tab === "file" && !selectedFile) {
      setErrorMessage("Please choose an image file from your device.");
      return;
    }

    if (tab === "url" && !srcUrl.trim()) {
      setErrorMessage("Please enter a valid image or video URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("category", category);
      formData.set("alt", alt.trim() || "Rahat Bakery showcase");
      formData.set("isFeatured", isFeatured ? "true" : "false");

      if (tab === "file" && selectedFile) {
        formData.set("file", selectedFile);
      } else if (tab === "url") {
        formData.set("srcUrl", srcUrl.trim());
      }

      // Post directly to upload API endpoint for multipart reliability
      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success || !result?.updatedItems) {
        setErrorMessage(result?.error || `Upload failed with status ${response.status}.`);
        setIsSubmitting(false);
        return;
      }

      const categoryLabels: Record<string, string> = {
        bakery: "Atmosphere & Storefront",
        food: "Savory & Culinary Food",
        sweets: "Traditional Sweets & Mithai",
        videos: "Featured Videos",
      };

      onSuccess(
        result.updatedItems,
        `Added media to "${categoryLabels[category] || category}" successfully!`
      );
      handleReset();
      onClose();
    } catch (err) {
      console.error("[Add Gallery Modal] Upload error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to connect to upload service."
      );
    } finally {
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
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-border/40 shadow-2xl z-10 p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Add Gallery Media
              </h2>
              <p className="text-xs text-muted-foreground">
                Publish photography or videos to the live gallery.
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

        {/* Input Mode Tabs */}
        <div className="flex rounded-xl bg-[#faf9f6] p-1 border border-border/40 mb-5">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === "file"
                ? "bg-white text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === "url"
                ? "bg-white text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker or URL Input */}
          {tab === "file" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5">
                Select Photo or Video
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/70 hover:border-primary/60 rounded-xl p-5 text-center cursor-pointer bg-[#faf9f6]/60 hover:bg-[#faf9f6] transition-colors flex flex-col items-center justify-center gap-2"
              >
                {previewUrl ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border/50 shadow-xs">
                    {selectedFile?.type.startsWith("video/") ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-1">
                        <Video className="w-8 h-8 text-primary" />
                        <span className="text-[10px] font-mono">Video Selected</span>
                      </div>
                    ) : (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">Click to browse</span> or drag and drop
                    </div>
                    <span className="text-[10px] text-muted-foreground/80">
                      PNG, JPG, WEBP, GIF, MP4 (Max 8MB)
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="media-src-url"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                Image or Video URL
              </label>
              <input
                id="media-src-url"
                type="url"
                required
                placeholder="https://example.com/images/bakery-special.jpg"
                value={srcUrl}
                onChange={(e) => setSrcUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono"
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="gallery-category-select"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Gallery Category
            </label>
            <select
              id="gallery-category-select"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "bakery" | "food" | "sweets" | "videos")
              }
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              <option value="bakery">Atmosphere & Storefront (Bakery)</option>
              <option value="food">Savory Food & Bakery Delights (Food)</option>
              <option value="sweets">Traditional Sweets & Mithai (Sweets)</option>
              <option value="videos">Featured Video Clips (Videos)</option>
            </select>
          </div>

          {/* Title / Description */}
          <div>
            <label
              htmlFor="media-title"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Title / Description (Alt Text)
            </label>
            <input
              id="media-title"
              type="text"
              placeholder="e.g. Freshly baked Gulab Jamun display, Laurel store entrance"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <label htmlFor="isFeatured" className="text-xs text-foreground/80 font-medium">
              Featured Highlight (Displays prominently in gallery grid)
            </label>
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
                  <span>Publish to Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
