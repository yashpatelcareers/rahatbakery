/**
 * Strong TypeScript Data Models for Rahat Bakery
 * Centralized type definitions for menu items, gallery media, site configuration, and Google Reviews.
 */

export interface MenuItem {
  /** The display name of the menu item (e.g., "Pineapple Cake", "Zeera Biscuits") */
  name: string;
  /** The formatted price string (e.g., "$26.99", "$16.00/lb", "$4.99") */
  price: string;
  /** Optional item description or dietary notes */
  description?: string;
}

export interface MenuCategory {
  /** Category display title (e.g., "Cakes", "Pastries", "Traditional Mithai", "Drinks") */
  name: string;
  /** Optional subtitle or pricing note (e.g., "$4.99 Each", "Sold by the Pound — $13.99/lb") */
  subtitle?: string;
  /** Filename of the section banner graphic located in public/images/menu/sections/ */
  imageFile: string;
  /** Accessible alt description for the banner image */
  imageAlt: string;
  /** Array of menu items belonging to this category */
  items: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
}

/** Supported category tabs for the gallery page */
export type GalleryCategoryKey = "all" | "bakery" | "food" | "sweets" | "videos";

export interface GalleryMediaItem {
  /** Unique identifier for the media item */
  id: string;
  /** Media type discriminator */
  type: "image" | "video";
  /** Path to the asset under the public/ directory (e.g., "/images/gallery/food items/food1.png") */
  src: string;
  /** Accessible alt text describing the visual media */
  alt: string;
  /** Category grouping for tab filtering */
  category: "bakery" | "food" | "sweets" | "videos";
  /** Optional flag for wide panoramic storefront shots */
  isFeatured?: boolean;
}

export interface BusinessHour {
  day: string;
  hours: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  social: {
    instagram: string;
    tiktok: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  hours: BusinessHour[];
}

/** Individual Google Review item structure */
export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorPhotoUri?: string;
  authorProfileUri?: string;
  rating: number;
  text: string;
  relativeTime: string;
  googleMapsUri?: string;
}

/** Aggregated Google Reviews response data */
export interface GoogleReviewsData {
  placeName?: string;
  rating: number;
  userRatingCount: number;
  reviews: GoogleReviewItem[];
  googleMapsUri?: string;
  isConfigured: boolean;
}
