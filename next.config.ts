import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.100",
    "*.local",
    "*.lan",
  ],
};

export default nextConfig;
