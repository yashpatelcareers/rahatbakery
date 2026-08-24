import {
  getGalleryDataServer,
  getDeletedGalleryDataServer,
} from "@/lib/server/gallery-service";
import { GalleryManager } from "@/components/admin/gallery-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery Media Management | Rahat Bakery Admin",
};

export default async function AdminGalleryPage() {
  const [items, deletedItems] = await Promise.all([
    getGalleryDataServer(),
    getDeletedGalleryDataServer(),
  ]);

  return (
    <GalleryManager
      initialItems={items}
      initialDeletedItems={deletedItems}
    />
  );
}
