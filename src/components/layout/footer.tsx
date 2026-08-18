import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16 md:py-20 mt-auto border-t border-border/20">
      <div className="container mx-auto grid gap-12 md:gap-16 px-6 md:px-12 grid-cols-1 md:grid-cols-3 text-center md:text-left max-w-7xl">
        
        {/* Brand Column */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-4 tracking-widest uppercase">
            Rahat Bakery
          </h3>
          <p className="text-sm text-secondary-foreground/75 max-w-xs leading-relaxed font-light">
            {SITE_CONFIG.description}
          </p>
        </div>
        
        {/* Navigation Column */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-sans font-bold mb-6 tracking-[0.2em] uppercase text-xs text-primary">
            Explore
          </h4>
          <ul className="space-y-3.5 text-sm text-secondary-foreground/80 font-light">
            <li>
              <Link href="/" className="hover:text-primary transition-colors duration-200 py-1 inline-block">
                Home
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-primary transition-colors duration-200 py-1 inline-block">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-primary transition-colors duration-200 py-1 inline-block">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors duration-200 py-1 inline-block">
                About Us
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Visit Us Column */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-sans font-bold mb-6 tracking-[0.2em] uppercase text-xs text-primary">
            Visit Us
          </h4>
          <address className="not-italic text-sm text-secondary-foreground/80 space-y-2.5 font-light leading-relaxed">
            <p className="max-w-[240px]">{SITE_CONFIG.contact.address}</p>
            <p className="pt-1">
              <a href={`tel:${SITE_CONFIG.contact.phone}`} className="hover:text-primary transition-colors">
                T: {SITE_CONFIG.contact.phone}
              </a>
            </p>
            <div className="pt-4 flex items-center gap-4 justify-center md:justify-start w-full">
              <a 
                href={SITE_CONFIG.social.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold border-b border-primary/40 hover:border-white pb-0.5"
                aria-label="Rahat Bakery on Instagram (opens in a new tab)"
              >
                Instagram
              </a>
              <span className="text-secondary-foreground/30" aria-hidden="true">•</span>
              <a 
                href={SITE_CONFIG.social.tiktok} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold border-b border-primary/40 hover:border-white pb-0.5"
                aria-label="Rahat Bakery on TikTok (opens in a new tab)"
              >
                TikTok
              </a>
            </div>
          </address>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="container mx-auto mt-16 pt-8 border-t border-secondary-foreground/10 text-center text-[10px] tracking-[0.25em] uppercase text-secondary-foreground/40 px-6 max-w-7xl">
        <p>&copy; {new Date().getFullYear()} RAHAT BAKERY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
