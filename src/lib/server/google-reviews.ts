import type { GoogleReviewsData, GoogleReviewItem } from "@/types";

/**
 * Server-Side Data Fetcher for Google Places API (New)
 * 
 * Fetches real customer reviews and ratings for:
 * Rahat Bakers and Sweets, 13919 Baltimore Ave, Laurel, MD 20707
 * 
 * Security & Cost Control:
 * - Server-only execution: The API key is NEVER sent to the client browser.
 * - Strict Field Mask: Only requests displayName, rating, userRatingCount, reviews, googleMapsUri.
 * - Server Cache: Uses Next.js Incremental Static Regeneration (ISR) revalidating every 1 hour.
 */

const DEFAULT_MAPS_URL = "https://maps.google.com/?q=Rahat+Bakers+and+Sweets+13919+Baltimore+Ave+Laurel+MD+20707";

export async function getGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Graceful fallback if credentials are not yet configured in environment variables
  if (!apiKey || !placeId) {
    return {
      placeName: "Rahat Bakers and Sweets",
      rating: 0,
      userRatingCount: 0,
      reviews: [],
      googleMapsUri: DEFAULT_MAPS_URL,
      isConfigured: false,
    };
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Specific narrow field mask to minimize cost and latency
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
      next: {
        // Revalidate cached reviews every 1 hour (3600 seconds)
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.warn(`[Google Reviews API] Received status ${response.status} from Places API (New)`);
      return {
        placeName: "Rahat Bakers and Sweets",
        rating: 0,
        userRatingCount: 0,
        reviews: [],
        googleMapsUri: DEFAULT_MAPS_URL,
        isConfigured: false,
      };
    }

    const data = await response.json();

    interface GooglePlaceReviewRaw {
      name?: string;
      rating?: number;
      text?: { text?: string; languageCode?: string };
      originalText?: { text?: string; languageCode?: string };
      authorAttribution?: {
        displayName?: string;
        uri?: string;
        photoUri?: string;
      };
      relativePublishTimeDescription?: string;
      googleMapsUri?: string;
    }

    const rawReviews = Array.isArray(data.reviews) ? (data.reviews as GooglePlaceReviewRaw[]) : [];

    // Map raw Google Place Details reviews to clean, sanitized application types
    const reviews: GoogleReviewItem[] = rawReviews.slice(0, 3).map((r: GooglePlaceReviewRaw, idx: number) => ({
      id: r.name || `review-${idx}`,
      authorName: r.authorAttribution?.displayName || "Google Reviewer",
      authorPhotoUri: r.authorAttribution?.photoUri || undefined,
      authorProfileUri: r.authorAttribution?.uri || undefined,
      rating: typeof r.rating === "number" ? r.rating : 5,
      text: r.text?.text || r.originalText?.text || "",
      relativeTime: r.relativePublishTimeDescription || "Recently",
      googleMapsUri: r.googleMapsUri || data.googleMapsUri || DEFAULT_MAPS_URL,
    }));

    return {
      placeName: data.displayName?.text || "Rahat Bakers and Sweets",
      rating: typeof data.rating === "number" ? data.rating : 0,
      userRatingCount: typeof data.userRatingCount === "number" ? data.userRatingCount : 0,
      reviews,
      googleMapsUri: data.googleMapsUri || DEFAULT_MAPS_URL,
      isConfigured: true,
    };
  } catch (error) {
    // Never expose stack trace or API key on error
    console.error("[Google Reviews API] Error fetching place details:", error instanceof Error ? error.message : "Unknown error");
    return {
      placeName: "Rahat Bakers and Sweets",
      rating: 0,
      userRatingCount: 0,
      reviews: [],
      googleMapsUri: DEFAULT_MAPS_URL,
      isConfigured: false,
    };
  }
}
