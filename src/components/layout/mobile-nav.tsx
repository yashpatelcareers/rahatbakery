"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  // Prevent background scrolling and handle escape key when mobile menu is open
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

  const closeMenu = () => setIsOpen(false);

  const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Gallery", href: "/gallery" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <div className="md:hidden flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-3 -mr-2 text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
      >
        {isOpen ? (
          <X className="h-7 w-7" strokeWidth={1.75} />
        ) : (
          <Menu className="h-7 w-7" strokeWidth={1.75} />
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed inset-x-0 top-28 bottom-0 z-50 bg-[#faf9f6] flex flex-col justify-between px-8 py-10 border-t border-border/40 shadow-2xl overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={closeMenu}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <nav
            className="flex flex-col space-y-4 text-center w-full max-w-xs mx-auto my-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation Links"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-xl sm:text-2xl py-3.5 font-semibold uppercase tracking-[0.2em] transition-all rounded-xl min-h-[48px] flex items-center justify-center ${
                    isActive
                      ? "text-primary font-bold bg-primary/10 border border-primary/25"
                      : "text-foreground hover:text-primary hover:bg-black/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Social Links on Mobile */}
          <div 
            className="pt-6 border-t border-border/40 flex items-center justify-center gap-6 max-w-xs mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors p-2"
              aria-label="Instagram (opens in a new tab)"
            >
              <InstagramIcon className="w-4 h-4 text-primary" />
              <span>Instagram</span>
            </a>
            <span className="text-border" aria-hidden="true">•</span>
            <a
              href={SITE_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors p-2"
              aria-label="TikTok (opens in a new tab)"
            >
              <TikTokIcon className="w-4 h-4 text-primary" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
