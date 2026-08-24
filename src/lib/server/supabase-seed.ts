import { getSupabaseServerClient } from "@/lib/server/supabase";
import defaultMenuData from "@/data/menu.json";
import defaultGalleryData from "@/data/gallery.json";
import defaultStoreData from "@/data/store-info.json";
import defaultReviewsData from "@/data/reviews-config.json";

/**
 * Ensures initial CMS documents exist in Supabase.
 * If a table document is missing, it seeds it automatically from local JSON defaults.
 */
export async function ensureSupabaseDocumentSeeded(
  key: "menu" | "gallery" | "store_info" | "reviews_config",
  defaultData: unknown
): Promise<unknown> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return defaultData;
  }

  try {
    const { data: existing, error } = await supabase
      .from("cms_documents")
      .select("data")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = JSON object not found (row does not exist)
      console.warn(`[Supabase Seed] Query error for ${key}:`, error.message);
      return defaultData;
    }

    if (existing?.data) {
      return existing.data;
    }

    // Row does not exist — seed with default data
    console.info(`[Supabase Seed] Auto-seeding initial ${key} document into Supabase...`);
    const { error: insertError } = await supabase.from("cms_documents").upsert({
      key,
      data: defaultData,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.warn(`[Supabase Seed] Insert error for ${key}:`, insertError.message);
    }

    return defaultData;
  } catch (err) {
    console.error(`[Supabase Seed] Unexpected error seeding ${key}:`, err);
    return defaultData;
  }
}

/**
 * Seeds all core documents into Supabase
 */
export async function seedAllSupabaseDocuments(): Promise<void> {
  await Promise.all([
    ensureSupabaseDocumentSeeded("menu", defaultMenuData),
    ensureSupabaseDocumentSeeded("gallery", defaultGalleryData),
    ensureSupabaseDocumentSeeded("store_info", defaultStoreData),
    ensureSupabaseDocumentSeeded("reviews_config", defaultReviewsData),
  ]);
}
