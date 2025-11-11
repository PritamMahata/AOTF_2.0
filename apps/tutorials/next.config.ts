import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@aotf/lib', '@aotf/models', '@aotf/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ✅ Allow all HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // ✅ (Optional) Allow all HTTP domains too
      },
    ],
  },
}

export default nextConfig
