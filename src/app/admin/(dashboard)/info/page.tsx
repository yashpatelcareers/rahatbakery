import { getStoreInfoServer } from "@/lib/server/store-service";
import { StoreInfoEditor } from "@/components/admin/store-info-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Information & Hours | Rahat Bakery Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminStoreInfoPage() {
  const storeConfig = await getStoreInfoServer();

  return <StoreInfoEditor initialConfig={storeConfig} />;
}
