import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RAHAT BAKERY | Premium Sweets in Laurel, MD",
    template: "%s | RAHAT BAKERY"
  },
  description: "Authentic South Asian sweets, fresh bakery items, and custom cakes located at 13919 Baltimore Ave Unit 4, Laurel, MD.",
  keywords: ["Rahat Bakery", "Laurel MD", "South Asian Sweets", "Custom Cakes", "Bakery"],
  authors: [{ name: "RAHAT BAKERY" }],
  creator: "Rahat Bakers",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rahatbakers.com",
    title: "RAHAT BAKERY | Laurel, MD",
    description: "Authentic South Asian sweets, fresh bakery items, and custom cakes.",
    siteName: "RAHAT BAKERY",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { SiteLayout } from "@/components/layout/site-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteLayout>{children}</SiteLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
