import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/qr",
        destination: "/menu",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
