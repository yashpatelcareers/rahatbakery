"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getLogoImage } from "@/lib/images";
import { logoutAdminAction } from "@/app/admin/actions";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Image as ImageIcon,
  Store,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  username?: string;
  role?: string;
}

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Menu Management",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    name: "Gallery Media",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    name: "Store Information",
    href: "/admin/info",
    icon: Store,
  },
  {
    name: "Google Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminShell({
  children,
  username = "admin",
  role = "admin",
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const logoUrl = getLogoImage();
  const isSuperAdmin = role === "superadmin";

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row text-foreground">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-border/40 shrink-0 sticky top-0 h-screen z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-border/30">
          <Link href="/admin" className="flex items-center gap-3 group">
            {logoUrl.includes("placehold.co") ? (
              <span className="font-serif text-2xl font-bold text-primary tracking-wider uppercase">
                Rahat Bakery
              </span>
            ) : (
              <Image
                src={logoUrl}
                alt="Rahat Bakery Logo"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            )}
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live CMS
            </span>
            <span className="text-[10px] text-muted-foreground font-sans tracking-wide">
              v1.0 (Phase 1)
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Admin Navigation">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Management
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-foreground/75 hover:bg-[#faf9f6] hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-border/30 bg-[#faf9f6]/50 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs font-serif">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {username}
                </p>
                <p className="text-[10px] text-muted-foreground font-sans">
                  {isSuperAdmin ? "Developer / Super Admin" : "Business Owner"}
                </p>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-white border border-transparent hover:border-border/40 transition-colors"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-colors duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE TOPBAR & DRAWER */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-border/40 px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link href="/admin" className="flex items-center gap-2">
          {logoUrl.includes("placehold.co") ? (
            <span className="font-serif text-xl font-bold text-primary uppercase">
              Rahat
            </span>
          ) : (
            <Image
              src={logoUrl}
              alt="Rahat Bakery"
              width={100}
              height={36}
              className="h-7 w-auto object-contain"
            />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground text-xs font-medium inline-flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-[#faf9f6]"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-serif font-bold text-lg text-foreground">
                  Admin Portal
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-foreground/80 hover:bg-[#faf9f6]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border/30 space-y-3">
              <div className="text-xs text-muted-foreground px-2">
                Logged in as <strong className="text-foreground">{username}</strong>
              </div>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-border/40 items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-lg text-foreground capitalize">
              {NAV_ITEMS.find((n) => n.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-border/40 text-xs font-semibold text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
            >
              <span>View Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
