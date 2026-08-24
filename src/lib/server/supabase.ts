import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClientInstance: SupabaseClient | null = null;

/**
 * Resolves the Supabase URL from supported environment variable aliases
 */
export function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    "";
  return url.trim();
}

/**
 * Resolves the Supabase Key from supported environment variable aliases (preferring service role)
 */
export function getSupabaseKey(): string {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  return key.trim();
}

/**
 * Checks whether Supabase environment variables are configured with valid non-placeholder values
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  const isPlaceholderUrl =
    !url ||
    url === "your_supabase_project_url_here" ||
    url.includes("your-project.supabase.co");

  const isPlaceholderKey =
    !key ||
    key === "your_supabase_service_role_key_here" ||
    key === "your_supabase_anon_key_here";

  return !isPlaceholderUrl && !isPlaceholderKey;
}

/**
 * Server-only Supabase Client.
 * Uses the privileged Service Role Key for backend CMS mutations and public reads,
 * guaranteeing zero permission blockers while keeping all credentials strictly server-side.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (serverClientInstance) {
    return serverClientInstance;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  try {
    serverClientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return serverClientInstance;
  } catch (err) {
    console.error("[Supabase Client] Error initializing Supabase client:", err);
    return null;
  }
}
