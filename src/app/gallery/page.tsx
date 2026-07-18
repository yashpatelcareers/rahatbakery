import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getGalleryImages } from "@/lib/images";

export default function GalleryPage() {
  const galleryImages = getGalleryImages();

  return (
    <main className="flex-1 bg-background">
      <section className="py-24 md:py-32">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-24 px-6">
            <h2 className="font-sans text-xs tracking-[0.4em] uppercase text-primary mb-6 font-bold">Atmosphere</h2>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl mb-10 text-foreground tracking-tight">Gallery</h1>
            <p className="text-muted-foreground font-light text-xl tracking-wide leading-relaxed">
              A glimpse into our daily craft, authentic techniques, and the passion that goes into every single bite.
            </p>
          </div>
          
          {galleryImages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-muted rounded-xl">
              <p>No gallery images found.</p>
              <p className="text-sm mt-2">Please upload images to <code className="bg-background px-2 py-1 rounded">public/images/gallery</code></p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 px-6 lg:px-0 max-w-7xl mx-auto">
              {galleryImages.map((image, i) => (
                <div key={i} className="break-inside-avoid relative overflow-hidden bg-muted group cursor-pointer aspect-square">
                  <Image 
                    src={image.src} 
                    alt={image.alt}
                    fill 
                    className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
