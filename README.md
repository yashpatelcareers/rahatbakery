# Rahat Bakery — Website & Content Management System

A digital storefront and private management system engineered for **Rahat Bakery** in Laurel, Maryland. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Supabase PostgreSQL & Cloud Storage**, and **Tailwind CSS v4**, this application combines an authentic cultural brand identity with an enterprise-grade, recoverable CMS.

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
   - [Public Website](#public-website)
   - [Private Admin CMS](#private-admin-cms)
4. [Project Directory Structure](#project-directory-structure)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Admin Access & Role Hierarchy](#admin-access--role-hierarchy)
8. [Menu Management](#menu-management)
9. [Gallery Media & Storage](#gallery-media--storage)
10. [Store Information & Operating Hours](#store-information--operating-hours)
11. [Google Reviews Integration](#google-reviews-integration)
12. [Supabase Architecture & Persistence Layer](#supabase-architecture--persistence-layer)
13. [Reversible Actions & Trash Recovery Architecture](#reversible-actions--trash-recovery-architecture)
14. [Vercel Deployment Guide](#vercel-deployment-guide)
15. [GitHub Workflow](#github-workflow)
16. [Content Updates vs Code Updates](#content-updates-vs-code-updates)
17. [Security & Cryptographic Standards](#security--cryptographic-standards)
18. [Troubleshooting Guide](#troubleshooting-guide)
19. [Future Roadmap](#future-roadmap)
20. [Credits & Brand Identity](#credits--brand-identity)

---

## About the Project

**Rahat Bakery** is a South Asian bakery and confectionery brand originating in 1950. The Laurel, Maryland location offers South Asian sweets (*traditional mithai*), custom whole cakes, European pastries, fresh biscuits (*khastaye*), savory snacks (*samosas, patties*), and traditional drinks (*karak chai, mango lassi, Shezan juices*).

### Purpose
The application serves two distinct user groups:
1. **Public Customers:** Visitors who explore the bakery's history, browse the categorized digital menu with clear pricing, view high-definition food and storefront photography, check 7-day operating hours, read verified reviews, and navigate to the store.
2. **Bakery Administrators & Developers:** Authenticated managers who adjust menu pricing, upload gallery media, modify business hours, monitor customer reviews, and manage administrative permissions via a private, cloud-persisted CMS without touching source code or editing config files.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.10` | React framework with Turbopack, Server Actions, and ISR |
| **UI Library** | React / React DOM | `19.2.4` | Modern component rendering |
| **Language** | TypeScript | `^5.0.0` | Strict type safety and data models |
| **Persistence (Database)** | Supabase (PostgreSQL) | Cloud | Persistent JSONB document storage (`cms_documents`) with RLS |
| **Persistence (Media)** | Supabase Storage | Cloud | High-performance CDN media bucket (`gallery`) |
| **Styling** | Tailwind CSS | `^4.0.0` | CSS design system with `@tailwindcss/postcss` |
| **Icons** | Lucide React | `^1.24.0` | Modern, lightweight UI iconography |
| **Authentication** | Node.js Crypto | Built-in | Salted PBKDF2 (`100,000` iterations) & HMAC-SHA256 tokens |
| **APIs** | Google Places API (New) | v1 | Place details, live ratings, and verified customer reviews |
| **Validation** | Zod | `^3.24.0` | Schema validation and input sanitation |
| **Hosting** | Vercel | Production | Serverless edge deployment |

---

## Features

### Public Website
- **Cinematic Homepage (`/`):** Full-width hero with high-contrast protection, *"The Tradition"* heritage introduction, 7-day opening hours summary, promotional deal cards (*Happy Hour Deal, Refreshing Drinks, Hot Sellers, Rahat Favourites*), and a Google Reviews showcase.
- **Categorized Digital Menu (`/menu`):** 6 categories (*Cakes, Pastries, Biscuits & Cookies, Traditional Mithai, Savory Items, Drinks*), balanced 2-column layout, 2:1 editorial category banner artwork, and an interactive full-resolution lightbox viewer for printed menu sheets.
- **Visual Media Gallery (`/gallery`):** Interactive category filtering (`ALL`, `BAKERY & STORE`, `FOOD`, `SWEETS`, `VIDEOS`), 3:4 masonry photography layout, looping video previews, and a fullscreen lightbox slideshow supporting keyboard navigation (`←`, `→`, `Escape`) and mobile touch swipes.
- **About Us & Location (`/about`):** History since 1950, brand slogan (*"Kuch Meetha, Kuch Namkeen"*), and complete visit card with live telephone dialing (`tel:`) and location details.
- **QR Code Redirect (`/qr`):** 308 permanent redirect directly to `/menu` for in-store physical tabletop QR codes.

### Private Admin CMS
- **Overview Dashboard (`/admin`):** Live telemetry, system health status, active item counts, media library metrics, and quick navigation.
- **Menu Management (`/admin/menu`):** Inline price editing, item addition/renaming, uniform price subtitle notes, soft-delete to Trash, and instant public cache revalidation.
- **Gallery Management (`/admin/gallery`):** Drag-and-drop file upload to Supabase Storage, CDN URL support, featured badges, soft-delete to Trash, and permanent deletion with cloud file cleanup.
- **Store Information CMS (`/admin/info`):** Live business details, contact information, social links, 7-day opening schedule, and automatic snapshot rollback.
- **Google Reviews CMS (`/admin/reviews`):** Dual-mode toggle (Live Google Places API vs Curated Fallback), cache refresh triggers, and fallback testimonial editor.
- **Settings & Access Security (`/admin/settings`):** Password updates, active session policies, deployment health monitors, Super Admin user management table, blind password reset, and administrative audit logs.

---

## Project Directory Structure

```text
rahatbakery/
├── public/
│   ├── favicon.ico                    # Favicon
│   └── images/
│       ├── gallery/
│       │   ├── featured videos/       # MP4 video clips (.mp4)
│       │   ├── food items/            # Savory culinary photos
│       │   ├── gallery/               # Storefront & interior photos
│       │   └── sweet items/           # Traditional sweets photos
│       ├── hero/                      # Homepage hero & promo deal graphics
│       ├── logo/                      # Official Rahat Bakery logo
│       └── menu/
│           ├── printed/               # Scanned physical menu sheets
│           └── sections/              # 2:1 category banners
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               # Homepage
│   │   │   ├── about/page.tsx         # Story & contact page
│   │   │   ├── gallery/page.tsx       # Public gallery page
│   │   │   └── menu/page.tsx          # Public menu page
│   │   ├── admin/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx           # Admin Overview
│   │   │   │   ├── gallery/page.tsx   # Gallery CMS
│   │   │   │   ├── info/page.tsx      # Store Information CMS
│   │   │   │   ├── menu/page.tsx      # Menu Management CMS
│   │   │   │   ├── reviews/page.tsx   # Google Reviews CMS
│   │   │   │   └── settings/page.tsx  # Settings & User Management
│   │   │   ├── login/page.tsx         # Admin Login Portal
│   │   │   └── actions.ts             # Auth Server Actions (login, logout)
│   │   ├── api/
│   │   │   ├── admin/gallery/upload/  # Media Upload API Route
│   │   │   └── reviews/               # Public Google Reviews API Route
│   │   ├── globals.css                # Tailwind CSS v4 design tokens & base rules
│   │   ├── layout.tsx                 # Root layout with HTML/Font configurations
│   │   ├── robots.ts                  # SEO crawler directives
│   │   └── sitemap.ts                 # Dynamic XML sitemap generator
│   │
│   ├── components/
│   │   ├── admin/                     # CMS Management Components & Modals
│   │   ├── gallery/                   # Gallery Grid & Lightbox
│   │   ├── home/                      # Homepage Google Reviews & Promo Components
│   │   ├── layout/                    # Header, Navbar, Mobile Nav, Footer
│   │   └── ui/                        # Reusable Buttons, Cards, Containers
│   │
│   ├── lib/
│   │   ├── server/                    # Server-Only Service Layer (Supabase, Auth, etc.)
│   │   │   ├── admin-auth.ts          # PBKDF2 authentication, sessions, role management
│   │   │   ├── gallery-service.ts     # Gallery persistence, soft delete, storage cleanup
│   │   │   ├── google-reviews.ts      # Google Places API (New) fetcher
│   │   │   ├── menu-service.ts        # Menu persistence, soft delete, restore
│   │   │   ├── reviews-service.ts     # Reviews dual-mode logic & fallback management
│   │   │   ├── store-service.ts       # Store info persistence & snapshot rollback
│   │   │   ├── supabase.ts            # Server-side Supabase client singleton
│   │   │   └── supabase-seed.ts       # Baseline auto-seeder for empty databases
│   │   ├── constants.ts               # Default site configuration constants
│   │   ├── images.ts                  # Browser-safe image path resolvers
│   │   └── utils.ts                   # Class name merging & time formatting utilities
│   │
│   └── types/
│       └── index.ts                   # Centralized TypeScript definitions & interfaces
│
├── supabase/
│   └── schema.sql                     # Supabase SQL schema (cms_documents table & storage RLS)
│
├── .env.example                       # Clean template of required environment variables
├── next.config.ts                     # Next.js configuration & QR redirect rules
├── package.json                       # Dependencies & scripts
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/rahatbakery.git
cd rahatbakery
npm install
```

### 2. Configure Local Environment
Create `.env.local` in the project root:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your local development credentials:
```env
# Local Administrator Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
ADMIN_SESSION_SECRET=your_local_session_secret_key_here

# Supabase Production Persistence (Optional locally; uses local filesystem fallback if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Places API (Optional locally; uses curated fallback if omitted)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_PLACE_ID=your_google_place_id_here
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** for the public website, and **[http://localhost:3000/admin](http://localhost:3000/admin)** for the CMS.

---

## Environment Variables Reference

| Variable Name | Required | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| `ADMIN_USERNAME` | Yes | Server-Only | Default Super Admin / Developer username for initial setup. |
| `ADMIN_PASSWORD` | Yes | Server-Only | Initial Super Admin password used for initial database seeding. |
| `ADMIN_SESSION_SECRET` | Yes | Server-Only | Cryptographic secret for signing HMAC-SHA256 session cookies. |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Client/Server | Supabase project API gateway endpoint. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Server-Only | Privileged service-role key for reading/writing `cms_documents` & `gallery` bucket. |
| `GOOGLE_PLACES_API_KEY` | Optional | Server-Only | Google Cloud key with *Places API (New)* enabled. |
| `GOOGLE_PLACE_ID` | Optional | Server-Only | Place ID for *Rahat Bakers and Sweets* in Laurel, MD. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Client/Server | Canonical URL for metadata and OpenGraph generation. |

---

## Admin Access & Role Hierarchy

The CMS features a **Two-Tier Role Hierarchy** protecting system infrastructure while giving the bakery owner operational independence:

### 1. Developer / Super Admin (`superadmin`)
- **Full System Authority:** Access all CMS modules, view system telemetry, and inspect administrative audit logs.
- **User Management:** Create new admin accounts, enable/disable accounts, and permanently delete accounts.
- **Blind Password Recovery:** Securely reset a forgotten owner password by setting a new temporary password (without viewing or exposing the previous password).
- **Role Protection:** The system strictly blocks owner accounts from modifying, deleting, or downgrading Developer accounts. The final Super Admin account cannot be deleted.

### 2. Business Owner / Admin (`admin`)
- **Full Operational Freedom:** Add, edit, and price menu items; upload and manage gallery photography; update business hours and contact details; configure Google review fallbacks.
- **Self-Service Password Changes:** Update their own login password directly from `/admin/settings`.
- **Protected Environment:** Cannot see or modify server-side database keys, API secrets, or Super Admin accounts.

### Authentication Endpoints
- **Local:** `http://localhost:3000/admin/login`
- **Production:** `https://rahatbakery.vercel.app/admin/login`

---

## Menu Management

1. **Inline Price & Name Editing:** Click the pencil icon on any item row to edit the name and price in real time. Click **Save** to persist immediately.
2. **Add New Item:** Click **Add Menu Item**, pick a category, provide the name and price, and save.
3. **Category Subtitle Notes:** Click **Edit Note** under any category heading to update uniform pricing descriptions (e.g. *"$4.99 Each"* or *"Sold by the Pound"*).
4. **Soft-Delete (Trash):** Clicking the Trash icon moves the item into the recoverable `Trash` tab and instantly removes it from the public menu.
5. **Restoration:** Open the `Trash` tab and click **Restore** to return the item to its original category.
6. **Permanent Deletion:** In the `Trash` tab, click **Delete Permanently** and confirm the secondary modal.

---

## Gallery Media & Storage

1. **Direct Upload:** Click **Upload Media**, drag and drop image files (`.png`, `.jpg`, `.jpeg`, `.webp`), select a category, and optionally check **Mark as Featured**.
2. **Storage Architecture:** Files are uploaded via the server action `/api/admin/gallery/upload` directly into the Supabase Storage `gallery` bucket.
3. **CDN Integration:** Images receive persistent public Supabase CDN URLs stored in the `gallery_data` document.
4. **Soft-Delete (Trash):** Deleting a gallery item hides it from `/gallery` and moves it to the `Recently Deleted` tab while preserving the underlying storage file.
5. **Permanent Deletion & Purge:** Permanently deleting an item purges both the database metadata and deletes the physical file from the Supabase Storage bucket.

---

## Store Information & Operating Hours

1. **Business Details:** Edit the bakery name, description, phone number, email, and address fields.
2. **7-Day Schedule:** Toggle days open/closed and set open/close times using 12-hour or 24-hour controls.
3. **Automatic Summary Hours:** The CMS automatically calculates formatted summary strings (e.g., *"Monday – Thursday: 1:00 PM – 9:00 PM"*) for public display.
4. **Snapshot Rollback:** Before committing new changes, the system preserves the previous configuration. Click **Revert** in the header to roll back accidental edits.

---

## Google Reviews Integration

1. **Live Google Mode:** When `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` are configured, the system retrieves live ratings, review counts, author avatars, and reviews using Google Places API (New).
2. **Curated Fallback Mode:** If keys are omitted or live sync is toggled off, the public website displays curated customer testimonials without misleading "Verified Google User" labels.
3. **Cache Optimization (ISR):** Live Google Places requests are cached for 1 hour (`revalidate: 3600`) to remain strictly within Google's free usage tier ($200 monthly credit).
4. **Server-Side Protection:** The Google Cloud API key remains strictly server-side and is never exposed to browser bundles.

---

## Supabase Architecture & Persistence Layer

The application uses Supabase for production persistence across serverless restarts and redeployments.

### 1. Database Table: `public.cms_documents`
```sql
create table if not exists public.cms_documents (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
```

### Document Keys:
- `menu_data`: Categories, items, subtitles, and soft-deleted items.
- `gallery_data`: Active media metadata and soft-deleted items.
- `store_info`: Business details, contact, 7-day schedule, and `previousConfig` snapshot.
- `reviews_config`: Review rating, review count, sync settings, and curated testimonials.
- `admin_users`: Multi-user registry with salted PBKDF2 hashes and role definitions.
- `admin_audit_logs`: Immutable security and administrative activity trail.

### 2. Storage Bucket: `gallery`
- Public read access for customer storefronts.
- Service-role write/delete access for authenticated admin actions.

---

## Reversible Actions & Trash Recovery Architecture

```text
[Active Content (Menu / Gallery / Store Info)]
                      │
                      ▼ (Click "Remove" / "Delete")
┌────────────────────────────────────────────────────────┐
│ 1. Soft-Delete (Reversible)                            │
│  • Flags item with isDeleted: true                     │
│  • Records ISO timestamp (deletedAt)                   │
│  • Removes item from live public storefront            │
│  • Preserves all metadata & storage assets             │
│  • Item appears in Admin "Recently Deleted" / "Trash"  │
└──────────────────────────┬─────────────────────────────┘
                           │
                 [Admin Trash Area]
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ Click "Restore" ]          [ Click "Delete Permanently" ]
   • Clears isDeleted flag      • Requires explicit confirmation
   • Restores to public view    • Purges record from database
   • Restores to category       • Purges media from Supabase Storage
```

---

## Vercel Deployment Guide

1. **Push Repository to GitHub:** Ensure all code is pushed to your GitHub repository (`main` branch).
2. **Connect Project to Vercel:** In the Vercel dashboard, click **Add New Project** and import the `rahatbakery` repository.
3. **Configure Environment Variables:** In Vercel Project Settings > **Environment Variables**, add:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_PLACES_API_KEY` (Optional)
   - `GOOGLE_PLACE_ID` (Optional)
4. **Deploy:** Click **Deploy**. Vercel will build the optimized production bundle with automatic edge routing.

---

## GitHub Workflow

```bash
# Check modified files
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: updated store hours and added new gallery photography"

# Push to production branch
git push origin main
```
*Vercel automatically detects pushes to `main` and initiates a production build.*

---

## Content Updates vs Code Updates

| Update Type | Performed By | Method | Redeployment Required? |
| :--- | :--- | :--- | :--- |
| **Menu Prices & Items** | Business Owner | Admin CMS (`/admin/menu`) | **No** (Instant ISR revalidation) |
| **Gallery Photos & Videos** | Business Owner | Admin CMS (`/admin/gallery`) | **No** (Instant upload to Supabase) |
| **Store Hours & Phone** | Business Owner | Admin CMS (`/admin/info`) | **No** (Instant update) |
| **Admin Passwords** | Owner / Developer | Admin CMS (`/admin/settings`) | **No** (Instant database update) |
| **Page Layout & Styles** | Developer | Codebase / Git commit | **Yes** (Automated Vercel build) |
| **New Features & Routes** | Developer | Codebase / Git commit | **Yes** (Automated Vercel build) |

---

## Security & Cryptographic Standards

- **Salted PBKDF2 Password Hashing:** `100,000` iterations with SHA-512 and a unique 16-byte random salt generated per user.
- **Constant-Time Verification:** All password and session checks utilize `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- **Signed Session Tokens:** Role-aware HMAC-SHA256 tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies with 24-hour expiration.
- **Zero Plaintext Credentials:** Passwords, hashes, and secrets are never returned over APIs, never rendered in HTML, and never logged.
- **Role Protection:** Hardened server action middleware blocks non-superadmins from calling account management actions.
- **Git Security:** `.gitignore` strictly blocks `.env*` and `.env.local` from ever entering Git history.

---

## Troubleshooting Guide

### 1. Port 3000 Already in Use
```bash
# Find process on port 3000 and terminate
lsof -i :3000
kill -9 <PID>
# Or specify a different port
npm run dev -- -p 3001
```

### 2. Admin Login Fails
- Verify `.env.local` contains valid `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- If passwords were changed in the CMS, verify your Supabase database connection is active.
- To reset local credentials in dev mode, delete `src/data/admin-users.json` and restart the server.

### 3. Gallery Upload Fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are valid.
- Ensure the `gallery` storage bucket exists in Supabase and is marked as Public.
- Ensure uploaded images do not exceed 10MB per asset.

### 4. Google Reviews Show Fallback
- Check that `GOOGLE_PLACES_API_KEY` has *Places API (New)* enabled in Google Cloud Console.
- Verify `GOOGLE_PLACE_ID` matches your Google Maps location.
- Note: Google Places API requires billing to be enabled on your Google Cloud account (covered by Google's $200 free monthly credit).

---

## Future Roadmap

- [ ] Multi-language support (English & Urdu).
- [ ] Online custom cake inquiry and ordering form.
- [ ] Automated daily database snapshot backups.
- [ ] Webhook notifications for customer reviews and contact inquiries.

---

## Credits & Brand Identity

- **Brand:** Rahat Bakery (Laurel, MD)
- **Heritage:** Established 1950
- **Typography:** *Playfair Display* (Editorial Serif) & *Inter* (Clean Modern Sans)
- **Palette:** Warm Cream (`#faf9f6`), Saffron Gold (`#f59e0b`), and Deep Roast Charcoal (`#1c1917`)
- **Engineering:** Built with Next.js, React, Supabase, and Tailwind CSS
