"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/admin-auth";
import {
  saveStoreInfoServer,
  getStoreInfoServer,
  revertStoreInfoServer,
} from "@/lib/server/store-service";
import type { SiteConfig } from "@/types";

interface ActionResponse {
  success: boolean;
  error?: string;
  updatedConfig?: SiteConfig;
  message?: string;
}

/**
 * Helper to ensure the caller has an authenticated admin session
 */
async function requireAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return session.isAuthenticated;
}

/**
 * Server Action: Update store business information, hours, contact, and social links
 */
export async function updateStoreInfoAction(data: SiteConfig): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to update store information." };
  }

  const saveResult = await saveStoreInfoServer(data);

  if (!saveResult.success) {
    return { success: false, error: saveResult.error || "Failed to update store information." };
  }

  const updatedConfig = await getStoreInfoServer();

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/menu");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/info");

  return { success: true, updatedConfig, message: "Store information saved successfully." };
}

/**
 * Server Action: Revert store information to previous saved version
 */
export async function revertStoreInfoAction(): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to update store information." };
  }

  const revertResult = await revertStoreInfoServer();
  if (!revertResult.success) {
    return { success: false, error: revertResult.error || "Failed to revert store information." };
  }

  const updatedConfig = await getStoreInfoServer();

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/menu");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/info");

  return { success: true, updatedConfig, message: "Reverted to previous store information." };
}
