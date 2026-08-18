import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/constants";
import { getHeroImage } from "@/lib/images";

const PROMOTIONAL_ITEMS = [
  {
    title: "Happy Hour Deal",
    subtitle: "Snack Combo & Chai",
    image: "/images/hero/happyhour.png",
    alt: "Rahat Bakery Happy Hour Deal - Monday to Thursday 1 PM to 6 PM",
    href: "/menu",
  },
  {
    title: "Refreshing Drinks",
    subtitle: "Mango & Lychee",
    image: "/images/hero/refreshdrink.png",
    alt: "Pakistan's favourite refreshing drink - Shezan Mango and Lychee",
    href: "/menu",
  },
  {
    title: "Hot Sellers",
    subtitle: "Fresh Daily Bakes",
    image: "/images/hero/hotsellers.png",
    alt: "Rahat Bakery Hot Sellers - Cakes, Patties, and Fresh Breads",
    href: "/menu",
  },
  {
    title: "Rahat Favourites",
    subtitle: "House Classics",
    image: "/images/hero/favourites.png",
    alt: "Rahat Bakery Favourites - Almond Cake, Patties, Kheer, and Sandwiches",
    href: "/menu",
  },
];

export default function Home() {
  const heroImage = getHeroImage();

  return (
    <main className="flex-1 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] min-h-[700px] flex items-center justify-center bg-secondary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImage} 
            alt="Rahat Bakery" 
            fill
            className="object-cover opacity-60"
            priority
            unoptimized={heroImage.includes('placehold.co')}
          />
        </div>
        
        {/* Cinematic dark overlay ensures text readability regardless of background brightness */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-10" />
        
        <Container className="relative z-20 text-center text-white flex flex-col items-center px-6">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-primary mb-8 font-bold drop-shadow-lg">
            EST. IN LAUREL, MD
          </p>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider mb-8 drop-shadow-2xl uppercase">
            {SITE_CONFIG.name}
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-[0.05em] max-w-2xl mx-auto mb-14 text-white/90 drop-shadow-md">
            Authentic South Asian Sweets & Premium Bakery
          </p>
          <Link 
            href="/menu"
            className="inline-flex h-14 items-center justify-center bg-primary px-12 text-sm font-semibold tracking-[0.2em] text-primary-foreground uppercase transition-all hover:bg-white hover:text-black border border-transparent"
          >
            Discover the Menu
          </Link>
        </Container>
      </section>

      {/* WELCOME SECTION */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="max-w-3xl mx-auto text-center px-6">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary mb-8 font-bold">The Tradition</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-12 text-foreground leading-[1.1] tracking-tight">
              A Legacy of Pure Taste
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-loose font-light">
              Located in the heart of Laurel, Maryland, {SITE_CONFIG.name} brings you the authentic taste of traditional South Asian sweets alongside freshly baked breads, pastries, and custom cakes. Every item is crafted with passion, honoring time-tested recipes that have brought families together for generations.
            </p>
          </div>
        </Container>
      </section>

      {/* OPENING HOURS */}
      <section className="py-20 md:py-28 bg-background border-t border-border/20">
        <Container>
          <div className="max-w-2xl mx-auto text-center px-6">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary mb-6 font-bold">Plan Your Visit</p>
            <h2 className="font-serif text-3xl md:text-5xl mb-12 text-foreground">
              Opening Hours
            </h2>
            
            <div className="flex flex-col space-y-4 font-sans text-base md:text-lg text-muted-foreground font-light max-w-sm mx-auto">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <span className="font-medium text-foreground/90">Sunday – Thursday</span>
                <span>1:00 PM – 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-foreground/90">Friday – Saturday</span>
                <span>1:00 PM – 10:00 PM</span>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-border/30 text-center">
              <div className="text-xs font-light text-muted-foreground tracking-wide">
                <span className="block font-semibold uppercase tracking-[0.2em] text-primary text-[10px] mb-1">Location</span>
                <span>{SITE_CONFIG.contact.address}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* WHAT TO TRY (PROMOTIONAL & DEAL SPECIALTIES) */}
      <section className="py-24 md:py-32 bg-[#f9f7f4]">
        <Container>
          <div className="text-center mb-20 px-6">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary mb-6 font-bold">Our Specialties</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">What to Try</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 lg:px-0">
            {PROMOTIONAL_ITEMS.map((item) => (
              <Link 
                key={item.title} 
                href={item.href}
                className="group flex flex-col bg-white rounded-lg overflow-hidden border border-border/40 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                  <Image 
                    src={item.image} 
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl mb-1 text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-light text-muted-foreground tracking-wide mb-5">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary group-hover:text-foreground transition-colors pt-3 border-t border-border/30">
                    <span>View Menu</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <Link 
              href="/menu" 
              className="inline-block border-b border-primary text-primary pb-2 uppercase tracking-[0.2em] text-xs font-bold hover:text-foreground hover:border-foreground transition-all duration-300"
            >
              View the Full Menu
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
