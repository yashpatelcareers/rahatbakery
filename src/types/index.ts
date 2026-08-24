/**
 * Strong TypeScript Data Models for Rahat Bakery
 * Centralized type definitions for menu items, gallery media, site configuration, admin user roles, and Google Reviews.
 */

export type AdminRole = "superadmin" | "admin";
export type AdminUserStatus = "active" | "disabled";

export interface AdminUser {
  /** Unique user identifier */
  id: string;
  /** Login username (case-insensitive) */
  username: string;
  /** Friendly display name */
  name: string;
  /** Administrative role: superadmin (Developer) or admin (Owner) */
  role: AdminRole;
  /** Account status */
  status: AdminUserStatus;
  /** Salted PBKDF2 hash of password */
  passwordHash: string;
  /** Cryptographic salt (16 bytes hex) */
  salt: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Flag prompting password reset on next login */
  mustChangePassword?: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  role: AdminRole;
  timestamp: string;
}

export interface MenuItem {
  /** Optional unique identifier for tracking & recovery */
  id?: string;
  /** The display name of the menu item (e.g., "Pineapple Cake", "Zeera Biscuits") */
  name: string;
  /** The formatted price string (e.g., "$26.99", "$16.00/lb", "$4.99") */
  price: string;
  /** Optional item description or dietary notes */
  description?: string;
  /** Flag indicating item was soft-deleted to Trash / Recently Deleted */
  isDeleted?: boolean;
  /** ISO timestamp when the item was moved to Trash */
  deletedAt?: string;
  /** Original category name for seamless recovery */
  categoryName?: string;
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
  /** Array of active menu items belonging to this category */
  items: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
  /** Recoverable deleted menu items stored in Trash */
  deletedItems?: MenuItem[];
}

/** Supported category tabs for the gallery page */
export type GalleryCategoryKey = "all" | "bakery" | "food" | "sweets" | "videos";

export interface GalleryMediaItem {
  /** Unique identifier for the media item */
  id: string;
  /** Media type discriminator */
  type: "image" | "video";
  /** Path to the asset under the public/ directory or Supabase CDN URL */
  src: string;
  /** Accessible alt text describing the visual media */
  alt: string;
  /** Category grouping for tab filtering */
  category: "bakery" | "food" | "sweets" | "videos";
  /** Optional flag for wide panoramic storefront shots */
  isFeatured?: boolean;
  /** Flag indicating item was soft-deleted to Trash / Recently Deleted */
  isDeleted?: boolean;
  /** ISO timestamp when the item was moved to Trash */
  deletedAt?: string;
}

export interface BusinessHour {
  day: string;
  hours: string;
}

export interface DaySchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  formattedText?: string;
}

export interface StoreAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
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
    addressDetails?: StoreAddress;
    googleMapsUrl?: string;
  };
  hours: BusinessHour[];
  schedule?: DaySchedule[];
  /** Previous snapshot before the last save to allow one-click rollback */
  previousConfig?: Partial<SiteConfig>;
  /** Timestamp of last update */
  updatedAt?: string;
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
  source?: "live" | "curated";
  mode?: "auto" | "live" | "curated";
}
