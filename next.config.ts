import type { NextConfig } from "next";
import { config } from "process";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // edit: updated to new key. Was previously `allowedForwardedHosts`
      allowedOrigins: ['localhost:3000'],
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack } ) => {
    // Important: return the modified config
    config.optimization.minimize = false;
    return config
  },
  turbopack: {}
  /* config options here */
};
export default nextConfig;
