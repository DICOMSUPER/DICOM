import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // resolve fs for one of the dependencies
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
        },
      };
    }

    // loading our wasm files as assets
    config.module.rules.push({
      test: /\.wasm/,
      type: "asset/resource",
    });

    return config;
  },
  turbopack: {
    resolveAlias: {
      fs: "empty",
    },
  },
};

export default nextConfig;
