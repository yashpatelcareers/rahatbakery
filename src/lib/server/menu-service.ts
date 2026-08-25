import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import type { MenuData, MenuItem } from "@/types";
import { getSupabaseServerClient, isSupabaseConfigured, getSupabaseDiagnostics } from "@/lib/server/supabase";
import defaultMenuData from "@/data/menu.json";

// Path to the central menu data file for local dev fallback
const MENU_FILE_PATH = path.join(process.cwd(), "src", "data", "menu.json");

// Zod validation schemas to ensure data integrity
const MenuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name cannot be empty").trim(),
  price: z.string().min(1, "Price cannot be empty").trim(),
  description: z.string().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().optional(),
  categoryName: z.string().optional(),
});

const MenuCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  subtitle: z.string().default(""),
  items: z.array(MenuItemSchema),
  imageFile: z.string().min(1, "Image banner filename is required"),
  imageAlt: z.string().default(""),
});

const MenuDataSchema = z.object({
  categories: z.array(MenuCategorySchema).min(1, "At least one category is required"),
  deletedItems: z.array(MenuItemSchema).optional(),
});

/**
 * Server-only function to read full menu data including Trash (from Supabase or local fallback)
 */
export async function getAllMenuDataServer(): Promise<MenuData> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("cms_documents")
        .select("data")
        .eq("key", "menu")
        .single();

      if (row?.data) {
        const validated = MenuDataSchema.parse(row.data);
        return {
          categories: validated.categories,
          deletedItems: validated.deletedItems || [],
        };
      }

      if (error && error.code === "PGRST116") {
        // Document does not exist in Supabase — seed it
        console.info("[Menu Service] Seeding initial menu into Supabase...");
        await supabase.from("cms_documents").upsert({
          key: "menu",
          data: defaultMenuData,
          updated_at: new Date().toISOString(),
        });
        return defaultMenuData as MenuData;
      }

      if (error) {
        console.error("[Menu Service] Supabase read error:", error.message);
      }
    } catch (error) {
      console.error("[Menu Service] Error reading from Supabase:", error);
    }
  }

  // Local filesystem fallback (used when Supabase is not configured in local development)
  try {
    const raw = await fs.readFile(MENU_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = MenuDataSchema.parse(parsed);
    return {
      categories: validated.categories,
      deletedItems: validated.deletedItems || [],
    };
  } catch (error) {
    console.error("[Menu Service] Error reading menu data fallback:", error);
    return {
      categories: (defaultMenuData as MenuData).categories,
      deletedItems: [],
    };
  }
}

/**
 * Server-only function to read active menu data (excluding deleted items)
 * Used by public /menu and active CMS views.
 */
export async function getMenuDataServer(): Promise<MenuData> {
  const allData = await getAllMenuDataServer();
  return {
    categories: allData.categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => !item.isDeleted),
    })),
    deletedItems: allData.deletedItems || [],
  };
}

/**
 * Server-only function to read soft-deleted menu items (Trash)
 */
export async function getDeletedMenuItemsServer(): Promise<MenuItem[]> {
  const allData = await getAllMenuDataServer();
  return allData.deletedItems || [];
}

/**
 * Server-only function to atomically save menu data to Supabase (and local fallback)
 */
export async function saveMenuDataServer(
  data: MenuData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate schema before writing
    const validated = MenuDataSchema.parse({
      categories: data.categories,
      deletedItems: data.deletedItems || [],
    });

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: dbError } = await supabase.from("cms_documents").upsert({
        key: "menu",
        data: validated,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("[Menu Service] Supabase save error:", dbError);
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
      const tempPath = `${MENU_FILE_PATH}.tmp`;
      await fs.writeFile(tempPath, jsonString, "utf-8");
      await fs.rename(tempPath, MENU_FILE_PATH);
    } catch {
      // Ignore EROFS in serverless runtime environments
    }

    return { success: true };
  } catch (error) {
    console.error("[Menu Service] Error saving menu data:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((i) => i.message).join(", ") };
    }
    return { success: false, error: "Failed to persist menu changes." };
  }
}

/**
 * Soft-deletes a menu item by moving it to Recently Deleted (Trash)
 */
export async function softDeleteMenuItemServer(
  categoryName: string,
  itemIndex: number
): Promise<{ success: boolean; error?: string; menu?: MenuData }> {
  const allData = await getAllMenuDataServer();
  const cat = allData.categories.find((c) => c.name === categoryName);

  if (!cat || !cat.items[itemIndex]) {
    return { success: false, error: "Menu item or category not found." };
  }

  const [targetItem] = cat.items.splice(itemIndex, 1);
  const deletedItem: MenuItem = {
    ...targetItem,
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    categoryName,
  };

  allData.deletedItems = [deletedItem, ...(allData.deletedItems || [])];

  const saveRes = await saveMenuDataServer(allData);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  return { success: true, menu: allData };
}

/**
 * Restores a soft-deleted menu item back to its original category
 */
export async function restoreMenuItemServer(
  deletedItemIndex: number
): Promise<{ success: boolean; error?: string; menu?: MenuData }> {
  const allData = await getAllMenuDataServer();
  const deletedList = allData.deletedItems || [];

  if (!deletedList[deletedItemIndex]) {
    return { success: false, error: "Deleted item not found in Trash." };
  }

  const [itemToRestore] = deletedList.splice(deletedItemIndex, 1);
  const targetCategoryName = itemToRestore.categoryName || allData.categories[0]?.name;

  let targetCat = allData.categories.find((c) => c.name === targetCategoryName);
  if (!targetCat) {
    targetCat = allData.categories[0];
  }

  const cleanItem: MenuItem = {
    name: itemToRestore.name,
    price: itemToRestore.price,
    description: itemToRestore.description,
  };

  targetCat.items.push(cleanItem);
  allData.deletedItems = deletedList;

  const saveRes = await saveMenuDataServer(allData);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  return { success: true, menu: allData };
}

/**
 * Permanently deletes a menu item from Trash
 */
export async function permanentDeleteMenuItemServer(
  deletedItemIndex: number
): Promise<{ success: boolean; error?: string; menu?: MenuData }> {
  const allData = await getAllMenuDataServer();
  const deletedList = allData.deletedItems || [];

  if (!deletedList[deletedItemIndex]) {
    return { success: false, error: "Deleted item not found in Trash." };
  }

  deletedList.splice(deletedItemIndex, 1);
  allData.deletedItems = deletedList;

  const saveRes = await saveMenuDataServer(allData);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  return { success: true, menu: allData };
}
