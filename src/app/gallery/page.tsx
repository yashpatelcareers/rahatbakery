import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { GalleryGrid, type GalleryItem } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery | A Glimpse Inside Rahat Bakery",
  description: "Explore photos of the storefront, atmosphere, and authentic South Asian sweets and bakery delicacies at Rahat Bakery in Laurel, MD.",
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "storefront-wide",
    src: "/images/gallery/gallery4.png",
    alt: "Rahat Bakery illuminated storefront and exterior in Laurel, MD",
    title: "Storefront & Evening Atmosphere",
    category: "Bakery & Storefront",
    isFeatured: true,
  },
  {
    id: "interior-lounge",
    src: "/images/gallery/gallery1.png",
    alt: "Rahat Bakery interior lounge seating and signature yellow-tile brand wall",
    title: "Bakery Lounge & Atmosphere",
    category: "Interior & Atmosphere",
  },
  {
    id: "halal-heritage",
    src: "/images/gallery/gallery3.png",
    alt: "Rahat Bakery Halal certified door detail and traditional brass urn",
    title: "Handcrafted & Halal Heritage",
    category: "Bakery Detail",
  },
  {
    id: "storefront-entrance",
    src: "/images/gallery/gallery2.png",
    alt: "Rahat Bakery daytime storefront entrance and awning",
    title: "Storefront & Entrance",
    category: "Exterior View",
  },
];

export default function GalleryPage() {
  return (
    <main className="flex-1 bg-[#faf9f6]">
      <section className="py-20 md:py-28">
        <Container>
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20 px-6">
            <p className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">
              Atmosphere
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 text-foreground tracking-tight uppercase">
              Gallery
            </h1>
            <p className="text-muted-foreground font-light text-lg md:text-xl tracking-wide">
              A glimpse inside Rahat Bakery.
            </p>
            <div className="w-12 h-px bg-primary/40 mx-auto mt-8" />
          </div>

          {/* Curated Storytelling Gallery Grid */}
          <GalleryGrid items={GALLERY_ITEMS} />
        </Container>
      </section>
    </main>
  );
}
