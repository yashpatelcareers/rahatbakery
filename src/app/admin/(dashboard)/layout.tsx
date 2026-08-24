import { getAdminSession } from "@/lib/server/admin-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Rahat Bakery Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminShell username={session.username} role={session.role}>{children}</AdminShell>;
}
