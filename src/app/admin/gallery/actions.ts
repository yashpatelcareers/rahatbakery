"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/admin-auth";
import {
  getAllGalleryDataServer,
  getGalleryDataServer,
  getDeletedGalleryDataServer,
  saveGalleryDataServer,
  softDeleteGalleryItemServer,
  restoreGalleryItemServer,
  permanentDeleteGalleryItemServer,
  saveUploadedGalleryFile,
  deleteUploadedGalleryFile,
} from "@/lib/server/gallery-service";
import type { GalleryMediaItem } from "@/types";

interface ActionResponse {
  success: boolean;
  error?: string;
  updatedItems?: GalleryMediaItem[];
  deletedItems?: GalleryMediaItem[];
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
 * Server Action: Add a new gallery image or video (via file upload or URL)
 */
export async function addGalleryItemAction(formData: FormData): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to manage gallery media." };
  }

  const categoryInput = (formData.get("category") as string)?.trim() || "bakery";
  const altInput = (formData.get("alt") as string)?.trim() || "Rahat Bakery showcase";
  const isFeatured = formData.get("isFeatured") === "true";
  const urlInput = (formData.get("srcUrl") as string)?.trim();
  const file = formData.get("file") as File | null;

  const validCategories = ["bakery", "food", "sweets", "videos"] as const;
  const category = validCategories.includes(categoryInput as (typeof validCategories)[number])
    ? (categoryInput as (typeof validCategories)[number])
    : "bakery";

  let finalSrc = "";
  let mediaType: "image" | "video" = category === "videos" ? "video" : "image";

  if (file && file.size > 0) {
    const uploadResult = await saveUploadedGalleryFile(file);
    if (!uploadResult.success || !uploadResult.src) {
      return { success: false, error: uploadResult.error || "Failed to upload file." };
    }
    finalSrc = uploadResult.src;
    if (file.type.startsWith("video/") || finalSrc.endsWith(".mp4")) {
      mediaType = "video";
    }
  } else if (urlInput) {
    finalSrc = urlInput;
    if (urlInput.endsWith(".mp4") || category === "videos") {
      mediaType = "video";
    }
  } else {
    return { success: false, error: "Please select an image file or provide an image URL." };
  }

  const allItems = await getAllGalleryDataServer();

  const newItemId = `${category}-${Date.now()}`;
  const newItem: GalleryMediaItem = {
    id: newItemId,
    type: mediaType,
    src: finalSrc,
    alt: altInput,
    category,
    ...(isFeatured ? { isFeatured: true } : {}),
  };

  // Prepend new item to active items
  const updatedAllItems = [newItem, ...allItems];

  const saveResult = await saveGalleryDataServer(updatedAllItems);
  if (!saveResult.success) {
    // If saving metadata fails, clean up the uploaded file
    if (finalSrc.startsWith("http") || finalSrc.startsWith("/images/gallery/uploads/")) {
      await deleteUploadedGalleryFile(finalSrc);
    }
    return { success: false, error: saveResult.error };
  }

  // Revalidate public gallery and admin routes
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");

  const activeItems = await getGalleryDataServer();
  const deletedItems = await getDeletedGalleryDataServer();

  return {
    success: true,
    updatedItems: activeItems,
    deletedItems,
    message: "Media item published to gallery.",
  };
}

/**
 * Server Action: Soft delete a gallery item (moves to Recently Deleted / Trash)
 * Media file and metadata are preserved.
 */
export async function softDeleteGalleryItemAction(id: string): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to manage gallery media." };
  }

  const result = await softDeleteGalleryItemServer(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");

  const activeItems = await getGalleryDataServer();
  const deletedItems = await getDeletedGalleryDataServer();

  return {
    success: true,
    updatedItems: activeItems,
    deletedItems,
    message: "Moved to Recently Deleted.",
  };
}

/**
 * Backward compatibility alias for softDeleteGalleryItemAction
 */
export async function deleteGalleryItemAction(id: string): Promise<ActionResponse> {
  return softDeleteGalleryItemAction(id);
}

/**
 * Server Action: Restore a soft-deleted gallery item back to active status
 */
export async function restoreGalleryItemAction(id: string): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to manage gallery media." };
  }

  const result = await restoreGalleryItemServer(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");

  const activeItems = await getGalleryDataServer();
  const deletedItems = await getDeletedGalleryDataServer();

  return {
    success: true,
    updatedItems: activeItems,
    deletedItems,
    message: "Gallery item restored.",
  };
}

/**
 * Server Action: Permanently delete a gallery item and purge its file from storage
 */
export async function permanentDeleteGalleryItemAction(id: string): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to manage gallery media." };
  }

  const result = await permanentDeleteGalleryItemServer(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");

  const activeItems = await getGalleryDataServer();
  const deletedItems = await getDeletedGalleryDataServer();

  return {
    success: true,
    updatedItems: activeItems,
    deletedItems,
    message: "Item permanently deleted. This action cannot be undone.",
  };
}
