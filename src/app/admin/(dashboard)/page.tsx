import Link from "next/link";
import { getMenuDataServer } from "@/lib/server/menu-service";
import { getGalleryDataServer } from "@/lib/server/gallery-service";
import { SITE_CONFIG } from "@/lib/constants";
import {
  UtensilsCrossed,
  Image as ImageIcon,
  Store,
  Star,
  Settings,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardOverviewPage() {
  const menuData = await getMenuDataServer();
  const galleryItems = await getGalleryDataServer();
  const categoriesCount = menuData.categories.length;
  const totalMenuItems = menuData.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const totalGalleryItems = galleryItems.length;
  const googleApiKeyConfigured = Boolean(process.env.GOOGLE_PLACES_API_KEY);

  const MANAGEMENT_MODULES = [
    {
      title: "Menu Management",
      description:
        "Interactive live editor: Update item names, change prices, add new items, and remove items with instant sync.",
      href: "/admin/menu",
      icon: UtensilsCrossed,
      status: "Active (Phase 2)",
      count: `${totalMenuItems} Items in ${categoriesCount} Categories`,
    },
    {
      title: "Gallery Media",
      description:
        "Interactive media CMS: Upload photography, organize categories, and manage showcase videos with instant sync.",
      href: "/admin/gallery",
      icon: ImageIcon,
      status: "Active (Phase 3)",
      count: `${totalGalleryItems} Active Media Assets`,
    },
    {
      title: "Store Information",
      description:
        "Interactive store CMS: Update business hours, telephone, street address, and social links with instant sync.",
      href: "/admin/info",
      icon: Store,
      status: "Active (Phase 4)",
      count: "Laurel, MD Location",
    },
    {
      title: "Google Reviews",
      description:
        "Interactive reviews CMS: Monitor Google Places API health, trigger live syncs, and curate fallback reviews.",
      href: "/admin/reviews",
      icon: Star,
      status: "Active (Phase 5)",
      count: googleApiKeyConfigured ? "Live Sync Active" : "Curated Fallback Active",
    },
    {
      title: "Settings & Security",
      description:
        "Manage admin credentials, update password with PBKDF2 hashing, and monitor deployment health.",
      href: "/admin/settings",
      icon: Settings,
      status: "Active (Phase 6)",
      count: "Secure Server Session",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary to-secondary/95 text-secondary-foreground rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm border border-border/20 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Website Management System</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Welcome, Rahat Bakery
          </h1>
          <p className="text-secondary-foreground/80 font-sans text-sm sm:text-base font-light leading-relaxed">
            This private CMS portal allows authorized staff to manage the bakery&apos;s digital presence, menu offerings, and gallery media without editing code.
          </p>
        </div>
      </div>

      {/* Live Storefront Metrics Bar */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Live Storefront Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Active Menu Items */}
          <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Menu Items
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-foreground mb-1">
              {totalMenuItems}
            </p>
            <p className="text-xs text-muted-foreground">
              Across {categoriesCount} active categories
            </p>
          </div>

          {/* Active Gallery Assets */}
          <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gallery Media
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-foreground mb-1">
              {totalGalleryItems}
            </p>
            <p className="text-xs text-muted-foreground">
              Photos & video clips live
            </p>
          </div>

          {/* Business Hours */}
          <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Store Hours
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-lg font-bold text-foreground mb-1">
              1:00 PM – 9:00 PM
            </p>
            <p className="text-xs text-muted-foreground">
              Sun–Thu (Fri–Sat until 10 PM)
            </p>
          </div>

          {/* Google Reviews */}
          <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reviews Integration
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="font-serif text-lg font-bold text-foreground">
                Active
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {googleApiKeyConfigured ? "Places API v1 Live" : "Community Fallback Mode"}
            </p>
          </div>
        </div>
      </div>

      {/* Management Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Management Modules
          </h2>
          <span className="text-xs text-emerald-700 font-semibold tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Menu Editor Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MANAGEMENT_MODULES.map((module) => {
            const Icon = module.icon;
            const isLive = module.status.startsWith("Active");
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group bg-white p-6 rounded-2xl border border-border/40 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#faf9f6] border border-border/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isLive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {module.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {module.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-light">
                    {module.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/30 flex items-center justify-between text-xs font-semibold text-foreground/80">
                  <span className="text-[11px] text-muted-foreground font-normal">
                    {module.count}
                  </span>
                  <div className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Storefront Contact Quick Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border/40 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground mb-1">
            Store Location & Contact Info
          </h3>
          <p className="text-xs text-muted-foreground">
            {SITE_CONFIG.contact.address} • Phone: {SITE_CONFIG.contact.phone}
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#faf9f6] border border-border/50 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary hover:border-primary transition-all"
        >
          <span>Preview Live Website</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
