import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getStoreInfoServer } from "@/lib/server/store-service";

export const metadata: Metadata = {
  title: "Our Story & Heritage",
  description: "Learn about the heritage of Rahat Bakery since 1950, our traditional South Asian recipes, and our bakery in Laurel, MD.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const storeInfo = await getStoreInfoServer();

  return (
    <main className="flex-1 bg-[#faf9f6]">
      {/* Header */}
      <section className="py-20 md:py-28 bg-secondary text-secondary-foreground text-center px-6">
        <Container>
          <p className="font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase text-primary mb-6 font-bold">
            Who We Are
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase">
            Our Story
          </h1>
          <div className="w-12 h-px bg-primary/60 mx-auto mt-8" />
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* Story Column */}
            <div className="lg:col-span-7 space-y-8 text-base sm:text-lg md:text-xl text-foreground/80 font-light leading-relaxed md:leading-[1.9]">
              <p>
                Our journey starts in 1950, when Muhammad Idrees Chaudhary and brothers laid the foundation of Rahat Since 1950.
              </p>
              <p>
                Since then through decades and their generations Rahat established itself as a brand that people not only loved but cherished. Their recipes and products became a household staple and the choice of high quality ingredients made the brand a benchmark.
              </p>
              <p>
                At the turn of the century, the brand currently run by the next generations has brought Rahat Since 1950 to all major cities in Pakistan.
              </p>
              <p>
                And now, with Allah&apos;s blessings and continued hard work Rahat Since 1950 has opened its doors in Canada, USA and UAE. With our customers&apos; support and love we continue, to this date, to provide with what our patrons have loved and shall strive to do the same for the future and upcoming generations of customers.
              </p>
              
              <div className="pt-6 border-t border-border/30">
                <p className="font-serif italic text-2xl sm:text-3xl text-primary">
                  Kuch Meetha, Kuch Namkeen
                </p>
              </div>
            </div>

            {/* Visit Us Contact Card */}
            <div className="lg:col-span-5 bg-white p-8 sm:p-12 rounded-2xl shadow-xs border border-border/40">
              <h2 className="font-serif text-3xl sm:text-4xl mb-10 text-foreground">
                Visit Us
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-2.5 font-bold">
                    Location
                  </h3>
                  <p className="font-light text-base sm:text-lg text-foreground/90 leading-relaxed">
                    {storeInfo.contact.address}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-bold">
                    Opening Hours
                  </h3>
                  <ul className="space-y-3 font-light text-sm sm:text-base text-foreground/80">
                    {storeInfo.hours.map((h, i) => (
                      <li key={i} className="flex justify-between border-b border-border/40 pb-2.5">
                        <span className="font-medium text-foreground">{h.day}</span>
                        <span className="font-semibold text-primary">{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-2.5 font-bold">
                    Phone
                  </h3>
                  <p className="font-light text-base sm:text-lg text-foreground/90">
                    <a href={`tel:${storeInfo.contact.phone}`} className="hover:text-primary transition-colors">
                      {storeInfo.contact.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-bold">
                    Follow Along
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a 
                      href={storeInfo.social.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 font-light text-sm sm:text-base text-foreground/80 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5 w-fit"
                    >
                      <span>Follow on Instagram</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                    <a 
                      href={storeInfo.social.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 font-light text-sm sm:text-base text-foreground/80 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5 w-fit"
                    >
                      <span>Follow on TikTok</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>
    </main>
  );
}
