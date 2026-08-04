import { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/products', '/cart', '/checkout', '/my-orders'];

  // One language, served from unprefixed paths (`localePrefix: 'never'`), so
  // there are no per-locale URLs or hreflang alternates to declare. The old
  // /ar/… entries pointed at pages that no longer resolve, and the /en/… ones
  // only redirected — a sitemap full of redirects and 404s is worse than none.
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
