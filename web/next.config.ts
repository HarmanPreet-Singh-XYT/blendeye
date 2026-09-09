import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable standalone output for Docker container builds, not on Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "vcbclecweorugfucdubm.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
