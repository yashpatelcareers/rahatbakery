"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getLogoImage } from "@/lib/images";
import { SITE_CONFIG } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
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

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
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

const NAV_ITEMS = [
  { name: "Menu", href: "/menu" },
  { name: "Gallery", href: "/gallery" },
  { name: "About Us", href: "/about" },
];

export function Navbar() {
  const logoUrl = getLogoImage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#faf9f6] transition-shadow duration-300 shadow-2xs">
      <div className="container mx-auto flex h-28 md:h-32 items-center justify-between px-6 md:px-12 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          {logoUrl.includes('placehold.co') ? (
            <span className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-[0.1em] uppercase">
              Rahat Bakery
            </span>
          ) : (
            <Image 
              src={logoUrl} 
              alt="Rahat Bakery Logo" 
              width={450} 
              height={180} 
              className="h-20 md:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          <nav className="flex items-center space-x-8 text-sm font-medium" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="h-4 w-px bg-border/60" aria-hidden="true" />

          {/* Social Icons */}
          <div className="flex items-center space-x-2">
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Rahat Bakery on Instagram (opens in a new tab)"
              className="text-foreground/70 hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-primary/10 hover:scale-105"
              title="Follow us on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={SITE_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Rahat Bakery on TikTok (opens in a new tab)"
              className="text-foreground/70 hover:text-primary transition-all duration-200 p-2 rounded-full hover:bg-primary/10 hover:scale-105"
              title="Follow us on TikTok"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}
