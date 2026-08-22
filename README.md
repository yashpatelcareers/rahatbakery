# Rahat Bakery

A digital showcase built for **Rahat Bakery** in Laurel, Maryland. Engineered with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4, this website translates the brand's heritage into a high-performance web experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Pages & Routes](#pages--routes)
4. [Technology Stack](#technology-stack)
5. [Project Directory Structure](#project-directory-structure)
6. [Google Reviews Integration (Places API New)](#google-reviews-integration-places-api-new)
   - [How It Works](#how-it-works)
   - [Google Cloud & Place ID Setup Guide](#google-cloud--place-id-setup-guide)
   - [Environment Variables](#environment-variables)
   - [API Key Security & Cost Optimization](#api-key-security--cost-optimization)
   - [Graceful Failure Handling](#graceful-failure-handling)
7. [Content Management Guide](#content-management-guide)
   - [Where do I change menu items?](#where-do-i-change-menu-items)
   - [Where do I add a new drink?](#where-do-i-add-a-new-drink)
   - [Where do I add a gallery photo?](#where-do-i-add-a-gallery-photo)
   - [Where do I add a gallery video?](#where-do-i-add-a-gallery-video)
   - [Where do I update business hours?](#where-do-i-update-business-hours)
   - [Where do I update homepage content?](#where-do-i-update-homepage-content)
   - [Where do I update navigation links?](#where-do-i-update-navigation-links)
   - [Where do I update category banners?](#where-do-i-update-category-banners)
8. [Adding New Gallery Media](#adding-new-gallery-media)
9. [Adding New Menu Items](#adding-new-menu-items)
10. [Development & Local Setup](#development--local-setup)
11. [Production Build](#production-build)
12. [Linting & Type Checking](#linting--type-checking)
13. [Deployment Workflow](#deployment-workflow)
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
- Display live customer ratings and reviews directly from Google Places.
- Guide visitors to the store with verified business hours, address, direct phone dialing, and Google Maps navigation.

---

## Features

- **Cinematic Homepage:**
  - Full-width hero with contrast protection.
  - "The Tradition" welcome section detailing brand origins since 1950.
  - "Opening Hours" card with clear day-to-day schedules.
  - "What to Try" promotional specialty cards (*Happy Hour Deal, Refreshing Drinks, Hot Sellers, Rahat Favourites*).
  - **Live Google Reviews Section:** Displays real customer ratings, reviews, reviewer avatars, and direct links to Google Maps.
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
| `/` | `src/app/page.tsx` | Homepage: Hero, heritage, hours, promotional specialties, Google Reviews, menu CTA. |
| `/menu` | `src/app/menu/page.tsx` | Digital Menu: Categorized items, 2:1 banners, printed menu lightbox. |
| `/gallery` | `src/app/gallery/page.tsx` | Visual Gallery: Category tabs, photography grid, fullscreen lightbox. |
| `/about` | `src/app/about/page.tsx` | Brand Story: History since 1950, contact card, Google Maps embed. |
| `/api/reviews` | `src/app/api/reviews/route.ts` | Server-only API endpoint for retrieving sanitized Google review data. |
| `/qr` | `next.config.ts` | Permanent 308 redirect from `/qr` to `/menu` for physical QR codes. |
| `/sitemap.xml` | `src/app/sitemap.ts` | Dynamic XML sitemap for search engine indexing. |
| `/robots.txt` | `src/app/robots.ts` | Crawler directives allowing full site indexing. |

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.10` | React framework with Turbopack and static/server rendering |
| **UI Library** | React / React DOM | `19.2.4` | Modern component architecture |
| **Language** | TypeScript | `^5.0.0` | Strict type safety and data models |
| **Styling** | Tailwind CSS | `^4.0.0` | CSS design system with `@tailwindcss/postcss` |
| **Icons** | Lucide React | `^1.24.0` | Lightweight UI icons |
| **APIs** | Google Places API (New) | v1 | Real customer reviews and place details |
| **Linting** | ESLint / Next Config | `^9.0.0` / `16.2.10` | Code quality and import auditing |
| **Deployment** | Vercel | Production | Static edge hosting with ISR |

---

## Google Reviews Integration (Places API New)

The website integrates with **Google Places API (New)** to automatically display verified reviews for **Rahat Bakers and Sweets (Laurel, MD)**.

### How It Works
1. **Server-Side Fetching (`src/lib/server/google-reviews.ts`):** Next.js fetches Place Details on the server using Google's modern v1 endpoint:
   `GET https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}`
2. **Server-Side Caching (ISR):** Requests are cached for 1 hour (`revalidate: 3600`), minimizing API requests and keeping costs at zero/near-zero within Google's free tier.
3. **Data Protection:** The API key stays strictly on the server and is never sent to client browsers.

### Google Cloud & Place ID Setup Guide

To activate live Google reviews, follow these steps:

1. **Create/Open a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Select or create a project (e.g. `rahat-bakery-web`).
2. **Enable Places API (New):**
   - Navigate to **APIs & Services > Library**.
   - Search for **"Places API (New)"** and click **Enable**.
3. **Create & Restrict an API Key:**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > API Key**.
   - In **API Restrictions**, select **"Restrict key"** and check only **"Places API (New)"**.
4. **Obtain the Google Place ID:**
   - Use the official [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
   - Search for `Rahat Bakers and Sweets, 13919 Baltimore Ave, Laurel, MD 20707`.
   - Copy the resulting Place ID string (e.g., `ChIJ...`).
5. **Configure Locally (`.env.local`):**
   - Create a `.env.local` file in the project root:
     ```env
     GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
     GOOGLE_PLACE_ID=your_google_place_id_here
     ```
6. **Configure on Vercel:**
   - Go to your Vercel Project Dashboard -> **Settings > Environment Variables**.
   - Add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.
   - Redeploy or trigger a new build.

### Security & Environment Variables

> [!IMPORTANT]
> **This GitHub repository is PUBLIC.**
> Under no circumstances should real API keys, passwords, database URLs, or secret tokens ever be committed to Git.

- **Server-Side Exclusivity:** All Google Places API interactions execute exclusively in server-side Next.js code (`src/lib/server/google-reviews.ts` and `src/app/api/reviews/route.ts`). The API key is NEVER passed to client components, React props, or browser bundles.
- **Never Commit `.env.local`:** All local environment files are ignored via `.gitignore` (`.env*`, `.env.local`, `.env.*.local`).
- **No Private Secrets in `NEXT_PUBLIC_`:** Only non-sensitive public URLs (e.g. `NEXT_PUBLIC_SITE_URL`) may use the `NEXT_PUBLIC_` prefix.
- **Vercel Production Deployment:** Real credentials belong exclusively in **Vercel Project Settings > Environment Variables**, never in the repository.
- **Template-Only `.env.example`:** The `.env.example` file in the repository contains only blank/placeholder variable names.
- **Secret Rotation Protocol:** If any API key or secret is ever accidentally committed to GitHub, immediately revoke and rotate the key in the Google Cloud Console.

#### Local Environment Setup Example:
```bash
# 1. Copy the example template
cp .env.example .env.local

# 2. Fill in your private keys in .env.local (this file is git-ignored)
GOOGLE_PLACES_API_KEY=your_actual_google_cloud_key
GOOGLE_PLACE_ID=your_actual_place_id
```

### Environment Variables Reference

| Variable Name | Scope | Description |
| :--- | :--- | :--- |
| `GOOGLE_PLACES_API_KEY` | Server-Only | Google Cloud API key with Places API (New) enabled. |
| `GOOGLE_PLACE_ID` | Server-Only | Google Place ID for Rahat Bakers and Sweets in Laurel, MD. |
| `NEXT_PUBLIC_SITE_URL` | Public / Client | Canonical website URL (e.g., `https://rahatbakery.vercel.app`). |

### API Key Security & Cost Optimization
- **Narrow Field Mask:** The request specifies `X-Goog-FieldMask: displayName,rating,userRatingCount,reviews,googleMapsUri` to request only needed fields and avoid unnecessary SKU charges.
- **Server Cache:** Cached for 1 hour to prevent redundant requests on repeated visits.

### Graceful Failure Handling
If the API key or Place ID is missing, or if Google's API is temporarily unreachable:
- The website **will not break or show error messages**.
- The section gracefully displays a polished social proof invitation linking directly to Rahat Bakery on Google Maps.

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
│   │   ├── api/
│   │   │   └── reviews/
│   │   │       └── route.ts           # Server-side Google reviews API endpoint
│   │   ├── gallery/
│   │   │   └── page.tsx               # Visual gallery page wrapper
│   │   ├── menu/
│   │   │   └── page.tsx               # Digital menu page
│   │   ├── favicon.ico                # Favicon asset
│   │   ├── globals.css                # Global Tailwind CSS tokens and base styles
│   │   ├── layout.tsx                 # Root HTML layout with Navbar and Footer
│   │   ├── page.tsx                   # Homepage component with Google Reviews section
│   │   ├── robots.ts                  # SEO robots.txt generator
│   │   └── sitemap.ts                 # Dynamic XML sitemap generator
│   │
│   ├── components/
│   │   ├── gallery/
│   │   │   └── gallery-grid.tsx       # Interactive gallery with category tabs and lightbox
│   │   ├── home/
│   │   │   └── google-reviews-section.tsx # Google Reviews showcase component
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
│   │   ├── server/
│   │   │   └── google-reviews.ts      # Server-side Google Places API (New) fetcher
│   │   └── utils.ts                   # Class name merging utility (clsx + twMerge)
│   │
│   └── types/
│       └── index.ts                   # TypeScript data interfaces (MenuItem, GoogleReviewsData, etc.)
│
├── .env.example                       # Template for required environment variables
├── next.config.ts                     # Next.js configuration and redirects (/qr -> /menu)
├── package.json                       # Dependencies and build scripts
├── postcss.config.mjs                 # PostCSS config for Tailwind v4
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Comprehensive project documentation
```

---

## Content Management Guide

### Where do I change menu items?
Edit **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)**.

### Where do I add a new drink?
Open **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)**, locate `"Drinks"`, and append your item to `"items"`.

### Where do I add a gallery photo?
1. Save your image into `public/images/gallery/food items/`, `public/images/gallery/sweet items/`, or `public/images/gallery/gallery/`.
2. Register the path in **[`src/data/gallery.json`](file:///Users/yash/Desktop/rahatbakery/src/data/gallery.json)**.

### Where do I add a gallery video?
1. Save your `.mp4` into `public/images/gallery/featured videos/`.
2. Register with `"type": "video"` in **[`src/data/gallery.json`](file:///Users/yash/Desktop/rahatbakery/src/data/gallery.json)**.

### Where do I update business hours?
Edit the `hours` array in **[`src/lib/constants.ts`](file:///Users/yash/Desktop/rahatbakery/src/lib/constants.ts)**.

### Where do I update category banners?
Place your 2:1 aspect ratio graphic in `public/images/menu/sections/` and reference its filename in **[`src/data/menu.json`](file:///Users/yash/Desktop/rahatbakery/src/data/menu.json)**.

---

## Development & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional for local mock/live reviews)
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Production Build & Linting

```bash
# Type checking
npx tsc --noEmit

# ESLint validation
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## Deployment Workflow

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

## Credits & Assets

- **Brand:** Rahat Bakery (Laurel, MD)
- **Imagery & Video Assets:** Official Rahat Bakery photography and promotional graphics.
- **Reviews Data:** Powered by Google Places API (New).
- **Development:** Built with Next.js, React, and Tailwind CSS.
