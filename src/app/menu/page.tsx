import Image from "next/image";
import { Container } from "@/components/ui/container";
import menuData from "@/data/menu.json";
import { getLocalImageOrPlaceholder, getPrintedMenuImages } from "@/lib/images";
import { LightboxImage } from "@/components/ui/lightbox-image";

export default function MenuPage() {
  const { categories } = menuData;
  const printedMenuImages = getPrintedMenuImages();

  return (
    <main className="flex-1 bg-[#faf9f6]">
      <section className="py-16 md:py-24">
        <Container>
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24 px-6">
            <h2 className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">Our Menu</h2>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8 text-foreground tracking-tight">
              A Taste of Pakistan
            </h1>
            <div className="w-12 h-px bg-primary/40 mx-auto" />
          </div>
          
          {/* Responsive CSS Grid Menu Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-x-24 lg:gap-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 grid-flow-dense">
            {categories.map((category) => {
              const isLarge = category.items.length > 6;
              // Look for section images inside the new sections folder
              const sectionImageUrl = getLocalImageOrPlaceholder('menu/sections', category.imageFile, category.name + " Image");
              
              return (
                <section 
                  key={category.name} 
                  className={`scroll-mt-24 flex flex-col ${isLarge ? 'lg:col-span-2' : 'col-span-1'}`}
                >
                  
                  {/* Category Header */}
                  <div className="text-center mb-10">
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3 uppercase tracking-wider">
                      {category.name}
                    </h2>
                    {category.subtitle && (
                      <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] text-muted-foreground uppercase">
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                  
                  {/* Menu Items */}
                  <div className={`mb-12 flex-1 w-full ${isLarge ? 'columns-1 md:columns-2 gap-x-12 lg:gap-x-24' : ''}`}>
                    {category.items.map((item, idx) => (
                      <div key={idx} className="break-inside-avoid flex items-end w-full group mb-5">
                        <span className="font-serif text-lg lg:text-xl text-foreground/90 whitespace-nowrap bg-[#faf9f6] pr-3 relative z-10 transition-colors group-hover:text-primary">
                          {item.name}
                        </span>
                        
                        {/* Leader dots */}
                        <div className="flex-1 border-b border-dotted border-border/50 mx-2 relative -top-[6px] md:-top-[8px]" />
                        
                        <span className="font-sans text-base lg:text-lg text-muted-foreground whitespace-nowrap bg-[#faf9f6] pl-3 relative z-10">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Section Separator Image */}
                  <div className={`w-full relative overflow-hidden bg-muted mt-auto ${isLarge ? 'h-48 md:h-64' : 'h-40 md:h-56'}`}>
                    <Image 
                      src={sectionImageUrl}
                      alt={category.imageAlt}
                      fill
                      className="object-cover grayscale-[10%]"
                      unoptimized={sectionImageUrl.includes('placehold.co')}
                    />
                  </div>
                </section>
              );
            })}
          </div>

          {/* Complete Printed Menu Section */}
          <div className="mt-24 md:mt-32 max-w-6xl mx-auto text-center px-6">
            <h2 className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">Download or View</h2>
            <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-12">Complete Menu</h3>
            
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
