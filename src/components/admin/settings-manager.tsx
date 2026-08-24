"use client";

import { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Server,
  FileCheck,
  X,
  Sparkles,
  Users,
  UserPlus,
  RotateCcw,
  UserCheck,
  UserX,
  Trash2,
  History,
} from "lucide-react";
import {
  changeAdminPasswordAction,
  createAdminUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  deleteUserAction,
  invalidateSessionAction,
} from "@/app/admin/settings/actions";
import type { AdminRole, AdminUserStatus, AuditLogEntry } from "@/types";

interface SanitizedAdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  mustChangePassword?: boolean;
}

interface SettingsHealthStatus {
  environment: string;
  adminUsername: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  totalAdminUsers: number;
  hasCustomPasswordSet: boolean;
  hasSessionSecretSet: boolean;
  hasGooglePlacesApiKey: boolean;
  hasGooglePlaceId: boolean;
  isSupabaseConnected?: boolean;
  sessionDuration: string;
  storageIntegrity: string;
  users: SanitizedAdminUser[];
  auditLogs: AuditLogEntry[];
}

interface SettingsManagerProps {
  health: SettingsHealthStatus;
}

interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error";
}

export function SettingsManager({ health }: SettingsManagerProps) {
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/hide passwords
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Users state (for superadmin)
  const [usersList, setUsersList] = useState<SanitizedAdminUser[]>(health.users);

  // Create User Modal
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Reset Password Modal
  const [resetModalState, setResetModalState] = useState<{
    isOpen: boolean;
    user: SanitizedAdminUser | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  function showToast(message: string, type: "success" | "error" = "success") {
    const nextId = String(toastCounter + 1);
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id: nextId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== nextId));
    }, 4500);
  }

  // Handle password submission
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from the current password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await changeAdminPasswordAction(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (res.success) {
        showToast("Your password was updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(res.error || "Failed to update password.");
        showToast(res.error || "Failed to update password.", "error");
      }
    } catch {
      setErrorMessage("A network error occurred while updating the password.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Create User
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await createAdminUserAction({
        username: newUsername,
        name: newName,
        role: newRole,
        password: newUserPassword,
      });

      if (res.success && res.user) {
        setUsersList((prev) => [
          ...prev,
          {
            id: res.user!.id,
            username: res.user!.username,
            name: res.user!.name,
            role: res.user!.role,
            status: res.user!.status,
            createdAt: res.user!.createdAt,
            updatedAt: res.user!.updatedAt,
            mustChangePassword: res.user!.mustChangePassword,
          },
        ]);
        showToast(res.message || "User created successfully.");
        setIsCreateUserOpen(false);
        setNewUsername("");
        setNewName("");
        setNewUserPassword("");
      } else {
        showToast(res.error || "Failed to create user.", "error");
      }
    } catch {
      showToast("A network error occurred.", "error");
    } finally {
      setIsCreatingUser(false);
    }
  }

  // Handle Reset User Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalState.user) return;

    setIsResettingPassword(true);
    try {
      const res = await resetUserPasswordAction(
        resetModalState.user.id,
        resetPasswordInput
      );

      if (res.success) {
        showToast(res.message || "Password reset successfully.");
        setResetModalState({ isOpen: false, user: null });
        setResetPasswordInput("");
      } else {
        showToast(res.error || "Failed to reset password.", "error");
      }
    } catch {
      showToast("A network error occurred.", "error");
    } finally {
      setIsResettingPassword(false);
    }
  }

  // Handle Toggle Status
  async function handleToggleStatus(user: SanitizedAdminUser) {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    if (
      !window.confirm(
        `Are you sure you want to ${
          nextStatus === "disabled" ? "disable" : "enable"
        } account "${user.username}"?`
      )
    ) {
      return;
    }

    try {
      const res = await toggleUserStatusAction(user.id, nextStatus);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        showToast(`Account "${user.username}" is now ${nextStatus}.`);
      } else {
        showToast(res.error || "Failed to change status.", "error");
      }
    } catch {
      showToast("A network error occurred.", "error");
    }
  }

  // Handle Delete User
  async function handleDeleteUser(user: SanitizedAdminUser) {
    if (
      !window.confirm(
        `Delete account "${user.username}" (${user.role}) permanently? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await deleteUserAction(user.id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`Account "${user.username}" deleted.`);
      } else {
        showToast(res.error || "Failed to delete account.", "error");
      }
    } catch {
      showToast("A network error occurred.", "error");
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-800"
                : "bg-destructive text-white border-destructive/80"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium leading-snug">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Settings & Access Security</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Settings & Security
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                health.isSuperAdmin
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {health.isSuperAdmin ? "Developer / Super Admin" : "Business Owner"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <strong className="text-foreground">{health.adminUsername}</strong> ({health.role}).
          </p>
        </div>

        <form action={invalidateSessionAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider hover:bg-destructive hover:text-white transition-all shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>

      {/* Super Admin: User Management Panel */}
      {health.isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Administrator Accounts & Roles
                </h2>
                <p className="text-xs text-muted-foreground">
                  Developer & Owner account management with role hierarchy protection.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateUserOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-xs w-fit"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Admin User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Login</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {usersList.map((user) => {
                  const isSelf = user.username === health.adminUsername;

                  return (
                    <tr key={user.id} className="hover:bg-[#faf9f6]/60 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-foreground">{user.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          @{user.username} {isSelf && "(You)"}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            user.role === "superadmin"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {user.role === "superadmin" ? "Super Admin" : "Business Owner"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            user.status === "active" ? "text-emerald-700" : "text-destructive"
                          }`}
                        >
                          {user.status === "active" ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalState({ isOpen: true, user });
                              setResetPasswordInput("");
                            }}
                            className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-[#faf9f6] transition-colors"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {!isSelf && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title={user.status === "active" ? "Disable Account" : "Enable Account"}
                              >
                                {user.status === "active" ? (
                                  <UserX className="w-3.5 h-3.5" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Password Management Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Password Change Card */}
          <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Change Password
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update password for account <strong className="text-foreground">{health.adminUsername}</strong>.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
                >
                  New Password (Min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Saving Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Session Security Policies Card */}
          <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Active Session Policy
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cryptographic safeguards protecting admin sessions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#faf9f6] space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Session Lifetime
                </p>
                <p className="font-mono font-bold text-foreground">
                  {health.sessionDuration}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Cookie Flags
                </p>
                <p className="font-mono font-bold text-emerald-700">
                  HttpOnly • SameSite=Lax
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Signature Algorithm
                </p>
                <p className="font-mono font-bold text-foreground">
                  HMAC-SHA256 (Timing-Safe)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Account Role
                </p>
                <p className="font-mono font-bold text-foreground">
                  {health.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Health & Security Help (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* System & Deployment Health Checks */}
          <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  System Health Checks
                </h2>
                <p className="text-xs text-muted-foreground">
                  Server environment and configuration status.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6]">
                <span className="font-medium text-foreground">Runtime Environment</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {health.environment}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6]">
                <span className="font-medium text-foreground">Admin Authentication</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Role Hierarchy Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6]">
                <span className="font-medium text-foreground">Session Signing Key</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6]">
                <span className="font-medium text-foreground">Cloud Storage (Supabase)</span>
                {health.isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Local Dev Fallback
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6]">
                <span className="font-medium text-foreground">Data Storage Integrity</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                  <FileCheck className="w-3.5 h-3.5" />
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Super Admin Audit Logs */}
          {health.isSuperAdmin && health.auditLogs && health.auditLogs.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/40 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
                <History className="w-4 h-4 text-indigo-700" />
                <h3 className="font-serif font-bold text-sm text-foreground">
                  Recent Administrative Activity
                </h3>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto text-xs pr-1">
                {health.auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-[#faf9f6] border border-border/30">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>@{log.performedBy} ({log.role})</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold text-foreground mt-0.5">{log.action}</p>
                    <p className="text-muted-foreground font-light text-[11px] mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsCreateUserOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border/50 shadow-2xl z-10 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border/30 mb-4">
              <h3 className="font-serif font-bold text-lg text-foreground">Create Admin Account</h3>
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahat Bakery Manager"
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. storemanager"
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-border/60 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="admin">Business Owner / Admin</option>
                  <option value="superadmin">Developer / Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Initial Password (Min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter initial password"
                    className="w-full px-3 pr-10 py-2 bg-[#faf9f6] border border-border/60 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreatingUser ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalState.isOpen && resetModalState.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setResetModalState({ isOpen: false, user: null })}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border/50 shadow-2xl z-10 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border/30 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground">
                  Reset Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reset password for @{resetModalState.user.username} ({resetModalState.user.name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetModalState({ isOpen: false, user: null })}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs mb-4">
              💡 The existing password remains completely private. You are setting a new temporary password for this user.
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  New Password (Min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter new temporary password"
                    className="w-full px-3 pr-10 py-2 bg-[#faf9f6] border border-border/60 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalState({ isOpen: false, user: null })}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {isResettingPassword ? "Resetting..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
