import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images:{
    domains: ["tse3.mm.bing.net"],
    formats: ["image/avif", "image/webp"],
  },

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
