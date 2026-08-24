"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * SiteLayout cleanly separates the public storefront layout from the private /admin management area.
 * 
 * - For all public customer routes (/, /menu, /gallery, /about), it renders the public Navbar and Footer.
 * - For /admin routes, it excludes the public header/footer to allow the admin CMS shell to render independently.
 */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
