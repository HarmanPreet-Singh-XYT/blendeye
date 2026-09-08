import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable standalone output for Docker container builds, not on Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
