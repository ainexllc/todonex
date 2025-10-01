import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Configure development indicators
  devIndicators: {
    position: 'bottom-right'
  },
  // Optimize images for better performance
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  // Improve development experience with better hot reloading
  experimental: {
    // Enable faster refresh for better hot reloading
    optimizeCss: false, // Disable CSS optimization in dev for faster reloads
  },
  // Enable React strict mode for better development warnings
  reactStrictMode: true,
  // Configure webpack for better development experience
  webpack: (config, { dev }) => {
    if (dev) {
      // Use Next.js defaults for watcher; only set a lightweight devtool
      config.devtool = 'cheap-module-source-map'
    }

    return config
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
};

export default nextConfig;
