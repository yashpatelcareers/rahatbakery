import type { SiteConfig } from "@/types";

/**
 * Single source of truth for business information, hours, contact, and social links.
 * Used globally across Navbar, MobileNav, Footer, Homepage, and About Us page.
 */
export const SITE_CONFIG: SiteConfig = {
  name: "RAHAT BAKERY",
  description: "Authentic South Asian sweets, fresh bakery items, and custom cakes in Laurel, MD",
  url: "https://rahatbakers.com",
  social: {
    instagram: "https://www.instagram.com/rahatbakerymd/",
    tiktok: "https://www.tiktok.com/discover/rahat-bakery",
  },
  contact: {
    phone: "(240) 386-1236",
    email: "hello@rahatbakers.com",
    address: "13919 Baltimore Ave Unit 4, Laurel, MD 20707",
  },
  hours: [
    { day: "Sunday – Thursday", hours: "1:00 PM – 9:00 PM" },
    { day: "Friday – Saturday", hours: "1:00 PM – 10:00 PM" },
  ],
};
