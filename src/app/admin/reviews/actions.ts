"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/admin-auth";
import {
  saveReviewsConfigServer,
  syncGoogleReviewsServer,
  getReviewsConfigServer,
  type ReviewsConfig,
} from "@/lib/server/reviews-service";

interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  config?: ReviewsConfig;
  source?: "live" | "curated";
}

/**
 * Helper to ensure the caller has an authenticated admin session
 */
async function requireAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return session.isAuthenticated;
}

/**
 * Server Action: Save reviews configuration (mode, curated rating, curated reviews)
 */
export async function updateReviewsConfigAction(config: ReviewsConfig): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to update review settings." };
  }

  const result = await saveReviewsConfigServer(config);
  if (!result.success) {
    return { success: false, error: result.error || "Failed to update review settings." };
  }

  const updatedConfig = await getReviewsConfigServer();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");

  return { success: true, message: "Review settings updated successfully.", config: updatedConfig };
}

/**
 * Server Action: Manually sync reviews from Google Places API
 */
export async function syncReviewsAction(): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to sync reviews." };
  }

  const result = await syncGoogleReviewsServer();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");

  return {
    success: result.success,
    message: result.message,
    source: result.source,
    config: result.config,
  };
}
