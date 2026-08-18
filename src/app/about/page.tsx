import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Story & Heritage",
  description: "Learn about the heritage of Rahat Bakery since 1950, our traditional South Asian recipes, and our bakery in Laurel, MD.",
};

export default function AboutPage() {
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
                    {SITE_CONFIG.contact.address}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-bold">
                    Opening Hours
                  </h3>
                  <ul className="space-y-3 font-light text-sm sm:text-base text-foreground/80">
                    {SITE_CONFIG.hours.map((h, i) => (
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
                    <a href={`tel:${SITE_CONFIG.contact.phone}`} className="hover:text-primary transition-colors">
                      {SITE_CONFIG.contact.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-bold">
                    Follow Along
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <a 
                      href={SITE_CONFIG.social.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 font-light text-sm sm:text-base text-foreground/80 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5 w-fit"
                    >
                      <span>Follow on Instagram</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                    <a 
                      href={SITE_CONFIG.social.tiktok} 
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

      {/* Google Maps Section */}
      <section className="py-20 md:py-28 bg-background border-t border-border/40">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12 px-6">
            <h2 className="font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-bold">
              Find Our Bakery
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              Find Rahat Bakery in Laurel, Maryland and stop by for authentic South Asian sweets, fresh bakery items, cakes, pastries, and traditional mithai.
            </p>
          </div>
          
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="w-full rounded-2xl overflow-hidden shadow-md border border-border/40 bg-muted">
              <iframe 
                src="https://maps.google.com/maps?q=Rahat%20Bakers%20and%20Sweets,%2013919%20Baltimore%20Ave,%20Laurel,%20MD%2020707&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-[320px] sm:h-[400px] lg:h-[480px] border-0 block" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Rahat Bakery Google Maps Location"
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
