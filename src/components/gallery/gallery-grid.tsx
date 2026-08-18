"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import type { GalleryMediaItem, GalleryCategoryKey } from "@/types";

interface GalleryGridProps {
  items: GalleryMediaItem[];
}

const CATEGORIES: { key: GalleryCategoryKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "bakery", label: "Bakery & Store" },
  { key: "food", label: "Food" },
  { key: "sweets", label: "Sweets" },
  { key: "videos", label: "Videos" },
];

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryKey>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Touch swipe handling for mobile lightbox
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + filteredItems.length) % filteredItems.length
    );
  }, [filteredItems.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % filteredItems.length
    );
  }, [filteredItems.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    },
    [selectedIndex, handleClose, handlePrev, handleNext]
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, handleKeyDown]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const activeItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  // Prominent wide featured photo for Bakery & Store / All view
  const featuredBakeryItem = useMemo(() => {
    if (activeCategory === "bakery" || activeCategory === "all") {
      return filteredItems.find((item) => item.isFeatured);
    }
    return undefined;
  }, [filteredItems, activeCategory]);

  const gridItems = useMemo(() => {
    if (featuredBakeryItem) {
      return filteredItems.filter((item) => item.id !== featuredBakeryItem.id);
    }
    return filteredItems;
  }, [filteredItems, featuredBakeryItem]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Category Filter Navigation */}
      <div className="flex justify-center">
        <nav
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 p-1.5 bg-[#f4f2ed] border border-border/40 rounded-full shadow-2xs max-w-full"
          aria-label="Gallery category filters"
          role="tablist"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSelectedIndex(null);
                }}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Gallery Showcase (Pure Photography Focus) */}
      <div className="space-y-8">
        {/* Prominent Featured Wide Exterior Shot */}
        {featuredBakeryItem && (
          <div
            className="group relative rounded-2xl overflow-hidden bg-black/5 border border-border/30 shadow-xs hover:shadow-md transition-all duration-500 cursor-pointer"
            onClick={() => {
              const index = filteredItems.findIndex((i) => i.id === featuredBakeryItem.id);
              setSelectedIndex(index);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const index = filteredItems.findIndex((i) => i.id === featuredBakeryItem.id);
                setSelectedIndex(index);
              }
            }}
            aria-label="View large photo"
          >
            <div className="aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] relative overflow-hidden">
              <Image
                src={featuredBakeryItem.src}
                alt={featuredBakeryItem.alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                priority
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-6 md:p-8">
                <span className="inline-flex items-center gap-2 bg-black/60 text-white text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  <Maximize2 size={13} />
                  <span>View Full</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Photography Grid (No text cards, pure visual presentation) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {gridItems.map((item) => {
            const index = filteredItems.findIndex((i) => i.id === item.id);
            const isVideo = item.type === "video";

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-black/5 border border-border/30 shadow-xs hover:shadow-lg transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(index);
                  }
                }}
                aria-label="Open photo viewer"
              >
                {/* Media Container preserving natural proportions */}
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  {isVideo ? (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={item.src}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/95 text-primary-foreground flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play size={22} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-black/60 text-white text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                          View
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PREMIUM FULLSCREEN LIGHTBOX & SLIDESHOW VIEWER */}
      {selectedIndex !== null && activeItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery media viewer"
        >
          {/* Top Bar: Counter & Close Button */}
          <div className="absolute top-6 inset-x-6 sm:inset-x-10 flex items-center justify-between z-[110] text-white">
            <span className="text-xs sm:text-sm font-sans tracking-[0.25em] uppercase text-white/70">
              {selectedIndex + 1} / {filteredItems.length}
            </span>
            <button
              type="button"
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all p-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={handleClose}
              aria-label="Close viewer"
            >
              <X size={26} strokeWidth={1.5} />
            </button>
          </div>

          {/* Left Arrow (Desktop / Tablet) */}
          {filteredItems.length > 1 && (
            <button
              type="button"
              className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/80 transition-all z-[110] p-3 rounded-full border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Right Arrow (Desktop / Tablet) */}
          {filteredItems.length > 1 && (
            <button
              type="button"
              className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/80 transition-all z-[110] p-3 rounded-full border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Media Centerpiece */}
          <div
            className="relative w-full h-full max-w-5xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "video" ? (
              <video
                src={activeItem.src}
                controls
                autoPlay
                playsInline
                className="max-h-[82vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
              />
            ) : (
              <div className="relative w-full h-[82vh]">
                <Image
                  src={activeItem.src}
                  alt={activeItem.alt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
