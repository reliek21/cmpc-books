import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    // Enable server actions if needed
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'cmcp-books'
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development'
  }

  // API routes - Commented out to use our own API routes
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`
  //     }
  //   ]
  // }
};

export default nextConfig;
