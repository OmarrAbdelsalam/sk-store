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
    // لو عندك دومينات أخرى احتفظ بها هنا
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
};

module.exports = withNextIntl(nextConfig);
