"use client";

import { usePathname } from 'next/navigation';
import TopBanner from '@/components/TopBanner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Check if the path contains "/admin" (accounting for locale prefix like /en/admin or /ar/admin)
  const isAdmin = pathname?.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <TopBanner />
      <Navigation />
      <main id="main-content" className="pb-16 md:pb-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
