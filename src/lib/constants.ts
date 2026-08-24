import type { SiteConfig } from "@/types";
import storeInfoData from "@/data/store-info.json";

/**
 * Single source of truth for business information, hours, contact, and social links.
 * Backed by src/data/store-info.json and managed through the /admin/info CMS.
 */
export const SITE_CONFIG: SiteConfig = storeInfoData as unknown as SiteConfig;
