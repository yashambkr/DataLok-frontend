import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
   images: {
    unoptimized: true,
    domains: [
      '164.90.209.220',
      'api.leyu.icogacc.com',
      'leyu-frontend.vercel.app',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '164.90.209.220',
        port: '9000',
        pathname: '/leyu/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXTAUTH_SECRET:process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL:process.env.NEXTAUTH_URL


    // Avoid exposing sensitive variables like NEXTAUTH_SECRET here
  },
};

export default nextConfig;
