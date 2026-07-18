import Link from "next/link";
import Image from "next/image";
import { getLogoImage } from "@/lib/images";

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
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
          <Link href="/menu" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">Menu</Link>
          <Link href="/gallery" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">Gallery</Link>
          <Link href="/about" className="transition-colors hover:text-primary uppercase tracking-[0.15em] text-xs font-semibold">About Us</Link>
        </nav>
      </div>
    </header>
  );
}
