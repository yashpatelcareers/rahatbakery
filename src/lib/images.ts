import fs from 'fs';
import path from 'path';

/**
 * Reusable Image Mapping System
 * This ensures we can gracefully fallback to beautiful placeholders when the client's 
 * real images are missing, without breaking the Next.js <Image> component.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export function getLocalImageOrPlaceholder(folder: string, filename: string | undefined, placeholderText: string): string {
  if (filename) {
    const relativePath = `/images/${folder}/${filename}`;
    const absolutePath = path.join(PUBLIC_DIR, 'images', folder, filename);
    
    if (fs.existsSync(absolutePath)) {
      return relativePath;
    }
  }
  
  // Return placeholder if local file is missing
  return `https://placehold.co/1200x600/2a1d18/ffffff?text=${encodeURIComponent(placeholderText)}`;
}

export function getHeroImage(): string {
  // Try to find a hero image, you can add multiple extensions to check if needed
  const heroPath = '/images/hero/hero.png';
  if (fs.existsSync(path.join(PUBLIC_DIR, heroPath))) {
    return heroPath;
  }
  return 'https://placehold.co/1920x1080/2a1d18/ffffff?text=HERO+IMAGE+PLACEHOLDER';
}

export function getLogoImage(): string {
  const logoPath = '/images/logo/logo.png';
  if (fs.existsSync(path.join(PUBLIC_DIR, logoPath))) {
    return logoPath;
  }
  return 'https://placehold.co/400x150/ffffff/2a1d18?text=RAHAT+BAKERY';
}

export function getGalleryImages(): { src: string; alt: string }[] {
  const gallerySubDir = path.join(PUBLIC_DIR, 'images', 'gallery', 'gallery');
  const galleryDir = fs.existsSync(gallerySubDir) ? gallerySubDir : path.join(PUBLIC_DIR, 'images', 'gallery');
  if (!fs.existsSync(galleryDir)) return [];
  
  const files = fs.readdirSync(galleryDir);
  const prefix = fs.existsSync(gallerySubDir) ? '/images/gallery/gallery' : '/images/gallery';
  return files
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => ({
      src: `${prefix}/${file}`,
      alt: `Rahat Bakery - ${file.replace(/\.[^/.]+$/, "")}`
    }));
}

/**
 * Dynamically fetches all printed menu pages from the public/images/menu/printed/ directory.
 * If none exist, returns a placeholder array.
 */
export function getPrintedMenuImages(): { src: string; alt: string }[] {
  const printedDir = path.join(PUBLIC_DIR, 'images', 'menu', 'printed');
  if (!fs.existsSync(printedDir)) {
    return [{
      src: 'https://placehold.co/800x1200/ffffff/2a1d18?text=Printed+Menu+Page+1',
      alt: 'Printed Menu Placeholder'
    }];
  }
  
  const files = fs.readdirSync(printedDir);
  const images = files
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort() // Ensure page 1 comes before page 2 if named correctly
    .map(file => ({
      src: `/images/menu/printed/${file}`,
      alt: `Rahat Bakery Printed Menu - ${file.replace(/\.[^/.]+$/, "")}`
    }));

  if (images.length === 0) {
    return [{
      src: 'https://placehold.co/800x1200/ffffff/2a1d18?text=Printed+Menu+Page+1',
      alt: 'Printed Menu Placeholder'
    }];
  }

  return images;
}
