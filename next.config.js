// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin({
  defaultLocale: 'en',
  locales: ['en', 'ar'],
});

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'scrubstore.runasp.net',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  },
};

module.exports = withNextIntl(nextConfig);
