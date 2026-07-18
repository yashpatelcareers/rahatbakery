# Rahat Bakery | Premium Digital Storefront

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

A high-performance, fully responsive, and elegant digital storefront designed and engineered for **Rahat Bakers & Sweets**. Built with a strict mobile-first approach, this project serves as a modern web presence focused on ultra-premium UI/UX, lightning-fast static load times, and maintainability.

## 🌟 Key Features

- **Michelin-Style Menu Layout:** A robust, responsive CSS Grid layout utilizing `grid-flow-dense`. It automatically counts category items and seamlessly balances them across columns to utilize horizontal desktop space efficiently while gracefully collapsing to a single column on mobile.
- **Dynamic File-System Architecture:** The Gallery and Printed Menu components automatically scan local directories via Next.js Server Components. New assets render instantly upon being dropped into their respective folders—no code updates required.
- **Cinematic UI/UX:** Expertly crafted visual hierarchy featuring `Playfair Display` and `Inter`, combined with subtle image lightboxes, grayscale hover transitions, and generous layout spacing.
- **Optimized Performance:** Fully optimized asset delivery via the Next.js `<Image>` component, ensuring zero Cumulative Layout Shift (CLS) and perfect Core Web Vitals.

## 🚀 Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript
- **Icons:** Lucide React
- **Data:** Local JSON (Database-free for maximum edge speed)

## 📂 Architecture Overview

```text
src/
├── app/
│   ├── page.tsx           # Cinematic landing page
│   ├── menu/page.tsx      # Responsive CSS Grid menu layout
│   ├── gallery/page.tsx   # Dynamic masonry photo gallery
│   └── about/page.tsx     # Bakery history & Google Maps integration
├── components/
│   ├── layout/            # Navbar & Footer
│   └── ui/                # Reusable components (Lightboxes, Containers)
├── data/
│   └── menu.json          # Highly maintainable product configurations
└── lib/
    └── images.ts          # Server-side image mapping & fallback logic
```

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rahat-bakery.git
   cd rahat-bakery
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design Philosophy

This project was built to completely replace the standard, clunky "e-commerce catalog" feel with the luxurious experience of walking into a high-end bakery. Every margin, typographic choice, and transition was purposefully engineered to keep the focus entirely on the artisan products.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
