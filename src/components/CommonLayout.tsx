"use client";

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useSettledOrderRedirect } from '@/hooks/useSettledOrderRedirect';

export default function CommonLayout({ children, topBanner }: { children: React.ReactNode, topBanner?: React.ReactNode }) {
  const pathname = usePathname();
  // Check if the path contains "/admin" (accounting for locale prefix like /en/admin or /ar/admin)
  const isAdmin = pathname?.includes('/admin');

  // Site-wide: someone who paid and never made it back — the gateway didn't
  // redirect, or they closed the tab — is carried to their receipt from
  // whatever page they reopen the shop on, not just the cart. Skips the
  // confirmation page itself, which is already the destination, and the admin
  // panel, which has nothing to do with a customer's order.
  useSettledOrderRedirect({
    enabled: !isAdmin && !pathname?.startsWith('/order-success'),
  });

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {topBanner}
      <Navigation />
      <div className="bg-white flex flex-col min-h-[calc(100vh-100px)]">
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
