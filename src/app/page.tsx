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
      <section className="relative w-full h-[85vh] min-h-[640px] max-h-[850px] flex items-center justify-center bg-secondary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImage} 
            alt="Rahat Bakery storefront and delicacies" 
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority
            unoptimized={heroImage.includes('placehold.co')}
          />
        </div>
        
        {/* Cinematic dark overlay ensuring perfect contrast */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-10" />
        
        <Container className="relative z-20 text-center text-white flex flex-col items-center px-6 max-w-5xl">
          <p className="font-sans text-[11px] sm:text-xs tracking-[0.4em] uppercase text-primary mb-6 font-bold drop-shadow-md">
            EST. IN LAUREL, MD
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider mb-6 drop-shadow-2xl uppercase text-white">
            {SITE_CONFIG.name}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.04em] max-w-2xl mx-auto mb-10 text-white/90 drop-shadow-md leading-relaxed">
            Authentic South Asian Sweets & Premium Bakery
          </p>
          <Link 
            href="/menu"
            className="inline-flex h-13 sm:h-14 items-center justify-center bg-primary px-8 sm:px-10 rounded-full text-xs sm:text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 shadow-lg active:scale-95"
          >
            Discover the Menu
          </Link>
        </Container>
      </section>

      {/* WELCOME SECTION (THE TRADITION) */}
      <section className="py-20 md:py-28 bg-[#faf9f6]">
        <Container>
          <div className="max-w-3xl mx-auto text-center px-6">
            <p className="font-sans text-[10px] sm:text-xs tracking-[0.35em] uppercase text-primary mb-4 font-bold">
              The Tradition
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-8 text-foreground tracking-tight">
              A Legacy of Pure Taste
            </h2>
            <div className="w-12 h-px bg-primary/50 mx-auto mb-8" />
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 leading-relaxed sm:leading-loose font-light">
              Located in the heart of Laurel, Maryland, {SITE_CONFIG.name} brings you the authentic taste of traditional South Asian sweets alongside freshly baked breads, pastries, and custom cakes. Every item is crafted with passion, honoring time-tested recipes that have brought families together for generations.
            </p>
          </div>
        </Container>
      </section>

      {/* OPENING HOURS */}
      <section className="py-16 md:py-24 bg-background border-t border-border/20">
        <Container>
          <div className="max-w-xl mx-auto px-6">
            <div className="bg-white/80 border border-border/40 rounded-2xl p-8 sm:p-10 shadow-xs text-center">
              <p className="font-sans text-[10px] sm:text-xs tracking-[0.35em] uppercase text-primary mb-3 font-bold">
                Plan Your Visit
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl mb-8 text-foreground">
                Opening Hours
              </h2>
              
              <div className="flex flex-col space-y-4 font-sans text-sm sm:text-base text-foreground/80 font-light">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="font-medium text-foreground">Sunday – Thursday</span>
                  <span className="font-semibold text-primary">1:00 PM – 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="font-medium text-foreground">Friday – Saturday</span>
                  <span className="font-semibold text-primary">1:00 PM – 10:00 PM</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-1.5">Location</p>
                <p className="text-xs sm:text-sm font-light text-muted-foreground">{SITE_CONFIG.contact.address}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* WHAT TO TRY (OUR SPECIALTIES) */}
      <section className="py-20 md:py-28 bg-[#f4f2ed]">
        <Container>
          <div className="text-center mb-14 md:mb-18 px-6">
            <p className="font-sans text-[10px] sm:text-xs tracking-[0.35em] uppercase text-primary mb-3 font-bold">
              Our Specialties
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground">What to Try</h2>
            <div className="w-12 h-px bg-primary/50 mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-6 lg:px-0">
            {PROMOTIONAL_ITEMS.map((item) => (
              <Link 
                key={item.title} 
                href={item.href}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border/30 shadow-xs hover:shadow-lg transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                  <Image 
                    src={item.image} 
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl mb-1.5 text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-light text-muted-foreground tracking-wide mb-5">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary group-hover:text-foreground transition-colors pt-3.5 border-t border-border/30">
                    <span>View Menu</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 border-b-2 border-primary text-primary pb-2 uppercase tracking-[0.2em] text-xs font-bold hover:text-foreground hover:border-foreground transition-all duration-300"
            >
              <span>View the Full Menu</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
