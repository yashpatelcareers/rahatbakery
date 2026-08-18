/**
 * Strong TypeScript Data Models for Rahat Bakery
 */

export interface MenuItem {
  name: string;
  price: string; // Supports fixed prices ("$26.99") and unit prices ("$16/lb", "$13.99/lb")
  description?: string;
}

export interface MenuCategory {
  name: string;
  subtitle?: string;
  imageFile: string;
  imageAlt: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageFile: string;
}

export type GalleryCategoryKey = "all" | "bakery" | "food" | "sweets" | "videos";

export interface GalleryMediaItem {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  category: "bakery" | "food" | "sweets" | "videos";
  isFeatured?: boolean;
}

