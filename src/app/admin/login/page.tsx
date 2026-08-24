"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAdminAction } from "@/app/admin/actions";
import { getLogoImage } from "@/lib/images";
import { Eye, EyeOff, Lock, User, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const logoUrl = getLogoImage();

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Back to Public Site Link */}
      <div className="w-full max-w-md mb-6 flex justify-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-border/40 shadow-sm p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            {logoUrl.includes("placehold.co") ? (
              <span className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-[0.1em] uppercase">
                Rahat Bakery
              </span>
            ) : (
              <Image
                src={logoUrl}
                alt="Rahat Bakery Logo"
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
                priority
              />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            Management Sign In
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-2 font-light">
            Enter your credentials to manage Rahat Bakery&apos;s digital menu and content.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <span className="shrink-0 text-sm">⚠️</span>
            <span>{state.error}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="space-y-5">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-2"
            >
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-[#faf9f6] border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 bg-[#faf9f6] border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-sans font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-[11px] text-muted-foreground font-light">
            Authorized Rahat Bakery personnel only. Sessions expire after 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
