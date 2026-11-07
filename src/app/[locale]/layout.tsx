import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import ScrollToTop from '@/components/ScrollToTop';
import { CartProvider } from '@/hooks/useCart';
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext';
import { Toaster } from '@/components/ui/toaster';
import CommonLayout from '@/components/CommonLayout';
import TopBanner from '@/components/TopBanner';
import { Cairo, Instrument_Sans, Nunito } from 'next/font/google';
import { generateDefaultMetadata } from '@/lib/metadata';
import SEOHead from '@/components/SEOHead';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import StorefrontProviders from '@/components/StorefrontProviders';
import { siteOgImage } from '@/lib/site';

// Fonts — see DESIGN_SYSTEM.md › Typography (Shopify "Prestige" pairing).
// Nunito = body, Instrument Sans = headings + tracked uppercase UI,
// Cairo = Arabic.
const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Variable font (no fixed weights): Turbopack fails to resolve Instrument
// Sans when explicit weights are requested.
const display = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cairo',
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
        <meta name="theme-color" content="#ffffff" />
        
        {/* Open Graph - Explicit tags for better compatibility */}
        <meta property="og:image" content={siteOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter Card - Explicit tags */}
        <meta name="twitter:image" content={siteOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={`${body.variable} ${display.variable} ${cairo.variable} ${(locale as string) === 'ar' ? 'font-arabic' : 'font-sans'}`}>
        <SEOHead locale={locale} />
        <ScrollToTop />
        <NextIntlClientProvider locale={locale}>
          <NavigationLoadingProvider>
            <StorefrontProviders>
              <CommonLayout topBanner={<TopBanner />}>
                {children}
              </CommonLayout>
              <Toaster />
            </StorefrontProviders>
          </NavigationLoadingProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
