import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import type { GalleryMediaItem } from "@/types";
import { getSupabaseServerClient, isSupabaseConfigured, getSupabaseDiagnostics } from "@/lib/server/supabase";
import defaultGalleryData from "@/data/gallery.json";

// Central path to gallery metadata JSON for local dev fallback
const GALLERY_FILE_PATH = path.join(process.cwd(), "src", "data", "gallery.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "images", "gallery", "uploads");

// Zod validation schemas
const GalleryMediaItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: z.enum(["image", "video"]),
  src: z.string().min(1, "Source path or URL is required"),
  alt: z.string().default(""),
  category: z.enum(["bakery", "food", "sweets", "videos"]),
  isFeatured: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().optional(),
});

const GalleryDataSchema = z.array(GalleryMediaItemSchema);

/**
 * Server-only function to read raw all gallery media items (including deleted items)
 */
export async function getAllGalleryDataServer(): Promise<GalleryMediaItem[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("cms_documents")
        .select("data")
        .eq("key", "gallery")
        .single();

      if (row?.data) {
        const validated = GalleryDataSchema.parse(row.data);
        return validated as GalleryMediaItem[];
      }

      if (error && error.code === "PGRST116") {
        // Document does not exist — seed it
        console.info("[Gallery Service] Seeding initial gallery into Supabase...");
        await supabase.from("cms_documents").upsert({
          key: "gallery",
          data: defaultGalleryData,
          updated_at: new Date().toISOString(),
        });
        return defaultGalleryData as GalleryMediaItem[];
      }

      if (error) {
        console.error("[Gallery Service] Supabase read error:", error.message);
      }
    } catch (error) {
      console.error("[Gallery Service] Error reading from Supabase:", error);
    }
  }

  // Local filesystem fallback
  try {
    const raw = await fs.readFile(GALLERY_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = GalleryDataSchema.parse(parsed);
    return validated as GalleryMediaItem[];
  } catch (error) {
    console.error("[Gallery Service] Error reading gallery data fallback:", error);
    return defaultGalleryData as GalleryMediaItem[];
  }
}

/**
 * Server-only function to read active gallery media items (excluding soft-deleted items)
 * Used by public /gallery and default admin views.
 */
export async function getGalleryDataServer(): Promise<GalleryMediaItem[]> {
  const allItems = await getAllGalleryDataServer();
  return allItems.filter((item) => !item.isDeleted);
}

/**
 * Server-only function to read only soft-deleted gallery media items (Trash)
 */
export async function getDeletedGalleryDataServer(): Promise<GalleryMediaItem[]> {
  const allItems = await getAllGalleryDataServer();
  return allItems.filter((item) => Boolean(item.isDeleted));
}

/**
 * Server-only function to atomically save all gallery items to Supabase (and local fallback)
 */
export async function saveGalleryDataServer(
  items: GalleryMediaItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = GalleryDataSchema.parse(items);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: dbError } = await supabase.from("cms_documents").upsert({
        key: "gallery",
        data: validated,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("[Gallery Service] Supabase save error:", dbError);
        const details = dbError.details ? ` (${dbError.details})` : "";
        return { success: false, error: `Supabase database error: ${dbError.message}${details}` };
      }
    } else if (process.env.NODE_ENV === "production" || isSupabaseConfigured()) {
      const diag = getSupabaseDiagnostics();
      return {
        success: false,
        error: `Persistent database error: ${diag.statusMessage}`,
      };
    }

    // Also attempt local filesystem write in dev environments if writeable
    try {
      const jsonString = JSON.stringify(validated, null, 2) + "\n";
      const tempPath = `${GALLERY_FILE_PATH}.tmp`;
      await fs.writeFile(tempPath, jsonString, "utf-8");
      await fs.rename(tempPath, GALLERY_FILE_PATH);
    } catch {
      // Ignore EROFS in serverless runtime environments
    }

    return { success: true };
  } catch (error) {
    console.error("[Gallery Service] Error saving gallery data:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to persist gallery changes." };
  }
}

/**
 * Soft deletes a gallery item (moves to Recently Deleted / Trash)
 * Media file and metadata are preserved completely.
 */
export async function softDeleteGalleryItemServer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const allItems = await getAllGalleryDataServer();
  const index = allItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return { success: false, error: "Gallery item not found." };
  }

  allItems[index] = {
    ...allItems[index],
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  };

  return await saveGalleryDataServer(allItems);
}

/**
 * Restores a soft-deleted gallery item back to active status
 */
export async function restoreGalleryItemServer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const allItems = await getAllGalleryDataServer();
  const index = allItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return { success: false, error: "Gallery item not found." };
  }

  const restored = { ...allItems[index] };
  delete restored.isDeleted;
  delete restored.deletedAt;

  allItems[index] = restored;

  return await saveGalleryDataServer(allItems);
}

/**
 * Permanently deletes a gallery item and purges the underlying file from Supabase Storage / disk
 */
export async function permanentDeleteGalleryItemServer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const allItems = await getAllGalleryDataServer();
  const targetItem = allItems.find((item) => item.id === id);

  if (!targetItem) {
    return { success: false, error: "Gallery item not found." };
  }

  // 1. Purge file from Supabase Storage or local uploads directory
  await deleteUploadedGalleryFile(targetItem.src);

  // 2. Remove record from list
  const remainingItems = allItems.filter((item) => item.id !== id);

  return await saveGalleryDataServer(remainingItems);
}

/**
 * Server-only function to save an uploaded file buffer to Supabase Storage (with local fallback).
 */
export async function saveUploadedGalleryFile(
  file: File
): Promise<{ success: boolean; src?: string; error?: string }> {
  try {
    // Validate file size (max 8MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: "File size exceeds 8MB limit. Please upload an image under 8MB.",
      };
    }

    // Determine extension and validate type
    const mimeType = file.type || "image/jpeg";
    let ext = ".jpg";
    if (mimeType === "image/png") ext = ".png";
    else if (mimeType === "image/webp") ext = ".webp";
    else if (mimeType === "image/jpeg" || mimeType === "image/jpg") ext = ".jpg";
    else if (mimeType === "image/gif") ext = ".gif";
    else if (mimeType === "video/mp4") ext = ".mp4";
    else {
      const originalExt = path.extname(file.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4"].includes(originalExt)) {
        ext = originalExt;
      } else {
        return {
          success: false,
          error: "Invalid file type. Supported formats: PNG, JPG, WEBP, GIF, MP4.",
        };
      }
    }

    const cleanOriginalName = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .substring(0, 30);
    const timestamp = Date.now();
    const filename = `${cleanOriginalName}_${timestamp}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Supabase is configured, upload to Supabase Storage bucket 'gallery'
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const storagePath = `uploads/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return {
            success: true,
            src: publicUrlData.publicUrl,
          };
        }
      } else {
        console.error("[Gallery Service] Supabase Storage upload error:", uploadError.message);
        if (process.env.NODE_ENV === "production") {
          return {
            success: false,
            error: `Supabase Storage upload error: ${uploadError.message}`,
          };
        }
      }
    } else if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Persistent storage error: Supabase Storage is not connected. Please verify environment variables.",
      };
    }

    // 2. Local filesystem write fallback for local development
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      const targetFilePath = path.join(UPLOADS_DIR, filename);
      await fs.writeFile(targetFilePath, buffer);

      return {
        success: true,
        src: `/images/gallery/uploads/${filename}`,
      };
    } catch (fsError: unknown) {
      const isReadOnly =
        fsError &&
        typeof fsError === "object" &&
        "code" in fsError &&
        (fsError.code === "EROFS" || fsError.code === "EACCES");

      if (isReadOnly) {
        console.warn("[Gallery Service] Read-only filesystem detected. Using Data URI fallback.");
        const base64Data = buffer.toString("base64");
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        return {
          success: true,
          src: dataUri,
        };
      }

      throw fsError;
    }
  } catch (error) {
    console.error("[Gallery Service] Error processing uploaded file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process uploaded file.",
    };
  }
}

/**
 * Server-only function to clean up deleted uploaded files
 */
export async function deleteUploadedGalleryFile(src: string): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase && src.includes("/storage/v1/object/public/gallery/")) {
      const parts = src.split("/storage/v1/object/public/gallery/");
      if (parts[1]) {
        await supabase.storage.from("gallery").remove([parts[1]]);
      }
      return;
    }

    if (src.startsWith("/images/gallery/uploads/")) {
      const filename = path.basename(src);
      const filePath = path.join(UPLOADS_DIR, filename);
      await fs.unlink(filePath).catch(() => {});
    }
  } catch {
    // Ignore cleanup errors
  }
}
