import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-20 mt-auto">
      <div className="container mx-auto grid gap-16 px-6 md:grid-cols-3 md:px-12 text-center md:text-left max-w-7xl">
        
        {/* Brand Column */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-serif text-3xl font-bold text-primary mb-6 tracking-widest uppercase">Rahat Bakery</h3>
          <p className="text-sm text-secondary-foreground/70 max-w-xs leading-loose font-light">
            {SITE_CONFIG.description}
          </p>
        </div>
        
        {/* Navigation Column */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-sans font-bold mb-8 tracking-[0.2em] uppercase text-xs text-primary">Explore</h4>
          <ul className="space-y-5 text-sm text-secondary-foreground/80 font-light">
            <li><Link href="/" className="hover:text-primary hover:tracking-wide transition-all duration-300">Home</Link></li>
            <li><Link href="/menu" className="hover:text-primary hover:tracking-wide transition-all duration-300">Menu</Link></li>
            <li><Link href="/gallery" className="hover:text-primary hover:tracking-wide transition-all duration-300">Gallery</Link></li>
            <li><Link href="/about" className="hover:text-primary hover:tracking-wide transition-all duration-300">About Us</Link></li>
          </ul>
        </div>
        
        {/* Contact Column */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-sans font-bold mb-8 tracking-[0.2em] uppercase text-xs text-primary">Visit Us</h4>
          <address className="not-italic text-sm text-secondary-foreground/80 space-y-3 font-light leading-relaxed">
            <p className="max-w-[200px]">{SITE_CONFIG.contact.address}</p>
            <p className="pt-2">T: {SITE_CONFIG.contact.phone}</p>
            <div className="pt-6 flex items-center gap-4 justify-center md:justify-start w-full">
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold border-b border-primary/30 hover:border-white pb-1">
                Instagram
              </a>
              <span className="text-secondary-foreground/30">•</span>
              <a href={SITE_CONFIG.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold border-b border-primary/30 hover:border-white pb-1">
                TikTok
              </a>
            </div>
          </address>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="container mx-auto mt-20 pt-8 border-t border-secondary-foreground/10 text-center text-[10px] tracking-[0.3em] uppercase text-secondary-foreground/40 px-6">
        <p>&copy; {new Date().getFullYear()} RAHAT BAKERY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
