import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};// next.config.js
module.exports = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;
