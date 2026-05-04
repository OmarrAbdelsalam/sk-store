import { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'لوحة التحكم - SK Bags',
  description: 'لوحة تحكم إدارة المتجر',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </TooltipProvider>
  );
}