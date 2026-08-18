import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { GoogleReviewsData, GoogleReviewItem } from "@/types";

interface GoogleReviewsSectionProps {
  initialData: GoogleReviewsData;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className="flex items-center gap-1 text-primary text-sm sm:text-base" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="text-primary select-none">★</span>
      ))}
      {hasHalfStar && (
        <span className="text-primary select-none opacity-80">★</span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="text-muted-foreground/30 select-none">★</span>
      ))}
    </div>
  );
}

function GoogleLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27a7.15 7.15 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GoogleReviewsSection({ initialData }: GoogleReviewsSectionProps) {
  const { rating, userRatingCount, reviews, googleMapsUri, isConfigured } = initialData;
  const hasLiveReviews = isConfigured && reviews.length > 0;

  return (
    <section className="py-20 md:py-28 bg-[#faf9f6] border-t border-border/30" aria-label="Customer Reviews">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-18 px-4 sm:px-6">
          <p className="font-sans text-[10px] sm:text-xs tracking-[0.35em] uppercase text-primary mb-3 font-bold">
            What Our Customers Say
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight mb-4">
            Google Reviews
          </h2>

          {/* Rating Summary Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6">
            {rating > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border/40 shadow-2xs">
                <span className="font-serif font-bold text-xl text-foreground leading-none">
                  {rating.toFixed(1)}
                </span>
                <StarRating rating={rating} />
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 tracking-wide">
              <GoogleLogoIcon className="w-4 h-4" />
              <span>
                {userRatingCount > 0
                  ? `Based on ${userRatingCount} Google Reviews`
                  : "Google Customer Reviews"}
              </span>
            </div>
          </div>

          <div className="w-12 h-px bg-primary/50 mx-auto mt-6" />
        </div>

        {/* Reviews Showcase Grid */}
        {hasLiveReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
            {reviews.map((review: GoogleReviewItem) => (
              <div
                key={review.id}
                className="bg-white p-7 sm:p-8 rounded-2xl border border-border/35 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Review Stars & Relative Time */}
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={review.rating} />
                    <span className="text-[11px] font-sans text-muted-foreground uppercase tracking-widest">
                      {review.relativeTime}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="font-sans text-sm sm:text-[15px] text-foreground/85 font-light leading-relaxed mb-6 italic line-clamp-6">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Reviewer Meta & Source Link */}
                <div className="pt-4 border-t border-border/30 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    {review.authorPhotoUri ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border/50 bg-muted shrink-0">
                        <Image
                          src={review.authorPhotoUri}
                          alt={review.authorName}
                          fill
                          sizes="36px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-serif font-bold text-sm shrink-0">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-serif font-semibold text-sm text-foreground leading-tight">
                        {review.authorName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-sans tracking-wide">
                        Verified Google User
                      </p>
                    </div>
                  </div>

                  {review.googleMapsUri && (
                    <a
                      href={review.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-foreground font-semibold tracking-wider transition-colors inline-flex items-center gap-1 shrink-0"
                      aria-label={`View ${review.authorName}'s review on Google Maps (opens in new tab)`}
                    >
                      <span>View</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Graceful Fallback Card when API is not configured or in fallback state */
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-border/35 shadow-xs text-center">
              <div className="flex justify-center mb-4">
                <StarRating rating={5} />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
                Loved by Our Community in Laurel, MD
              </h3>
              <p className="font-sans text-sm sm:text-base text-muted-foreground font-light leading-relaxed max-w-md mx-auto mb-8">
                Discover why families and food lovers visit Rahat Bakery for authentic South Asian sweets, custom cakes, and savory snacks.
              </p>
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-black hover:text-white transition-all duration-300"
              >
                <span>Read Customer Reviews on Google</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        )}

        {/* Attribution & Read All Reviews CTA */}
        <div className="mt-14 flex flex-col items-center justify-center text-center space-y-4 px-4">
          <a
            href={googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b-2 border-primary text-primary pb-1.5 uppercase tracking-[0.2em] text-xs font-bold hover:text-foreground hover:border-foreground transition-all duration-300"
            aria-label="Read all customer reviews on Google Maps (opens in new tab)"
          >
            <span>Read All Reviews on Google</span>
            <span aria-hidden="true">&rarr;</span>
          </a>

          <p className="text-[10px] sm:text-xs text-muted-foreground font-sans tracking-wide max-w-md">
            Reviews are displayed using Google&apos;s default relevance ordering. Powered by Google Places.
          </p>
        </div>
      </Container>
    </section>
  );
}
