/**
 * Client and Server Safe Image Mapping Utilities
 * 
 * IMPORTANT ARCHITECTURE NOTE:
 * This module is imported by both Server Components (pages) and Client Components (Navbar, Gallery, Lightbox).
 * It must remain 100% isomorphic and browser-safe.
 * NEVER import Node.js-only built-in modules (such as 'fs', 'path', 'os') in this file.
 */

/**
 * Returns the public web path for a section image or falls back to a formatted placeholder.
 */
export function getLocalImageOrPlaceholder(folder: string, filename: string | undefined, placeholderText: string): string {
  if (filename) {
    return `/images/${folder}/${filename}`;
  }
  return `https://placehold.co/1200x600/2a1d18/ffffff?text=${encodeURIComponent(placeholderText)}`;
}

/**
 * Resolves the primary homepage hero image path.
 */
export function getHeroImage(): string {
  return '/images/hero/hero.png';
}

/**
 * Resolves the official Rahat Bakery logo image path.
 */
export function getLogoImage(): string {
  return '/images/logo/logo.png';
}

/**
 * Returns static references to the curated bakery gallery images.
 */
export function getGalleryImages(): { src: string; alt: string }[] {
  return [
    { src: '/images/gallery/gallery/gallery4.png', alt: 'Rahat Bakery - Storefront' },
    { src: '/images/gallery/gallery/gallery1.png', alt: 'Rahat Bakery - Interior Lounge' },
    { src: '/images/gallery/gallery/gallery3.png', alt: 'Rahat Bakery - Handcrafted Detail' },
    { src: '/images/gallery/gallery/gallery2.png', alt: 'Rahat Bakery - Entrance' },
  ];
}

/**
 * Returns static references to the full printed menu images for the lightbox viewer.
 */
export function getPrintedMenuImages(): { src: string; alt: string }[] {
  return [
    {
      src: '/images/menu/printed/printed-menu.png',
      alt: 'Rahat Bakery Complete Printed Menu',
    },
  ];
}
