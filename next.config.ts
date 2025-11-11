import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  experimental: {
    optimizePackageImports: ['@tailwindcss/forms'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Production compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'], // Keep console.error in production for debugging
    } : false,
  },

  // Redirect configuration for production
  // async redirects() {
  //   return [
  //     {
  //       source: '/teacher/register',
  //       destination: '/teacher',
  //       permanent: false,
  //     },
  //   ];
  // },

  // Performance optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // wildcard: allows all domains
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable strict mode for better development practices
  reactStrictMode: true,

  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Minification settings
  swcMinify: process.env.NODE_ENV === 'production',

};

export default nextConfig;
