import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { getGoogleReviews } from "@/lib/server/google-reviews";
import type { GoogleReviewsData } from "@/types";
import { getSupabaseServerClient } from "@/lib/server/supabase";
import { ensureSupabaseDocumentSeeded } from "@/lib/server/supabase-seed";
import defaultReviewsConfig from "@/data/reviews-config.json";

// Path to reviews configuration file for local fallback
const REVIEWS_CONFIG_PATH = path.join(process.cwd(), "src", "data", "reviews-config.json");

// Zod validation schemas
const ReviewItemSchema = z.object({
  id: z.string().min(1),
  authorName: z.string().min(1, "Author name is required").trim(),
  authorPhotoUri: z.string().optional(),
  authorProfileUri: z.string().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1, "Review text is required").trim(),
  relativeTime: z.string().default("Recently"),
  googleMapsUri: z.string().optional(),
});

export const ReviewsConfigSchema = z.object({
  mode: z.enum(["auto", "live", "curated"]),
  curatedRating: z.number().min(1).max(5),
  curatedTotalCount: z.number().min(0),
  lastSyncTime: z.string().optional(),
  cachedPlaceName: z.string().optional(),
  cachedRating: z.number().optional(),
  cachedUserRatingCount: z.number().optional(),
  googleMapsUri: z.string().optional(),
  curatedReviews: z.array(ReviewItemSchema),
});

export type ReviewsConfig = z.infer<typeof ReviewsConfigSchema>;

export interface EffectiveReviewsResult extends GoogleReviewsData {
  source: "live" | "curated";
  mode: "auto" | "live" | "curated";
  lastSyncTime?: string;
  isLiveConnected: boolean;
  errorMessage?: string;
}

/**
 * Reads the reviews configuration from Supabase (or local fallback)
 */
export async function getReviewsConfigServer(): Promise<ReviewsConfig> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const seededData = await ensureSupabaseDocumentSeeded("reviews_config", defaultReviewsConfig);
      const validated = ReviewsConfigSchema.parse(seededData);
      return validated as ReviewsConfig;
    } catch (error) {
      console.error("[Reviews Service] Error reading from Supabase:", error);
    }
  }

  // Local filesystem fallback
  try {
    const raw = await fs.readFile(REVIEWS_CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = ReviewsConfigSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("[Reviews Service] Error reading reviews config fallback:", error);
    return defaultReviewsConfig as unknown as ReviewsConfig;
  }
}

/**
 * Atomically saves the reviews configuration to Supabase (and local fallback)
 */
export async function saveReviewsConfigServer(
  config: ReviewsConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = ReviewsConfigSchema.parse(config);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: dbError } = await supabase.from("cms_documents").upsert({
        key: "reviews_config",
        data: validated,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("[Reviews Service] Supabase save error:", dbError.message);
        return { success: false, error: `Supabase database error: ${dbError.message}` };
      }
    }

    // Also attempt local filesystem write in dev environments if writeable
    try {
      const jsonString = JSON.stringify(validated, null, 2) + "\n";
      const tempPath = `${REVIEWS_CONFIG_PATH}.tmp`;
      await fs.writeFile(tempPath, jsonString, "utf-8");
      await fs.rename(tempPath, REVIEWS_CONFIG_PATH);
    } catch {
      // Ignore EROFS in serverless runtime environments
    }

    return { success: true };
  } catch (error) {
    console.error("[Reviews Service] Error saving reviews config:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to persist reviews configuration." };
  }
}

/**
 * Returns effective reviews for both the public website and admin dashboard.
 * Seamlessly resolves between Live Google Reviews and Curated Fallbacks.
 */
export async function getEffectiveReviewsData(): Promise<EffectiveReviewsResult> {
  const config = await getReviewsConfigServer();
  const defaultMapsUrl =
    config.googleMapsUri ||
    "https://maps.google.com/?q=Rahat+Bakers+and+Sweets+13919+Baltimore+Ave+Laurel+MD+20707";

  // If set to strict curated mode, return curated data directly
  if (config.mode === "curated") {
    return {
      placeName: config.cachedPlaceName || "Rahat Bakers and Sweets",
      rating: config.curatedRating,
      userRatingCount: config.curatedTotalCount,
      reviews: config.curatedReviews,
      googleMapsUri: defaultMapsUrl,
      isConfigured: true,
      source: "curated",
      mode: "curated",
      lastSyncTime: config.lastSyncTime,
      isLiveConnected: false,
    };
  }

  // Attempt live Google Places fetch
  const liveData = await getGoogleReviews();

  if (liveData.isConfigured && liveData.reviews.length > 0) {
    return {
      ...liveData,
      source: "live",
      mode: config.mode,
      lastSyncTime: config.lastSyncTime || new Date().toISOString(),
      isLiveConnected: true,
    };
  }

  // Graceful fallback to curated data if Google API is unconfigured or unavailable
  return {
    placeName: liveData.placeName || config.cachedPlaceName || "Rahat Bakers and Sweets",
    rating: liveData.rating > 0 ? liveData.rating : config.curatedRating,
    userRatingCount:
      liveData.userRatingCount > 0 ? liveData.userRatingCount : config.curatedTotalCount,
    reviews: config.curatedReviews,
    googleMapsUri: liveData.googleMapsUri || defaultMapsUrl,
    isConfigured: true,
    source: "curated",
    mode: config.mode,
    lastSyncTime: config.lastSyncTime,
    isLiveConnected: false,
    errorMessage:
      !process.env.GOOGLE_PLACES_API_KEY || !process.env.GOOGLE_PLACE_ID
        ? "Google Places API credentials not configured. Serving curated reviews."
        : "Google Places API unreachable or returned 0 reviews. Serving curated fallback.",
  };
}

/**
 * Triggers a manual sync with Google Places API and updates the local cache
 */
export async function syncGoogleReviewsServer(): Promise<{
  success: boolean;
  message: string;
  source: "live" | "curated";
  config: ReviewsConfig;
}> {
  const config = await getReviewsConfigServer();
  const liveData = await getGoogleReviews();

  const now = new Date().toISOString();
  config.lastSyncTime = now;

  let success = false;
  let message = "";
  let source: "live" | "curated" = "curated";

  if (liveData.isConfigured && liveData.reviews.length > 0) {
    config.cachedPlaceName = liveData.placeName;
    config.cachedRating = liveData.rating;
    config.cachedUserRatingCount = liveData.userRatingCount;
    config.googleMapsUri = liveData.googleMapsUri;
    success = true;
    source = "live";
    message = `Successfully synchronized ${liveData.reviews.length} live reviews from Google Places API (${liveData.rating} ★, ${liveData.userRatingCount} reviews).`;
  } else if (!process.env.GOOGLE_PLACES_API_KEY || !process.env.GOOGLE_PLACE_ID) {
    success = true;
    source = "curated";
    message =
      "Google API credentials unset in .env.local. Fallback reviews are active and serving customer reviews.";
  } else {
    success = true;
    source = "curated";
    message =
      "Google Places API returned status 400/error. Curated fallback reviews are active and serving customer reviews.";
  }

  await saveReviewsConfigServer(config);
  return { success, message, source, config };
}
