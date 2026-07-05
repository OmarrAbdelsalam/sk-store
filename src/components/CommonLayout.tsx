"use client";

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CommonLayout({ children, topBanner }: { children: React.ReactNode, topBanner?: React.ReactNode }) {
  const pathname = usePathname();
  // Check if the path contains "/admin" (accounting for locale prefix like /en/admin or /ar/admin)
  const isAdmin = pathname?.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {topBanner}
      <Navigation />
      <div className="bg-white flex flex-col min-h-[calc(100vh-100px)]">
        <main id="main-content" className="flex-grow pb-20 md:pb-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
