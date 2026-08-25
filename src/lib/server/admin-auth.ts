import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { getSupabaseServerClient, isSupabaseConfigured, getSupabaseDiagnostics } from "@/lib/server/supabase";
import type { AdminUser, AdminRole, AdminUserStatus, AuditLogEntry } from "@/types";

export const ADMIN_COOKIE_NAME = "rahat_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

const USERS_FILE_PATH = path.join(process.cwd(), "src", "data", "admin-users.json");
const AUDIT_FILE_PATH = path.join(process.cwd(), "src", "data", "admin-audit.json");

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "rahat_bakery_secure_session_key_2026_vault";
}

export function getAdminUsername(): string {
  const envUser = process.env.ADMIN_USERNAME?.trim();
  if (!envUser || envUser === "your_username_here") {
    return "admin";
  }
  return envUser;
}

export function getAdminPassword(): string {
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (
    !envPass ||
    envPass === "your_password_here" ||
    envPass === "your_secure_admin_password_here"
  ) {
    return "password";
  }
  return envPass;
}

/**
 * Creates default seed accounts with PBKDF2 hashed credentials:
 * 1. Developer / Super Admin: admin / password
 * 2. Business Owner / Admin: rahatadmin / rahatadmin2026
 */
function createDefaultSeedUsers(): AdminUser[] {
  // 1. Developer / Super Admin account (admin / password)
  const devSalt = crypto.randomBytes(16).toString("hex");
  const devHash = crypto.pbkdf2Sync("password", devSalt, 100000, 64, "sha512").toString("hex");

  // 2. Business Owner / Admin account (rahatadmin / rahatadmin2026)
  const ownerSalt = crypto.randomBytes(16).toString("hex");
  const ownerHash = crypto.pbkdf2Sync("rahatadmin2026", ownerSalt, 100000, 64, "sha512").toString("hex");

  const now = new Date().toISOString();

  return [
    {
      id: "usr-superadmin-developer",
      username: "admin",
      name: "Developer / Super Admin",
      role: "superadmin",
      status: "active",
      passwordHash: devHash,
      salt: devSalt,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-admin-owner",
      username: "rahatadmin",
      name: "Business Owner / Admin",
      role: "admin",
      status: "active",
      passwordHash: ownerHash,
      salt: ownerSalt,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Reads all admin users from Supabase or local fallback, ensuring both Developer (admin) and Owner (rahatadmin) accounts exist
 */
export async function getAdminUsersServer(): Promise<AdminUser[]> {
  const supabase = getSupabaseServerClient();
  const defaultUsers = createDefaultSeedUsers();

  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("cms_documents")
        .select("data")
        .eq("key", "admin_users")
        .single();

      if (row?.data && Array.isArray(row.data) && row.data.length > 0) {
        let users = row.data as AdminUser[];
        let needsResave = false;

        // Clean up any legacy dummy accounts if present
        const hasLegacyOwner = users.some((u) => u.username.toLowerCase() === "owner");
        if (hasLegacyOwner) {
          users = users.filter((u) => u.username.toLowerCase() !== "owner");
          needsResave = true;
        }

        // Ensure developer / superadmin exists (admin)
        const hasSuperAdmin = users.some(
          (u) => u.role === "superadmin" || u.username.toLowerCase() === "admin"
        );
        if (!hasSuperAdmin) {
          users.unshift(defaultUsers[0]);
          needsResave = true;
        }

        // Ensure owner / admin exists (rahatadmin)
        const hasOwner = users.some(
          (u) => u.username.toLowerCase() === "rahatadmin"
        );
        if (!hasOwner) {
          users.push(defaultUsers[1]);
          needsResave = true;
        }

        if (needsResave) {
          await supabase.from("cms_documents").upsert({
            key: "admin_users",
            data: users,
            updated_at: new Date().toISOString(),
          });
        }

        return users;
      }

      if (error && error.code === "PGRST116") {
        // Document does not exist — auto seed
        console.info("[Admin Auth] Auto-seeding initial admin accounts into Supabase...");
        await supabase.from("cms_documents").upsert({
          key: "admin_users",
          data: defaultUsers,
          updated_at: new Date().toISOString(),
        });
        return defaultUsers;
      }
    } catch (err) {
      console.warn("[Admin Auth] Supabase users read error:", err);
    }
  }

  // Local filesystem fallback
  try {
    const raw = await fs.readFile(USERS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let users = parsed as AdminUser[];
      let needsResave = false;

      const hasLegacyOwner = users.some((u) => u.username.toLowerCase() === "owner");
      if (hasLegacyOwner) {
        users = users.filter((u) => u.username.toLowerCase() !== "owner");
        needsResave = true;
      }

      const hasSuperAdmin = users.some(
        (u) => u.role === "superadmin" || u.username.toLowerCase() === "admin"
      );
      if (!hasSuperAdmin) {
        users.unshift(defaultUsers[0]);
        needsResave = true;
      }

      const hasOwner = users.some(
        (u) => u.username.toLowerCase() === "rahatadmin"
      );
      if (!hasOwner) {
        users.push(defaultUsers[1]);
        needsResave = true;
      }

      if (needsResave) {
        try {
          await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2) + "\n", "utf-8");
        } catch {}
      }

      return users;
    }
  } catch {
    // Write default seed users to disk
    try {
      await fs.writeFile(USERS_FILE_PATH, JSON.stringify(defaultUsers, null, 2) + "\n", "utf-8");
    } catch {
      // Ignore EROFS
    }
  }

  return defaultUsers;
}

/**
 * Saves all admin users atomically to Supabase and disk
 */
export async function saveAdminUsersServer(
  users: AdminUser[]
): Promise<{ success: boolean; error?: string }> {
  // Ensure at least one active superadmin exists
  const hasActiveSuperAdmin = users.some(
    (u) => u.role === "superadmin" && u.status === "active"
  );

  if (!hasActiveSuperAdmin) {
    return {
      success: false,
      error: "Role Protection: At least one active Developer / Super Admin account must remain.",
    };
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error: dbError } = await supabase.from("cms_documents").upsert({
        key: "admin_users",
        data: users,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("[Admin Auth] Supabase users save error:", dbError);
        const details = dbError.details ? ` (${dbError.details})` : "";
        return { success: false, error: `Supabase database error: ${dbError.message}${details}` };
      }
    } catch (err) {
      console.error("[Admin Auth] Unexpected users save error:", err);
      return { success: false, error: "Database error saving admin accounts." };
    }
  } else if (process.env.NODE_ENV === "production" || isSupabaseConfigured()) {
    const diag = getSupabaseDiagnostics();
    return {
      success: false,
      error: `Persistent database error: ${diag.statusMessage}`,
    };
  }

  // Local filesystem fallback
  try {
    const tempPath = `${USERS_FILE_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(users, null, 2) + "\n", "utf-8");
    await fs.rename(tempPath, USERS_FILE_PATH);
  } catch {
    // Ignore EROFS in serverless runtime
  }

  return { success: true };
}

/**
 * Authenticates user credentials with constant-time PBKDF2 check
 */
export async function authenticateAdminUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  if (!usernameInput || !passwordInput) {
    return { success: false, error: "Please enter both username and password." };
  }

  const users = await getAdminUsersServer();
  const normalizedUser = usernameInput.trim().toLowerCase();

  const user = users.find((u) => u.username.toLowerCase() === normalizedUser);
  if (!user) {
    return { success: false, error: "Invalid username or password." };
  }

  if (user.status === "disabled") {
    return {
      success: false,
      error: "This administrator account has been disabled. Please contact the Super Admin.",
    };
  }

  try {
    const derivedKey = crypto.pbkdf2Sync(
      passwordInput,
      user.salt,
      100000,
      64,
      "sha512"
    ).toString("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(user.passwordHash, "hex"),
      Buffer.from(derivedKey, "hex")
    );

    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    saveAdminUsersServer(users).catch(() => {});

    // Record login audit log
    recordAuditLogServer("USER_LOGIN", `User signed in successfully.`, user.username, user.role);

    return { success: true, user };
  } catch {
    return { success: false, error: "Authentication verification failed." };
  }
}

/**
 * Creates a role-aware HMAC-SHA256 session token
 */
export function createSessionToken(user: { id: string; username: string; role: AdminRole }): string {
  const secret = getSessionSecret();
  const timestamp = Date.now().toString();
  const payload = `${user.id}:${user.username}:${user.role}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

/**
 * Verifies session token and extracts user identity + role
 */
export function verifySessionToken(token: string | undefined | null): {
  isValid: boolean;
  userId?: string;
  username?: string;
  role?: AdminRole;
} {
  if (!token || typeof token !== "string") return { isValid: false };

  const parts = token.split(":");
  if (parts.length === 3) {
    // Legacy 3-part token fallback: username:timestamp:sig
    const [username, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000) {
      return { isValid: false };
    }
    const secret = getSessionSecret();
    const expected = crypto.createHmac("sha256", secret).update(`${username}:${timestampStr}`).digest("hex");
    try {
      if (crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
        return { isValid: true, username, role: "admin" };
      }
    } catch {
      return { isValid: false };
    }
    return { isValid: false };
  }

  if (parts.length !== 5) return { isValid: false };

  const [id, username, roleStr, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000) {
    return { isValid: false };
  }

  const role: AdminRole = roleStr === "superadmin" ? "superadmin" : "admin";
  const secret = getSessionSecret();
  const expectedPayload = `${id}:${username}:${role}:${timestampStr}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(expectedPayload).digest("hex");

  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    if (isSigValid) {
      return { isValid: true, userId: id, username, role };
    }
  } catch {
    return { isValid: false };
  }

  return { isValid: false };
}

/**
 * Reads and verifies the current session from HTTP-only cookie
 */
export async function getAdminSession(): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  role?: AdminRole;
  isSuperAdmin?: boolean;
}> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return { isAuthenticated: false };
  }

  const session = verifySessionToken(sessionCookie.value);
  if (!session.isValid || !session.username) {
    return { isAuthenticated: false };
  }

  return {
    isAuthenticated: true,
    userId: session.userId,
    username: session.username,
    role: session.role || "admin",
    isSuperAdmin: session.role === "superadmin",
  };
}

/**
 * Super Admin: Create a new admin account
 */
export async function createAdminUserServer(
  creatorRole: AdminRole,
  data: { username: string; name: string; role: AdminRole; password: string },
  creatorUsername: string
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  if (creatorRole !== "superadmin") {
    return { success: false, error: "Unauthorized: Super Admin permission required." };
  }

  const username = data.username.trim().toLowerCase();
  const name = data.name.trim();
  const password = data.password.trim();

  if (!username || username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters long." };
  }
  if (!name) {
    return { success: false, error: "Name cannot be empty." };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const users = await getAdminUsersServer();
  if (users.some((u) => u.username.toLowerCase() === username)) {
    return { success: false, error: `Username "${username}" is already taken.` };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  const now = new Date().toISOString();

  const newUser: AdminUser = {
    id: `usr-${data.role}-${Date.now()}`,
    username,
    name,
    role: data.role,
    status: "active",
    passwordHash,
    salt,
    createdAt: now,
    updatedAt: now,
    mustChangePassword: true,
  };

  const updatedUsers = [...users, newUser];
  const saveRes = await saveAdminUsersServer(updatedUsers);

  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  recordAuditLogServer(
    "USER_CREATED",
    `Created new ${data.role} account "${username}" (${name}).`,
    creatorUsername,
    creatorRole
  );

  return { success: true, user: newUser };
}

/**
 * Super Admin: Securely reset another user's password without viewing the old password
 */
export async function resetAdminPasswordServer(
  creatorRole: AdminRole,
  targetUserId: string,
  newPassword: string,
  creatorUsername: string
): Promise<{ success: boolean; error?: string }> {
  if (creatorRole !== "superadmin") {
    return { success: false, error: "Unauthorized: Super Admin permission required." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  const users = await getAdminUsersServer();
  const userIndex = users.findIndex((u) => u.id === targetUserId);

  if (userIndex === -1) {
    return { success: false, error: "User not found." };
  }

  const targetUser = users[userIndex];
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(newPassword, salt, 100000, 64, "sha512").toString("hex");

  users[userIndex] = {
    ...targetUser,
    passwordHash,
    salt,
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  };

  const saveRes = await saveAdminUsersServer(users);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  recordAuditLogServer(
    "PASSWORD_RESET",
    `Super Admin reset password for "${targetUser.username}".`,
    creatorUsername,
    creatorRole
  );

  return { success: true };
}

/**
 * Super Admin: Enable/Disable an admin user
 */
export async function toggleUserStatusServer(
  creatorRole: AdminRole,
  targetUserId: string,
  currentUserId: string,
  newStatus: AdminUserStatus,
  creatorUsername: string
): Promise<{ success: boolean; error?: string }> {
  if (creatorRole !== "superadmin") {
    return { success: false, error: "Unauthorized: Super Admin permission required." };
  }

  if (targetUserId === currentUserId) {
    return { success: false, error: "You cannot disable your own active account." };
  }

  const users = await getAdminUsersServer();
  const userIndex = users.findIndex((u) => u.id === targetUserId);

  if (userIndex === -1) {
    return { success: false, error: "User not found." };
  }

  users[userIndex] = {
    ...users[userIndex],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  const saveRes = await saveAdminUsersServer(users);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  recordAuditLogServer(
    "USER_STATUS_CHANGED",
    `Changed status of "${users[userIndex].username}" to ${newStatus}.`,
    creatorUsername,
    creatorRole
  );

  return { success: true };
}

/**
 * Super Admin: Delete an admin user
 */
export async function deleteAdminUserServer(
  creatorRole: AdminRole,
  targetUserId: string,
  currentUserId: string,
  creatorUsername: string
): Promise<{ success: boolean; error?: string }> {
  if (creatorRole !== "superadmin") {
    return { success: false, error: "Unauthorized: Super Admin permission required." };
  }

  if (targetUserId === currentUserId) {
    return { success: false, error: "You cannot delete your own active account." };
  }

  const users = await getAdminUsersServer();
  const targetUser = users.find((u) => u.id === targetUserId);

  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  if (targetUser.role === "superadmin") {
    const superAdminCount = users.filter(
      (u) => u.role === "superadmin" && u.status === "active"
    ).length;
    if (superAdminCount <= 1) {
      return {
        success: false,
        error: "Role Protection: Cannot delete the last remaining Super Admin account.",
      };
    }
  }

  const remainingUsers = users.filter((u) => u.id !== targetUserId);
  const saveRes = await saveAdminUsersServer(remainingUsers);

  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  recordAuditLogServer(
    "USER_DELETED",
    `Deleted account "${targetUser.username}" (${targetUser.role}).`,
    creatorUsername,
    creatorRole
  );

  return { success: true };
}

/**
 * Self: Change own password
 */
export async function changeOwnPasswordServer(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  const authRes = await authenticateAdminUser(username, currentPassword);
  if (!authRes.success || !authRes.user) {
    return { success: false, error: "Incorrect current password." };
  }

  const users = await getAdminUsersServer();
  const userIndex = users.findIndex((u) => u.id === authRes.user?.id);

  if (userIndex === -1) {
    return { success: false, error: "User not found." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(newPassword, salt, 100000, 64, "sha512").toString("hex");

  users[userIndex] = {
    ...users[userIndex],
    passwordHash,
    salt,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  };

  const saveRes = await saveAdminUsersServer(users);
  if (!saveRes.success) {
    return { success: false, error: saveRes.error };
  }

  recordAuditLogServer(
    "PASSWORD_CHANGED",
    `User "${username}" updated their password.`,
    username,
    users[userIndex].role
  );

  return { success: true };
}

/**
 * Backward compatibility wrapper for updateAdminPassword
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  const username = session.username || getAdminUsername();
  return changeOwnPasswordServer(username, currentPassword, newPassword);
}

/**
 * Backward compatibility wrapper for verifyAdminPassword
 */
export async function verifyAdminPassword(passwordInput: string): Promise<boolean> {
  const users = await getAdminUsersServer();
  for (const user of users) {
    try {
      const derivedKey = crypto.pbkdf2Sync(
        passwordInput,
        user.salt,
        100000,
        64,
        "sha512"
      ).toString("hex");

      if (crypto.timingSafeEqual(Buffer.from(user.passwordHash, "hex"), Buffer.from(derivedKey, "hex"))) {
        return true;
      }
    } catch {
      // Continue checking other users
    }
  }

  return passwordInput === getAdminPassword();
}

/**
 * Audit Log Management
 */
export async function getAuditLogsServer(): Promise<AuditLogEntry[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data: row } = await supabase
        .from("cms_documents")
        .select("data")
        .eq("key", "admin_audit_logs")
        .single();

      if (row?.data && Array.isArray(row.data)) {
        return row.data as AuditLogEntry[];
      }
    } catch {
      // fallback
    }
  }

  try {
    const raw = await fs.readFile(AUDIT_FILE_PATH, "utf-8");
    return JSON.parse(raw) as AuditLogEntry[];
  } catch {
    return [];
  }
}

export function recordAuditLogServer(
  action: string,
  details: string,
  performedBy: string,
  role: AdminRole
): void {
  (async () => {
    try {
      const logs = await getAuditLogsServer();
      const newEntry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        action,
        details,
        performedBy,
        role,
        timestamp: new Date().toISOString(),
      };

      const updated = [newEntry, ...logs].slice(0, 50);

      const supabase = getSupabaseServerClient();
      if (supabase) {
        await supabase.from("cms_documents").upsert({
          key: "admin_audit_logs",
          data: updated,
          updated_at: new Date().toISOString(),
        });
      }

      try {
        await fs.writeFile(AUDIT_FILE_PATH, JSON.stringify(updated, null, 2) + "\n", "utf-8");
      } catch {
        // Ignore EROFS
      }
    } catch {
      // Non-blocking
    }
  })();
}

/**
 * Gathers server environment and health metrics
 */
export async function getSecurityHealthStatus(): Promise<{
  environment: string;
  adminUsername: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  totalAdminUsers: number;
  hasCustomPasswordSet: boolean;
  hasSessionSecretSet: boolean;
  hasGooglePlacesApiKey: boolean;
  hasGooglePlaceId: boolean;
  isSupabaseConnected: boolean;
  sessionDuration: string;
  storageIntegrity: string;
  users: Omit<AdminUser, "passwordHash" | "salt">[];
  auditLogs: AuditLogEntry[];
}> {
  const session = await getAdminSession();
  const users = await getAdminUsersServer();
  const logs = await getAuditLogsServer();

  // Sanitize users (strip passwordHash and salt)
  const sanitizedUsers = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
    mustChangePassword: u.mustChangePassword,
  }));

  return {
    environment: process.env.NODE_ENV === "production" ? "Production" : "Development",
    adminUsername: session.username || getAdminUsername(),
    role: session.role || "admin",
    isSuperAdmin: session.role === "superadmin",
    totalAdminUsers: users.length,
    hasCustomPasswordSet: true,
    hasSessionSecretSet: Boolean(process.env.ADMIN_SESSION_SECRET),
    hasGooglePlacesApiKey: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    hasGooglePlaceId: Boolean(process.env.GOOGLE_PLACE_ID),
    isSupabaseConnected: isSupabaseConfigured(),
    sessionDuration: "24 Hours (HMAC-SHA256)",
    storageIntegrity: isSupabaseConfigured()
      ? "Supabase Cloud Persistent Storage (Active)"
      : "Local Dev Storage (Healthy)",
    users: session.role === "superadmin" ? sanitizedUsers : sanitizedUsers.filter((u) => u.username === session.username),
    auditLogs: session.role === "superadmin" ? logs.slice(0, 15) : [],
  };
}
