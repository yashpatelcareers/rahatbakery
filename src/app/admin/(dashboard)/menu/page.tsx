import { getAllMenuDataServer } from "@/lib/server/menu-service";
import { MenuEditor } from "@/components/admin/menu-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Management | Rahat Bakery Admin",
};

export default async function AdminMenuPage() {
  const menuData = await getAllMenuDataServer();

  return <MenuEditor initialData={menuData} />;
}
