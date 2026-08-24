import { getSupabaseServerClient } from "@/lib/server/supabase";

export type CmsDocumentKey = "menu" | "gallery" | "store_info" | "reviews_config" | "admin_users" | "admin_audit_logs";

/**
 * Ensures initial CMS documents exist in Supabase.
 * If a table document is missing, it seeds it automatically from defaults and returns the data.
 * If the document exists, it returns the LIVE database data directly.
 */
export async function ensureSupabaseDocumentSeeded(
  key: CmsDocumentKey,
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

    if (existing?.data) {
      return existing.data;
    }

    if (error && error.code === "PGRST116") {
      // Row does not exist — auto seed initial baseline
      console.info(`[Supabase Seed] Auto-seeding initial "${key}" document into Supabase...`);
      const { error: insertError } = await supabase.from("cms_documents").upsert({
        key,
        data: defaultData,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(`[Supabase Seed] Insert error for "${key}":`, insertError.message);
      }

      return defaultData;
    }

    if (error) {
      console.error(`[Supabase Seed] Query error for "${key}":`, error.message);
    }

    return defaultData;
  } catch (err) {
    console.error(`[Supabase Seed] Unexpected error reading/seeding "${key}":`, err);
    return defaultData;
  }
}
