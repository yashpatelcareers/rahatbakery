import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import type { SiteConfig } from "@/types";
import { computeSummaryHours } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/server/supabase";
import { ensureSupabaseDocumentSeeded } from "@/lib/server/supabase-seed";
import defaultStoreData from "@/data/store-info.json";

// Central path to store information metadata JSON for local fallback
const STORE_INFO_FILE_PATH = path.join(process.cwd(), "src", "data", "store-info.json");

// Zod validation schema for store information
const DayScheduleSchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
  formattedText: z.string().optional(),
});

const StoreAddressSchema = z.object({
  street: z.string().min(1, "Street address is required").trim(),
  unit: z.string().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  zip: z.string().min(1, "ZIP code is required").trim(),
});

const SiteConfigSchema = z.object({
  name: z.string().min(1, "Business name cannot be empty").trim(),
  description: z.string().min(1, "Description cannot be empty").trim(),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  social: z.object({
    instagram: z.string().url("Instagram must be a valid URL").or(z.literal("")),
    tiktok: z.string().url("TikTok must be a valid URL").or(z.literal("")),
  }),
  contact: z.object({
    phone: z.string().min(7, "Valid phone number is required").trim(),
    email: z.string().email("Valid email address is required").or(z.literal("")),
    address: z.string().min(1, "Address is required").trim(),
    addressDetails: StoreAddressSchema.optional(),
    googleMapsUrl: z.string().url("Google Maps link must be a valid URL").or(z.literal("")).optional(),
  }),
  hours: z.array(
    z.object({
      day: z.string(),
      hours: z.string(),
    })
  ),
  schedule: z.array(DayScheduleSchema).optional(),
  previousConfig: z.record(z.string(), z.any()).optional(),
  updatedAt: z.string().optional(),
});

/**
 * Server-only function to read store information from Supabase (or local fallback)
 */
export async function getStoreInfoServer(): Promise<SiteConfig> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const seededData = await ensureSupabaseDocumentSeeded("store_info", defaultStoreData);
      const validated = SiteConfigSchema.parse(seededData);
      return validated as unknown as SiteConfig;
    } catch (error) {
      console.error("[Store Service] Error reading from Supabase:", error);
    }
  }

  // Local filesystem fallback
  try {
    const raw = await fs.readFile(STORE_INFO_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = SiteConfigSchema.parse(parsed);
    return validated as unknown as SiteConfig;
  } catch (error) {
    console.error("[Store Service] Error reading store info fallback:", error);
    return defaultStoreData as unknown as SiteConfig;
  }
}

/**
 * Server-only function to atomically save updated store information to Supabase (and local fallback)
 * Automatically preserves the previous version to allow accidental edit rollback.
 */
export async function saveStoreInfoServer(
  data: SiteConfig
): Promise<{ success: boolean; error?: string; storeInfo?: SiteConfig }> {
  try {
    const currentConfig = await getStoreInfoServer();

    // Recompute summary hours from schedule if schedule is present
    if (data.schedule && data.schedule.length > 0) {
      data.hours = computeSummaryHours(data.schedule);
    }

    // Reconstruct full address if addressDetails are provided
    if (data.contact.addressDetails) {
      const { street, unit, city, state, zip } = data.contact.addressDetails;
      const unitPart = unit ? ` ${unit}` : "";
      data.contact.address = `${street}${unitPart}, ${city}, ${state} ${zip}`;
    }

    // Keep previous revision snapshot (excluding nested previousConfig)
    const snapshot = { ...currentConfig };
    delete snapshot.previousConfig;

    data.previousConfig = snapshot as Partial<SiteConfig>;
    data.updatedAt = new Date().toISOString();

    const validated = SiteConfigSchema.parse(data);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: dbError } = await supabase.from("cms_documents").upsert({
        key: "store_info",
        data: validated,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("[Store Service] Supabase save error:", dbError.message);
        return { success: false, error: `Supabase database error: ${dbError.message}` };
      }
    }

    // Also attempt local filesystem write in dev environments if writeable
    try {
      const jsonString = JSON.stringify(validated, null, 2) + "\n";
      const tempPath = `${STORE_INFO_FILE_PATH}.tmp`;
      await fs.writeFile(tempPath, jsonString, "utf-8");
      await fs.rename(tempPath, STORE_INFO_FILE_PATH);
    } catch {
      // Ignore EROFS in serverless runtime environments
    }

    return { success: true, storeInfo: validated as unknown as SiteConfig };
  } catch (error) {
    console.error("[Store Service] Error saving store info:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to persist store information." };
  }
}

/**
 * Reverts store information to the previous saved version
 */
export async function revertStoreInfoServer(): Promise<{
  success: boolean;
  error?: string;
  storeInfo?: SiteConfig;
}> {
  const currentConfig = await getStoreInfoServer();
  if (!currentConfig.previousConfig) {
    return { success: false, error: "No previous version available to restore." };
  }

  const restored = { ...currentConfig.previousConfig } as SiteConfig;
  delete restored.previousConfig;

  return await saveStoreInfoServer(restored);
}
