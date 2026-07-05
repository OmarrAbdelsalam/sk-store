import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import ScrollToTop from '@/components/ScrollToTop';
import { CartProvider } from '@/hooks/useCart';
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext';
import NavigationLoadingOverlay from '@/components/ui/NavigationLoadingOverlay';
import { Toaster } from '@/components/ui/toaster';
import CommonLayout from '@/components/CommonLayout';
import TopBanner from '@/components/TopBanner';
import { Cairo, Inter, Playfair_Display, Boogaloo } from 'next/font/google';
import { generateDefaultMetadata } from '@/lib/metadata';
import SEOHead from '@/components/SEOHead';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import StorefrontProviders from '@/components/StorefrontProviders';
import { siteOgImage } from '@/lib/site';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const boogaloo = Boogaloo({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-boogaloo',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateDefaultMetadata(locale);
}



export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; 
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = (locale as string) === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/SK_Logo.svg" />
        <meta name="theme-color" content="#111111" />
        
        {/* Open Graph - Explicit tags for better compatibility */}
        <meta property="og:image" content={siteOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter Card - Explicit tags */}
        <meta name="twitter:image" content={siteOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={`${cairo.variable} ${inter.variable} ${playfair.variable} ${boogaloo.variable} ${(locale as string) === 'ar' ? 'font-cairo' : 'font-sans'}`}>
        <SEOHead locale={locale} />
        <ScrollToTop />
        <NextIntlClientProvider locale={locale}>
          <NavigationLoadingProvider>
            <StorefrontProviders>
              <CommonLayout topBanner={<TopBanner />}>
                {children}
              </CommonLayout>
              <NavigationLoadingOverlay />
              <Toaster />
            </StorefrontProviders>
          </NavigationLoadingProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
