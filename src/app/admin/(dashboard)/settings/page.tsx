import { getSecurityHealthStatus } from "@/lib/server/admin-auth";
import { SettingsManager } from "@/components/admin/settings-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & System Security | Rahat Bakery Admin",
};

export default async function AdminSettingsPage() {
  const health = await getSecurityHealthStatus();

  return <SettingsManager health={health} />;
}
