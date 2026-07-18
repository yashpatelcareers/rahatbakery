"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface LightboxImageProps {
  src: string;
  alt: string;
}

export function LightboxImage({ src, alt }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative w-full max-w-3xl mx-auto cursor-pointer group shadow-xl border-8 border-white bg-white"
        onClick={() => setIsOpen(true)}
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
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
            onClick={() => setIsOpen(false)}
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
