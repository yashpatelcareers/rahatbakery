"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  authenticateAdminUser,
} from "@/lib/server/admin-auth";

/**
 * Server Action: Validates login credentials and sets secure HTTP-only session cookie
 */
export async function loginAdminAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const usernameInput = (formData.get("username") as string)?.trim();
  const passwordInput = (formData.get("password") as string)?.trim();

  if (!usernameInput || !passwordInput) {
    return { error: "Please enter both username and password." };
  }

  const authResult = await authenticateAdminUser(usernameInput, passwordInput);

  if (!authResult.success || !authResult.user) {
    return { error: authResult.error || "Invalid username or password. Please check your credentials." };
  }

  const token = createSessionToken({
    id: authResult.user.id,
    username: authResult.user.username,
    role: authResult.user.role,
  });

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

/**
 * Server Action: Clears the admin session cookie and redirects to login
 */
export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
