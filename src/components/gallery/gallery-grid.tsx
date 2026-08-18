"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  isFeatured?: boolean;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + items.length) % items.length));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % items.length));
  }, [items.length]);

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

  const featuredItem = items.find((item) => item.isFeatured) || items[0];
  const remainingItems = items.filter((item) => item.id !== featuredItem?.id);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Prominent Featured Shot (Wide Exterior) */}
        {featuredItem && (
          <div
            className="group relative rounded-xl overflow-hidden bg-muted border border-border/40 shadow-sm cursor-pointer"
            onClick={() => setSelectedIndex(items.findIndex((i) => i.id === featuredItem.id))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedIndex(items.findIndex((i) => i.id === featuredItem.id));
              }
            }}
            aria-label={`Enlarge photo: ${featuredItem.title}`}
          >
            <div className="aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] relative overflow-hidden bg-black/5">
              <Image
                src={featuredItem.src}
                alt={featuredItem.alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 flex items-end justify-between text-white">
                <div>
                  <p className="text-[10px] sm:text-xs font-sans tracking-[0.25em] uppercase text-primary font-bold mb-2">
                    {featuredItem.category}
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-white tracking-wide">
                    {featuredItem.title}
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/80 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Maximize2 size={14} />
                  <span>Expand</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Editorial Grid (Interior, Halal Detail, Daytime Entrance) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {remainingItems.map((item) => {
            const index = items.findIndex((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden bg-white border border-border/40 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => setSelectedIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(index);
                  }
                }}
                aria-label={`Enlarge photo: ${item.title}`}
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-black/60 text-white text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                      View Photo
                    </span>
                  </div>
                </div>
                <div className="p-5 text-center bg-white flex-1 flex flex-col justify-center">
                  <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-primary font-bold mb-1">
                    {item.category}
                  </p>
                  <h3 className="font-serif text-lg text-foreground/90 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={items[selectedIndex].title}
        >
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all z-[110] p-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={handleClose}
            aria-label="Close photo preview"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          {/* Navigation Controls */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 transition-all z-[110] p-3 rounded-full border border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 transition-all z-[110] p-3 rounded-full border border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Active Image and Caption */}
          <div
            className="relative w-full h-full max-w-5xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[75vh] max-h-[800px]">
              <Image
                src={items[selectedIndex].src}
                alt={items[selectedIndex].alt}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <div className="mt-4 text-center text-white px-4">
              <p className="text-[11px] font-sans tracking-[0.25em] uppercase text-primary font-bold mb-1">
                {items[selectedIndex].category} — Photo {selectedIndex + 1} of {items.length}
              </p>
              <p className="font-serif text-xl sm:text-2xl text-white/95">
                {items[selectedIndex].title}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
