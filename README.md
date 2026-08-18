# Rahat Bakery

A digital showcase built for **Rahat Bakery** in Laurel, Maryland. Engineered with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4, this website translates the brand's heritage into a high-performance web experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Pages & Routes](#pages--routes)
4. [Technology Stack](#technology-stack)
5. [Project Directory Structure](#project-directory-structure)
6. [Content Management Guide](#content-management-guide)
   - [Where do I change menu items?](#where-do-i-change-menu-items)
   - [Where do I add a new drink?](#where-do-i-add-a-new-drink)
   - [Where do I add a gallery photo?](#where-do-i-add-a-gallery-photo)
   - [Where do I add a gallery video?](#where-do-i-add-a-gallery-video)
   - [Where do I update business hours?](#where-do-i-update-business-hours)
   - [Where do I update homepage content?](#where-do-i-update-homepage-content)
   - [Where do I update navigation links?](#where-do-i-update-navigation-links)
   - [Where do I update category banners?](#where-do-i-update-category-banners)
7. [Adding New Gallery Media](#adding-new-gallery-media)
8. [Adding New Menu Items](#adding-new-menu-items)
9. [Development & Local Setup](#development--local-setup)
10. [Production Build](#production-build)
11. [Linting & Type Checking](#linting--type-checking)
12. [Deployment Workflow](#deployment-workflow)
13. [Environment Variables](#environment-variables)
14. [Responsive Design Specifications](#responsive-design-specifications)
15. [Design System & Tokens](#design-system--tokens)
16. [Brand Identity Guidelines](#brand-identity-guidelines)
17. [Important Architecture Notes](#important-architecture-notes)
18. [Troubleshooting Guide](#troubleshooting-guide)
19. [Git Workflow](#git-workflow)
20. [Future Development Roadmap](#future-development-roadmap)
21. [Maintenance Guidelines](#maintenance-guidelines)
22. [Credits & Assets](#credits--assets)

---

## Overview

**Rahat Bakery** is a South Asian bakery and confectionery brand originating in 1950. The Laurel, Maryland location offers artisanal South Asian sweets (*traditional mithai*), custom whole cakes, European pastries, fresh biscuits (*khastaye*), savory snacks (*samosas, patties*), and traditional drinks (*karak chai, mango lassi, Shezan juices*).

### Purpose
The website functions as a digital flagship and marketing hub to:
- Welcome guests with brand heritage and atmosphere.
- Present a categorized digital menu with clear pricing.
- Provide a visual gallery of bakery interiors, food photography, and featured videos.
- Guide visitors to the store with verified business hours, address, direct phone dialing, and Google Maps navigation.

### Design Philosophy
- **Restraint & Whitespace:** Prioritizes generous whitespace, typography hierarchy, and uncluttered layouts.
- **Warm Editorial Aesthetic:** Warm cream backgrounds (`#faf9f6`), charcoal roast text, saffron-gold accents, and South Asian green/gold motifs.
- **Photography-First:** Media is showcased uncropped with natural aspect ratios and zero placeholder text.

---

## Features

- **Cinematic Homepage:**
  - Full-width hero with contrast protection.
  - "The Tradition" welcome section detailing brand origins since 1950.
  - "Opening Hours" card with clear day-to-day schedules.
  - "What to Try" promotional specialty cards (*Happy Hour Deal, Refreshing Drinks, Hot Sellers, Rahat Favourites*).
- **Desktop Navigation:**
  - Header with comfortable breathing room.
  - Active route indicators with saffron highlights.
  - Social media micro-interactions for Instagram and TikTok.
- **Mobile Navigation Drawer:**
  - Solid, opaque cream drawer (`#faf9f6`) that prevents background shift.
  - Minimum 48px touch targets for menu links.
  - Direct mobile social links and `Escape` key listeners.
- **Digital Menu System:**
  - 6 distinct categories: *Cakes, Pastries, Biscuits & Cookies, Traditional Mithai, Savory Items, Drinks*.
  - Balanced 2-column grid layout with 2:1 editorial category banner artwork.
  - Dot-leader item rows for mixed-price categories.
  - Gold badge headers and 2-column variety lists for uniform-price categories.
  - Interactive lightbox for expanding full printed menu sheets.
- **Interactive Photography Gallery:**
  - Organized category tabs: `ALL`, `BAKERY & STORE`, `FOOD`, `SWEETS`, `VIDEOS`.
  - Responsive masonry grid with 3:4 portrait food photography and looping video previews.
  - Fullscreen lightbox slideshow supporting desktop keyboard arrows (`←`, `→`, `Escape`) and mobile touch swipes.
- **About Us & Location:**
  - Brand history section with heritage slogan (*"Kuch Meetha, Kuch Namkeen"*).
  - "Visit Us" contact card with live telephone links (`tel:`).
  - Embedded, responsive Google Maps container.

---

## Pages & Routes

| Route | File Location | Purpose |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Homepage: Hero, heritage, hours, promotional specialties, menu CTA. |
| `/menu` | `src/app/menu/page.tsx` | Digital Menu: Categorized items, 2:1 banners, printed menu lightbox. |
| `/gallery` | `src/app/gallery/page.tsx` | Visual Gallery: Category tabs, photography grid, fullscreen lightbox. |
| `/about` | `src/app/about/page.tsx` | Brand Story: History since 1950, contact card, Google Maps embed. |
| `/qr` | `next.config.ts` | Permanent 308 redirect from `/qr` to `/menu` for physical QR codes. |
| `/sitemap.xml` | `src/app/sitemap.ts` | Dynamic XML sitemap for search engine indexing. |
| `/robots.txt` | `src/app/robots.ts` | Crawler directives allowing full site indexing. |

---

## Technology Stack

Exact versions from `package.json`:

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.10` | React framework with Turbopack and static rendering |
| **UI Library** | React / React DOM | `19.2.4` | Modern component architecture |
| **Language** | TypeScript | `^5.0.0` | Strict type safety and data models |
| **Styling** | Tailwind CSS | `^4.0.0` | CSS design system with `@tailwindcss/postcss` |
| **Icons** | Lucide React | `^1.24.0` | Lightweight UI icons |
| **Linting** | ESLint / Next Config | `^9.0.0` / `16.2.10` | Code quality and import auditing |
| **Deployment** | Vercel | Production | Static edge hosting |

---

## Project Directory Structure

```text
rahatbakery/
├── public/
│   └── images/
│       ├── gallery/
│       │   ├── featured videos/       # MP4 video clips (.mp4)
│       │   ├── food items/            # Savory culinary photos (food1.png - food5.png)
│       │   ├── gallery/               # Storefront & interior photos (gallery1.png - gallery4.png)
│       │   └── sweet items/           # Traditional sweets photos (sweet1.png - sweet2.png)
│       ├── hero/                      # Homepage hero and promotional deal cards
│       ├── logo/                      # Official Rahat Bakery logo (logo.png)
│       └── menu/
│           ├── printed/               # Scanned physical menu pages (printed-menu.png)
│           └── sections/              # 2:1 editorial category banner artwork (.png)
│
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx               # About Us & location page
│   │   ├── gallery/
│   │   │   └── page.tsx               # Visual gallery page wrapper
│   │   ├── menu/
│   │   │   └── page.tsx               # Digital menu page
│   │   ├── favicon.ico                # Favicon asset
│   │   ├── globals.css                # Global Tailwind CSS tokens and base styles
│   │   ├── layout.tsx                 # Root HTML layout with Navbar and Footer
│   │   ├── page.tsx                   # Homepage component
│   │   ├── robots.ts                  # SEO robots.txt generator
│   │   └── sitemap.ts                 # Dynamic XML sitemap generator
│   │
│   ├── components/
│   │   ├── gallery/
│   │   │   └── gallery-grid.tsx       # Interactive gallery with category tabs and lightbox
│   │   ├── layout/
│   │   │   ├── footer.tsx             # Global 3-column footer
│   │   │   ├── mobile-nav.tsx         # Mobile navigation drawer with touch targets
│   │   │   └── navbar.tsx             # Sticky desktop header with active indicators
│   │   └── ui/
│   │       ├── button.tsx             # Reusable button component
│   │       ├── card.tsx               # Reusable card component
│   │       ├── container.tsx          # Centered layout container
│   │       └── lightbox-image.tsx     # Lightbox viewer for printed menu
│   │
│   ├── data/
│   │   ├── gallery.json               # Centralized gallery media registry
│   │   └── menu.json                  # Centralized menu categories and item prices
│   │
│   ├── lib/
│   │   ├── constants.ts               # Single source of truth for SITE_CONFIG and hours
│   │   ├── images.ts                  # Isomorphic, browser-safe static image resolvers
│   │   └── utils.ts                   # Class name merging utility (clsx + twMerge)
│   │
│   └── types/
│       └── index.ts                   # TypeScript data interfaces (MenuItem, GalleryMediaItem, etc.)
│
├── next.config.ts                     # Next.js configuration and redirects (/qr -> /menu)
├── package.json                       # Dependencies and build scripts
├── postcss.config.mjs                 # PostCSS config for Tailwind v4
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Project documentation
```

---

## Content Management Guide

Quick reference for where to make common updates:

### Where do I change menu items?
Edit **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)**. All item names and prices are defined in this single file.

### Where do I add a new drink?
Open **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)**, locate the `"Drinks"` category object, and append your item to the `"items"` array:
```json
{
  "name": "Fresh Mango Juice",
  "price": "$3.99"
}
```

### Where do I add a gallery photo?
1. Save your image into the appropriate subfolder under `public/images/gallery/` (`food items/`, `sweet items/`, or `gallery/`).
2. Register the image in **[`src/data/gallery.json`](file:///Users/yash/Desktop/rahatbakery/src/data/gallery.json)**.

### Where do I add a gallery video?
1. Save your `.mp4` video file into `public/images/gallery/featured videos/`.
2. Register the video with `"type": "video"` in **[`src/data/gallery.json`](file:///Users/yash/Desktop/rahatbakery/src/data/gallery.json)**.

### Where do I update business hours?
Edit the `hours` array in **[`src/lib/constants.ts`](file:///Users/yash/Desktop/rahatbakery/src/lib/constants.ts)**. This updates the business hours across the Homepage, About Us page, and Footer automatically.

### Where do I update homepage content?
Edit **[`src/app/page.tsx`](file:///Users/yash/Desktop/rahatbakery/src/app/page.tsx)**.

### Where do I update navigation links?
Edit **[`src/components/layout/navbar.tsx`](file:///Users/yash/Desktop/rahatbakery/src/components/layout/navbar.tsx)** (for desktop) and **[`src/components/layout/mobile-nav.tsx`](file:///Users/yash/Desktop/rahatbakery/src/components/layout/mobile-nav.tsx)** (for mobile).

### Where do I update category banners?
Place your new 2:1 aspect ratio banner graphic in `public/images/menu/sections/` and reference its filename in **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)** under `"imageFile"`.

---

## Adding New Gallery Media

The gallery is data-driven and image-first. Do not invent product names or descriptions for gallery photos.

### Adding an Image:
```json
{
  "id": "food-6",
  "type": "image",
  "src": "/images/gallery/food items/food6.png",
  "alt": "Rahat Bakery culinary photography",
  "category": "food"
}
```

### Adding a Video:
```json
{
  "id": "video-4",
  "type": "video",
  "src": "/images/gallery/featured videos/cake_decorating.mp4",
  "alt": "Rahat Bakery cake decorating video",
  "category": "videos"
}
```

Supported categories: `"bakery"`, `"food"`, `"sweets"`, `"videos"`.

---

## Adding Menu Items

In `src/data/menu.json`, each category contains a list of items:

```json
{
  "name": "Pastries",
  "subtitle": "$4.99 Each",
  "items": [
    { "name": "Chocolate Pastry", "price": "$4.99" },
    { "name": "Coffee Pastry", "price": "$4.99" }
  ],
  "imageFile": "pastries-section.png",
  "imageAlt": "Assorted pastries"
}
```

- **Uniform-Price Categories:** If all items in a category share the same price (e.g. `$13.99/lb`), the menu page will automatically group them cleanly with a top gold badge and an uncrowded 2-column variety list.
- **Mixed-Price Categories:** If items have different prices (e.g. Cakes, Savory, Drinks), each row displays dot leaders connecting the item to its distinct price.

---

## Development & Local Setup

### Prerequisites
- Node.js 18.18.0 or higher
- npm 9.0.0 or higher

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local development server:**
   ```bash
   npm run dev
   ```

3. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Production Build

To compile an optimized production build using Turbopack:

```bash
npm run build
```

To run the production server locally after building:

```bash
npm run start
```

---

## Linting & Type Checking

To verify code quality and strict type safety:

```bash
# Run ESLint checks
npm run lint

# Run TypeScript compilation checks
npx tsc --noEmit
```

---

## Deployment Workflow

The project is configured for continuous deployment on **Vercel** via GitHub integration:

```text
Local Code Changes
      ↓
git add .
      ↓
git commit -m "feat/fix description"
      ↓
git push origin main
      ↓
GitHub Repository
      ↓
Vercel Automated Build & Deployment
      ↓
Production Live at https://rahatbakery.vercel.app
```

---

## Environment Variables

> **Note:** The current project does not require external environment variables or third-party API secret keys. All routes and assets are rendered statically.

---

## Responsive Design Specifications

All components are tested across standard viewport widths:

| Device Category | Target Viewport Widths | QA Notes |
| :--- | :--- | :--- |
| **Small Mobile** | `320px`, `375px` | Zero horizontal overflow; multi-word item titles wrap cleanly without clipping prices. |
| **Standard Mobile** | `390px`, `412px`, `430px` | 48px touch targets; opaque mobile navigation drawer. |
| **Tablet** | `768px`, `820px` | 2-column promotional cards; balanced padding. |
| **Desktop** | `1024px`, `1280px`, `1440px+` | Balanced 2-column menu layout; hover micro-interactions. |

---

## Design System & Tokens

Values defined in `src/app/globals.css` and Tailwind theme:

| Token | CSS Variable / Value | Purpose |
| :--- | :--- | :--- |
| **Background** | `hsl(40 33% 98%)` / `#faf9f6` | Warm off-white / cream page canvas |
| **Foreground** | `hsl(20 14% 4%)` / `#1c1917` | Deep roast charcoal for readable text |
| **Primary** | `hsl(38 92% 50%)` / Saffron Gold | Accent badges, borders, CTA buttons, active tabs |
| **Secondary** | `hsl(20 14% 12%)` / Deep Charcoal | Hero background, dark header/footer blocks |
| **Font Serif** | Playfair Display (`var(--font-playfair)`) | Primary headings, category titles, hero |
| **Font Sans** | Inter (`var(--font-inter)`) | Body copy, navigation links, item pricing |
| **Radius** | `0.75rem` (`rounded-2xl` on cards) | Subtle, modern rounded edges |

---

## Brand Identity Guidelines

1. **Brand Identity:** Preserve the established visual tone of Rahat Bakery.
2. **Color Balance:** Always maintain the warm cream base with saffron-gold highlights, deep green framing, and Rahat red branding.
3. **No Placeholders:** Never commit temporary `placehold.co` links when production assets are available.
4. **Photography Authenticity:** Use only authentic photography of Rahat Bakery's physical location, culinary creations, and sweets.

---

## Important Architecture Notes

### Client vs. Server Component Boundaries
- Next.js 16 App Router executes server components by default.
- Client components are marked with `"use client"` at the top of the file (`navbar.tsx`, `mobile-nav.tsx`, `gallery-grid.tsx`, `lightbox-image.tsx`).
- **CRITICAL:** Browser-facing client components must **never** import Node.js-only built-in modules (`fs`, `path`, `os`, `child_process`).
- All image helpers in **[`src/lib/images.ts`](file:///Users/yash/Desktop/rahatbakery/src/lib/images.ts)** are isomorphic and browser-safe, using static path resolutions.

---

## Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Module not found: Can't resolve 'fs'` | A client component imported a utility that uses Node.js `fs`. | Ensure `src/lib/images.ts` uses static path strings without `fs.existsSync` or `path.join`. |
| Broken image link on a page | Asset filename mismatch or missing file in `public/images/`. | Check file path under `public/images/` and ensure exact case matching in `menu.json` or `gallery.json`. |
| Mobile navbar overlaps hero content | Background opacity or z-index misconfiguration. | Verify `mobile-nav.tsx` uses solid `bg-[#faf9f6]` with `z-50`. |
| Horizontal scrollbar on mobile | Fixed pixel width or non-wrapping text string. | Use `max-w-full`, `overflow-hidden`, and responsive Tailwind classes (`break-words`, `leading-snug`). |

---

## Git Workflow

```bash
# 1. Review status of modified files
git status

# 2. Stage changes
git add .

# 3. Commit with a clear message
git commit -m "docs: update comprehensive project documentation"

# 4. Push to main branch (triggers Vercel deploy)
git push origin main
```

---

## Future Development Roadmap

- **Online Ordering:** Integration with digital ordering and pickup systems (Toast, Clover, or custom checkout).
- **Catering Request Form:** Dedicated form for large wedding mithai boxes and custom cake orders.
- **Customer Reviews:** Verified Google Review carousel.
- **Analytics:** Integration with privacy-friendly analytics (Vercel Analytics, Google Analytics 4).

---

## Maintenance Guidelines

1. **Centralize Data:** Never hardcode prices or business hours across multiple components. Use `src/data/menu.json` and `src/lib/constants.ts`.
2. **Verify Builds Before Pushing:** Always run `npx tsc --noEmit && npm run lint && npm run build` prior to committing.
3. **Respect Aspect Ratios:** Maintain 2:1 aspect ratios for menu banners and 3:4 portrait ratios for food gallery photos.

---

## Credits & Assets

- **Brand:** Rahat Bakery (Laurel, MD)
- **Imagery & Video Assets:** Official Rahat Bakery photography and promotional graphics.
- **Development:** Built with Next.js, React, and Tailwind CSS.
