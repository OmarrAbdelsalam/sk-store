'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from './ProtectedRoute';
import PortalLayout from './layout/PortalLayout';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  
  // Check if current path is login page (handles both /admin/login and /ar/admin/login, /en/admin/login etc.)
  const isLoginPage = pathname?.includes('/admin/login');

  // For login page, skip ProtectedRoute and PortalLayout
  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        <PortalLayout>
          {children}
        </PortalLayout>
      </ProtectedRoute>
    </QueryClientProvider>
  );
}