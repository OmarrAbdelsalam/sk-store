import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://housescrub.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ar', 'en'];
  const routes = ['', '/cart', '/checkout', '/about', '/contact'];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add routes for each locale
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: {
            ar: `${siteUrl}/ar${route}`,
            en: `${siteUrl}/en${route}`,
          },
        },
      });
    });
  });

  return sitemap;
}
