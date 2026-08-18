import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import type { GalleryMediaItem } from "@/types";
import galleryData from "@/data/gallery.json";

export const metadata: Metadata = {
  title: "Gallery | A Glimpse Inside Rahat Bakery",
  description: "Explore photos of the storefront, atmosphere, authentic food items, traditional sweets, and featured videos at Rahat Bakery in Laurel, MD.",
};

export default function GalleryPage() {
  const items = galleryData as GalleryMediaItem[];

  return (
    <main className="flex-1 bg-[#faf9f6]">
      <section className="py-20 md:py-28">
        <Container>
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 px-6">
            <p className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">
              Our Visual Journey
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 text-foreground tracking-tight uppercase">
              Gallery
            </h1>
            <p className="text-muted-foreground font-light text-lg md:text-xl tracking-wide">
              A glimpse inside Rahat Bakery.
            </p>
            <div className="w-12 h-px bg-primary/40 mx-auto mt-8" />
          </div>

          {/* Curated Interactive Gallery with Category Filtering */}
          <GalleryGrid items={items} />
        </Container>
      </section>
    </main>
  );
}
