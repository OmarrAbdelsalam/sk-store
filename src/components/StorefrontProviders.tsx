"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/hooks/useCart";
import { useState, type ReactNode } from "react";

export default function StorefrontProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
