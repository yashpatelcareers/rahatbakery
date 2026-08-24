import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/admin-auth";
import {
  getGalleryDataServer,
  saveGalleryDataServer,
  saveUploadedGalleryFile,
} from "@/lib/server/gallery-service";
import type { GalleryMediaItem } from "@/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/gallery/upload
 * Handles multipart file uploads and URL-based gallery items
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const session = await getAdminSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to upload media." },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
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

    // 3. Process File Upload or URL
    if (file && file.size > 0) {
      const uploadResult = await saveUploadedGalleryFile(file);
      if (!uploadResult.success || !uploadResult.src) {
        return NextResponse.json(
          { success: false, error: uploadResult.error || "Failed to save uploaded file." },
          { status: 400 }
        );
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
      return NextResponse.json(
        { success: false, error: "Please select an image file or provide an image URL." },
        { status: 400 }
      );
    }

    // 4. Update Gallery JSON Data
    const currentItems = await getGalleryDataServer();
    const newItemId = `${category}-${Date.now()}`;
    const newItem: GalleryMediaItem = {
      id: newItemId,
      type: mediaType,
      src: finalSrc,
      alt: altInput,
      category,
      ...(isFeatured ? { isFeatured: true } : {}),
    };

    const updatedItems = [newItem, ...currentItems];
    const saveResult = await saveGalleryDataServer(updatedItems);

    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: saveResult.error || "Failed to persist gallery changes." },
        { status: 500 }
      );
    }

    // 5. Instant Cache Revalidation for Public & Admin Routes
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      updatedItems,
      newItem,
    });
  } catch (error) {
    console.error("[Gallery Upload API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected server error occurred during upload.",
      },
      { status: 500 }
    );
  }
}
