"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface LightboxImageProps {
  src: string;
  alt: string;
}

export function LightboxImage({ src, alt }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      <div 
        className="relative w-full max-w-3xl mx-auto cursor-pointer group shadow-xl border-8 border-white bg-white"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label={`Expand ${alt}`}
      >
        <div className="aspect-[1/1.4] relative bg-muted">
          <Image 
            src={src} 
            alt={alt} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            unoptimized={src.includes('placehold.co')}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="bg-black/75 text-white px-6 py-3 text-sm tracking-[0.2em] uppercase backdrop-blur-sm">
              Click to Expand Menu
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button 
            type="button"
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110] p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            onClick={() => setIsOpen(false)}
            aria-label="Close enlarged menu"
          >
            <X size={48} strokeWidth={1} />
          </button>
          
          <div className="relative w-full h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={src} 
              alt={alt} 
              fill
              className="object-contain"
              unoptimized={src.includes('placehold.co')}
            />
          </div>
        </div>
      )}
    </>
  );
}
