# Contributing Guidelines

Thank you for your interest in contributing to this project! As this is currently a specialized client project built for a professional portfolio, public contributions are strictly limited.

However, if you are reviewing this code for a technical evaluation or recruitment process, here is a quick guide on how the project is maintained:

## Code Standards
- **Strict TypeScript:** All components and data models are strongly typed.
- **Tailwind Best Practices:** Utility classes are used exclusively over custom CSS to ensure maximum maintainability.
- **Server Components:** By default, all Next.js components are Server Components unless interactivity strictly requires `"use client"`.

## Adding Assets
To add new menu pages or gallery images without touching the codebase:
1. Drop `.jpg` or `.png` files directly into `public/images/gallery/` or `public/images/menu/printed/`.
2. The Server Components will automatically read the file system and inject the new assets directly into the DOM upon the next build.

For any bugs or feature requests, please open an issue in the GitHub tracker.
