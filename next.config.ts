import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/qr",
        destination: "/menu",
        permanent: true,
      },
      {
        source: "/admin/store",
        destination: "/admin/info",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
