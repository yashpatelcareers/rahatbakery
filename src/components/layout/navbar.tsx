import Link from "next/link";
import Image from "next/image";
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

export function Navbar() {
  const logoUrl = getLogoImage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-32 md:h-40 items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center space-x-2">
          {logoUrl.includes('placehold.co') ? (
            <span className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-[0.1em] uppercase">
              Rahat Bakery
            </span>
          ) : (
            <Image 
              src={logoUrl} 
              alt="Rahat Bakery Logo" 
              width={500} 
              height={200} 
              className="h-24 md:h-32 w-auto object-contain"
              priority
            />
          )}
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-10 text-sm font-medium">
            <Link href="/menu" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">Menu</Link>
            <Link href="/gallery" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">Gallery</Link>
            <Link href="/about" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">About Us</Link>
          </nav>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center space-x-2">
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Rahat Bakery on Instagram (opens in a new tab)"
              className="text-foreground/70 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10"
              title="Follow us on Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href={SITE_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Rahat Bakery on TikTok (opens in a new tab)"
              className="text-foreground/70 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10"
              title="Follow us on TikTok"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
