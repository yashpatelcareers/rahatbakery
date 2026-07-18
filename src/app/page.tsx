import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/constants";
import menuData from "@/data/products.json";
import { getHeroImage, getLocalImageOrPlaceholder } from "@/lib/images";

export default function Home() {
  const featuredProducts = menuData.products.slice(0, 4);
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
          <h2 className="font-sans text-xs tracking-[0.4em] uppercase text-primary mb-8 font-bold drop-shadow-lg">
            EST. IN LAUREL, MD
          </h2>
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
            <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-primary mb-8 font-bold">The Tradition</h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-12 text-foreground leading-[1.1] tracking-tight">
              A Legacy of Pure Taste
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-loose font-light">
              Located in the heart of Laurel, Maryland, {SITE_CONFIG.name} brings you the authentic taste of traditional South Asian sweets alongside freshly baked breads, pastries, and custom cakes. Every item is crafted with passion, honoring time-tested recipes that have brought families together for generations.
            </p>
          </div>
        </Container>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 md:py-32 bg-[#f9f7f4]">
        <Container>
          <div className="text-center mb-20 px-6">
            <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-primary mb-6 font-bold">Tasting Menu</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground">Featured Creations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 px-6 lg:px-0">
            {featuredProducts.map((product) => {
              const imageUrl = getLocalImageOrPlaceholder('menu', product.imageFile, product.name);
              return (
                <div key={product.id} className="group cursor-pointer flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden mb-8 bg-muted relative">
                    <Image 
                      src={imageUrl} 
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                      unoptimized={imageUrl.includes('placehold.co')}
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <h4 className="font-serif text-2xl mb-3 text-foreground/90">{product.name}</h4>
                    <p className="text-muted-foreground font-light tracking-widest text-sm">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-24 text-center">
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
