"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminSession,
  changeOwnPasswordServer,
  createAdminUserServer,
  resetAdminPasswordServer,
  toggleUserStatusServer,
  deleteAdminUserServer,
  ADMIN_COOKIE_NAME,
} from "@/lib/server/admin-auth";
import type { AdminRole, AdminUserStatus, AdminUser } from "@/types";

interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: AdminUser;
}

/**
 * Server Action: Change own password
 */
export async function changeAdminPasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResponse> {
  const session = await getAdminSession();
  if (!session.isAuthenticated || !session.username) {
    return { success: false, error: "Unauthorized. Please sign in to update settings." };
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Please fill in all password fields." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation do not match." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  if (currentPassword === newPassword) {
    return { success: false, error: "New password must be different from the current password." };
  }

  const result = await changeOwnPasswordServer(session.username, currentPassword, newPassword);
  if (!result.success) {
    return { success: false, error: result.error || "Failed to update password." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");

  return { success: true, message: "Your password was updated successfully." };
}

/**
 * Server Action: Create a new admin user (Super Admin / Developer only)
 */
export async function createAdminUserAction(data: {
  username: string;
  name: string;
  role: AdminRole;
  password: string;
}): Promise<ActionResponse> {
  const session = await getAdminSession();
  if (!session.isAuthenticated || session.role !== "superadmin" || !session.username) {
    return { success: false, error: "Unauthorized: Developer / Super Admin permission required." };
  }

  const result = await createAdminUserServer(session.role, data, session.username);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/settings");

  return {
    success: true,
    message: `Account "${data.username}" (${data.role}) created successfully.`,
    user: result.user,
  };
}

/**
 * Server Action: Reset an administrator's password (Super Admin / Developer only)
 */
export async function resetUserPasswordAction(
  targetUserId: string,
  newPassword: string
): Promise<ActionResponse> {
  const session = await getAdminSession();
  if (!session.isAuthenticated || session.role !== "superadmin" || !session.username) {
    return { success: false, error: "Unauthorized: Developer / Super Admin permission required." };
  }

  const result = await resetAdminPasswordServer(
    session.role,
    targetUserId,
    newPassword,
    session.username
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/settings");

  return { success: true, message: "User password reset successfully." };
}

/**
 * Server Action: Enable/Disable an admin account (Super Admin / Developer only)
 */
export async function toggleUserStatusAction(
  targetUserId: string,
  newStatus: AdminUserStatus
): Promise<ActionResponse> {
  const session = await getAdminSession();
  if (!session.isAuthenticated || session.role !== "superadmin" || !session.username || !session.userId) {
    return { success: false, error: "Unauthorized: Developer / Super Admin permission required." };
  }

  const result = await toggleUserStatusServer(
    session.role,
    targetUserId,
    session.userId,
    newStatus,
    session.username
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/settings");

  return {
    success: true,
    message: `User status changed to ${newStatus}.`,
  };
}

/**
 * Server Action: Delete an admin account (Super Admin / Developer only)
 */
export async function deleteUserAction(targetUserId: string): Promise<ActionResponse> {
  const session = await getAdminSession();
  if (!session.isAuthenticated || session.role !== "superadmin" || !session.username || !session.userId) {
    return { success: false, error: "Unauthorized: Developer / Super Admin permission required." };
  }

  const result = await deleteAdminUserServer(
    session.role,
    targetUserId,
    session.userId,
    session.username
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/settings");

  return { success: true, message: "Account removed successfully." };
}

/**
 * Server Action: Invalidate active session and sign out
 */
export async function invalidateSessionAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
