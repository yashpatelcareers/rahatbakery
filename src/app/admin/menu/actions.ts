"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/server/admin-auth";
import {
  getAllMenuDataServer,
  saveMenuDataServer,
  softDeleteMenuItemServer,
  restoreMenuItemServer,
  permanentDeleteMenuItemServer,
} from "@/lib/server/menu-service";
import type { MenuData, MenuItem } from "@/types";

interface ActionResponse {
  success: boolean;
  error?: string;
  updatedMenu?: MenuData;
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
 * Server Action: Update an existing menu item's name and price
 */
export async function updateMenuItemAction(
  categoryName: string,
  itemIndex: number,
  itemData: { name: string; price: string }
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const name = itemData.name?.trim();
  let price = itemData.price?.trim();

  if (!name) {
    return { success: false, error: "Item name cannot be empty." };
  }
  if (!price) {
    return { success: false, error: "Price cannot be empty." };
  }

  // Format price with leading dollar sign if missing
  if (!price.startsWith("$")) {
    price = `$${price}`;
  }

  const allMenu = await getAllMenuDataServer();
  const catIndex = allMenu.categories.findIndex(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (catIndex === -1) {
    return { success: false, error: `Category "${categoryName}" not found.` };
  }

  if (itemIndex < 0 || itemIndex >= allMenu.categories[catIndex].items.length) {
    return { success: false, error: "Invalid item index." };
  }

  // Update item
  allMenu.categories[catIndex].items[itemIndex] = {
    ...allMenu.categories[catIndex].items[itemIndex],
    name,
    price,
  };

  const saveResult = await saveMenuDataServer(allMenu);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  // Revalidate public storefront cache instantly
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return { success: true, updatedMenu: allMenu, message: "Menu item updated." };
}

/**
 * Server Action: Add a new menu item to a category
 */
export async function addMenuItemAction(
  categoryName: string,
  newItem: { name: string; price: string }
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const name = newItem.name?.trim();
  let price = newItem.price?.trim();

  if (!name) {
    return { success: false, error: "Item name cannot be empty." };
  }
  if (!price) {
    return { success: false, error: "Price cannot be empty." };
  }

  if (!price.startsWith("$")) {
    price = `$${price}`;
  }

  const allMenu = await getAllMenuDataServer();
  const catIndex = allMenu.categories.findIndex(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (catIndex === -1) {
    return { success: false, error: `Category "${categoryName}" not found.` };
  }

  const itemToInsert: MenuItem = { name, price };
  allMenu.categories[catIndex].items.push(itemToInsert);

  const saveResult = await saveMenuDataServer(allMenu);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return { success: true, updatedMenu: allMenu, message: `Added "${name}" to ${categoryName}.` };
}

/**
 * Server Action: Soft-delete a menu item (moves to Recently Deleted / Trash)
 */
export async function softDeleteMenuItemAction(
  categoryName: string,
  itemIndex: number
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const result = await softDeleteMenuItemServer(categoryName, itemIndex);
  if (!result.success || !result.menu) {
    return { success: false, error: result.error || "Failed to remove item." };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return {
    success: true,
    updatedMenu: result.menu,
    message: "Moved to Recently Deleted.",
  };
}

/**
 * Backward-compatibility alias for softDeleteMenuItemAction
 */
export async function deleteMenuItemAction(
  categoryName: string,
  itemIndex: number
): Promise<ActionResponse> {
  return softDeleteMenuItemAction(categoryName, itemIndex);
}

/**
 * Server Action: Restore a deleted menu item from Trash
 */
export async function restoreMenuItemAction(
  deletedItemIndex: number
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const result = await restoreMenuItemServer(deletedItemIndex);
  if (!result.success || !result.menu) {
    return { success: false, error: result.error || "Failed to restore item." };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return {
    success: true,
    updatedMenu: result.menu,
    message: "Menu item restored.",
  };
}

/**
 * Server Action: Permanently delete a menu item from Trash
 */
export async function permanentDeleteMenuItemAction(
  deletedItemIndex: number
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const result = await permanentDeleteMenuItemServer(deletedItemIndex);
  if (!result.success || !result.menu) {
    return { success: false, error: result.error || "Failed to permanently delete item." };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return {
    success: true,
    updatedMenu: result.menu,
    message: "Item permanently deleted. This action cannot be undone.",
  };
}

/**
 * Server Action: Update category subtitle / uniform pricing note
 */
export async function updateCategorySubtitleAction(
  categoryName: string,
  subtitle: string
): Promise<ActionResponse> {
  if (!(await requireAuth())) {
    return { success: false, error: "Unauthorized. Please sign in to make changes." };
  }

  const allMenu = await getAllMenuDataServer();
  const catIndex = allMenu.categories.findIndex(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (catIndex === -1) {
    return { success: false, error: `Category "${categoryName}" not found.` };
  }

  allMenu.categories[catIndex].subtitle = subtitle.trim();

  const saveResult = await saveMenuDataServer(allMenu);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");

  return { success: true, updatedMenu: allMenu, message: "Category note updated." };
}
