import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getMenuDataServer } from "@/lib/server/menu-service";
import type { MenuData } from "@/types";
import { getLocalImageOrPlaceholder, getPrintedMenuImages } from "@/lib/images";
import { LightboxImage } from "@/components/ui/lightbox-image";

export const metadata: Metadata = {
  title: "Menu | Authentic South Asian Sweets, Cakes & Delicacies",
  description: "Browse Rahat Bakery's complete menu: whole cakes, pastries, biscuits, traditional mithai, savory samosas and patties, and refreshing drinks.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  const { categories }: MenuData = await getMenuDataServer();
  const printedMenuImages = getPrintedMenuImages();

  return (
    <main className="flex-1 bg-[#faf9f6]">
      <section className="py-16 md:py-24">
        <Container>
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24 px-6">
            <p className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">Our Menu</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8 text-foreground tracking-tight">
              A Taste of Pakistan
            </h1>
            <div className="w-12 h-px bg-primary/40 mx-auto" />
          </div>
          
          {/* Responsive Balanced Grid Menu Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-x-20 lg:gap-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
            {categories.map((category) => {
              // Section images from public/images/menu/sections/
              const sectionImageUrl = getLocalImageOrPlaceholder('menu/sections', category.imageFile, category.name + " Image");
              
              // Check if all items in category share the exact same price
              const allItemsSamePrice = category.items.length > 0 && category.items.every(
                (item) => item.price === category.items[0].price
              );

              return (
                <section 
                  key={category.name} 
                  className="scroll-mt-24 flex flex-col col-span-1"
                >
                  {/* Category Header */}
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3 uppercase tracking-wider">
                      {category.name}
                    </h2>
                    {category.subtitle && (
                      <p className="inline-block font-sans text-xs tracking-[0.2em] text-primary uppercase font-bold px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25">
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                  
                  {/* Menu Items Presentation */}
                  <div className="mb-10 flex-1 w-full">
                    {allItemsSamePrice ? (
                      /* Clean, customer-friendly layout for uniform price categories (no repeated price spam) */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 px-2">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0" />
                            <span className="font-serif text-lg text-foreground/90 group-hover:text-primary transition-colors leading-snug">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Individual price layout for mixed pricing categories */
                      <div className="space-y-4">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="break-inside-avoid flex items-baseline justify-between w-full group gap-2">
                            <span className="font-serif text-lg lg:text-xl text-foreground/90 bg-[#faf9f6] pr-2 relative z-10 transition-colors group-hover:text-primary leading-snug">
                              {item.name}
                            </span>
                            
                            {/* Leader dots */}
                            <div className="flex-1 border-b border-dotted border-border/50 mx-1 relative -top-[4px] md:-top-[6px] hidden sm:block" />
                            
                            <span className="font-sans text-base lg:text-lg text-muted-foreground shrink-0 whitespace-nowrap bg-[#faf9f6] pl-2 relative z-10 font-medium">
                              {item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Banner Image - Consistent 2:1 Editorial Ratio, No Cutoffs */}
                  <div className="w-full relative aspect-[2/1] rounded-xl overflow-hidden bg-[#f4f2ed] border border-border/30 shadow-xs mt-auto">
                    <Image 
                      src={sectionImageUrl}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                      className="object-contain"
                      unoptimized={sectionImageUrl.includes('placehold.co')}
                    />
                  </div>
                </section>
              );
            })}
          </div>

          {/* Complete Printed Menu Section */}
          <div className="mt-24 md:mt-32 max-w-6xl mx-auto text-center px-6">
            <p className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">Download or View</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-12">Complete Menu</h2>
            
            <div className={`grid gap-8 justify-center mx-auto ${printedMenuImages.length > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-xl'}`}>
              {printedMenuImages.map((img, i) => (
                <div key={i}>
                  <LightboxImage src={img.src} alt={img.alt} />
                  {printedMenuImages.length > 1 && (
                    <p className="mt-4 font-sans text-[10px] tracking-widest uppercase text-muted-foreground">
                      Page {i + 1}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <p className="mt-8 font-sans text-xs tracking-widest uppercase text-muted-foreground">
              Click any image to expand
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
