import { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ar', 'en'];
  const routes = ['', '/products', '/cart', '/checkout', '/my-orders'];

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
