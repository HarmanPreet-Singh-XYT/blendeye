import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal self-contained server bundle for the Docker image — avoids
  // shipping the full node_modules tree in the final container layer.
  output: "standalone",
};

export default nextConfig;
