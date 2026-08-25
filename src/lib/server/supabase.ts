import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClientInstance: SupabaseClient | null = null;

function sanitizeEnvValue(val: string | undefined): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip any wrapping quotes accidentally added in Vercel dashboard
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.substring(1, clean.length - 1).trim();
  }
  return clean;
}

/**
 * Resolves and normalizes the Supabase URL from supported environment variable aliases
 */
export function getSupabaseUrl(): string {
  let url =
    sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    sanitizeEnvValue(process.env.SUPABASE_URL) ||
    sanitizeEnvValue(process.env.SUPABASE_PROJECT_URL) ||
    sanitizeEnvValue(process.env.SUPABASE_REST_URL) ||
    "";

  if (!url) return "";

  // Strip trailing slashes and trailing /rest/v1
  url = url.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/i, "");

  // If user pasted a postgres connection URI or pooler host, extract project ref
  // e.g. postgresql://postgres:...@db.abcdefghijklmnopqrst.supabase.co:5432/postgres -> https://abcdefghijklmnopqrst.supabase.co
  if (url.includes(".supabase.co")) {
    const match = url.match(/([a-z0-9_-]+)\.supabase\.co/i);
    if (match && match[1]) {
      const ref = match[1].replace(/^db\./i, "");
      url = `https://${ref}.supabase.co`;
    }
  }

  // Ensure https:// protocol is present (required for Node.js fetch)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

/**
 * Resolves the Supabase Key from supported environment variable aliases (preferring service role)
 */
export function getSupabaseKey(): string {
  const key =
    sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_SERVICE_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_SECRET_KEY) ||
    sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_ANON_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_KEY) ||
    "";
  return key;
}

/**
 * Diagnostic structure for secure inspection without secret leakage
 */
export interface SupabaseDiagnostics {
  isConfigured: boolean;
  hasUrl: boolean;
  urlVarSource: string;
  hasKey: boolean;
  keyVarSource: string;
  missingVariables: string[];
  statusMessage: string;
}

/**
 * Gathers environment diagnostics securely without exposing credentials
 */
export function getSupabaseDiagnostics(): SupabaseDiagnostics {
  let urlVarSource = "NONE";
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) urlVarSource = "NEXT_PUBLIC_SUPABASE_URL";
  else if (process.env.SUPABASE_URL) urlVarSource = "SUPABASE_URL";
  else if (process.env.SUPABASE_PROJECT_URL) urlVarSource = "SUPABASE_PROJECT_URL";

  let keyVarSource = "NONE";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) keyVarSource = "SUPABASE_SERVICE_ROLE_KEY";
  else if (process.env.SUPABASE_SERVICE_KEY) keyVarSource = "SUPABASE_SERVICE_KEY";
  else if (process.env.SUPABASE_SECRET_KEY) keyVarSource = "SUPABASE_SECRET_KEY";
  else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) keyVarSource = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
  else if (process.env.SUPABASE_ANON_KEY) keyVarSource = "SUPABASE_ANON_KEY";

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

  const hasUrl = Boolean(url && !isPlaceholderUrl);
  const hasKey = Boolean(key && !isPlaceholderKey);
  const missingVariables: string[] = [];

  if (!hasUrl) missingVariables.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasKey) missingVariables.push("SUPABASE_SERVICE_ROLE_KEY");

  const isConfigured = hasUrl && hasKey;
  let statusMessage = "Supabase is fully configured and ready.";

  if (!isConfigured) {
    statusMessage = `Supabase is disconnected. Missing in Vercel environment: ${missingVariables.join(", ")}.`;
  }

  return {
    isConfigured,
    hasUrl,
    urlVarSource,
    hasKey,
    keyVarSource,
    missingVariables,
    statusMessage,
  };
}

/**
 * Checks whether Supabase environment variables are configured with valid non-placeholder values
 */
export function isSupabaseConfigured(): boolean {
  const diag = getSupabaseDiagnostics();
  return diag.isConfigured;
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
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => {
          return fetch(input, {
            ...init,
            cache: "no-store",
          });
        },
      },
    });
    return serverClientInstance;
  } catch (err) {
    console.error("[Supabase Client] Error initializing Supabase client:", err);
    return null;
  }
}
