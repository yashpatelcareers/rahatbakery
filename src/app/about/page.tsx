import { Container } from "@/components/ui/container";
import { SITE_CONFIG } from "@/lib/constants";

export default function AboutPage() {
  return (
    <main className="flex-1 bg-[#faf9f6]">
      {/* Header */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground text-center px-6">
        <Container>
          <h2 className="font-sans text-xs tracking-[0.4em] uppercase text-primary mb-8 font-bold">Who We Are</h2>
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl mb-10 tracking-tight">Our Story</h1>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start max-w-7xl mx-auto px-6">
            
            {/* Story */}
            <div className="lg:col-span-7 space-y-8 text-lg md:text-xl text-foreground/80 font-light leading-[2]">
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
              <p className="font-serif italic text-2xl md:text-3xl text-primary mt-12">
                Kuch Meetha, Kuch Namkeen
              </p>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-5 bg-white p-12 lg:p-16 shadow-sm border border-border/40">
              <h2 className="font-serif text-3xl md:text-4xl mb-12 text-foreground">Visit Us</h2>
              
              <div className="space-y-12">
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-bold">Location</h3>
                  <p className="font-light text-lg text-foreground/80">{SITE_CONFIG.contact.address}</p>
                </div>
                
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-bold">Opening Hours</h3>
                  <ul className="space-y-3 font-light text-lg text-foreground/80">
                    {SITE_CONFIG.hours.map((h, i) => (
                      <li key={i} className="flex justify-between border-b border-border/40 pb-3">
                        <span className="font-medium">{h.day}</span>
                        <span>{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-bold">Contact</h3>
                  <p className="font-light text-lg text-foreground/80 mb-2">{SITE_CONFIG.contact.phone}</p>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-bold">Social</h3>
                  <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-block font-light text-lg text-foreground/80 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">
                    Follow us on Instagram
                  </a>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Google Maps Section */}
      <section className="py-24 md:py-32 bg-background border-t border-border/40">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16 px-6">
            <h2 className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-6 font-bold">Visit Us</h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              Find Rahat Bakery in Laurel, Maryland and stop by for authentic South Asian sweets, fresh bakery items, cakes, pastries, and traditional mithai.
            </p>
          </div>
          
          <div className="w-full max-w-6xl mx-auto px-6 lg:px-0">
            <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-muted">
              {/* PASTE YOUR OFFICIAL GOOGLE MAPS IFRAME URL IN THE SRC BELOW */}
              <iframe 
                src="https://maps.google.com/maps?q=Rahat%20Bakers%20and%20Sweets,%2013919%20Baltimore%20Ave,%20Laurel,%20MD%2020707&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-[300px] md:h-[400px] lg:h-[500px] border-0 block" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Rahat Bakery Location"
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
