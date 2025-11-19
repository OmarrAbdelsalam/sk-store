import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CartProvider } from '@/hooks/useCart';
import { Cairo, Inter } from 'next/font/google';
import { defaultMetadata } from '@/lib/metadata';
import SEOHead from '@/components/SEOHead';
import type { Metadata } from 'next';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = defaultMetadata;



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

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/yhouse-logo.png" />
        <meta name="theme-color" content="#042d87" />
        
        {/* Open Graph - Explicit tags for better compatibility */}
        <meta property="og:image" content="https://scrubhousev1.vercel.app/yhouse-logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter Card - Explicit tags */}
        <meta name="twitter:image" content="https://scrubhousev1.vercel.app/yhouse-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={locale === 'ar' ? cairo.className : inter.className}>    
        <SEOHead locale={locale} />
        <NextIntlClientProvider locale={locale}>
          <CartProvider>
            <Navigation />
            {children}
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
