import { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import './admin.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
    <div className={`${jakarta.variable} ${outfit.variable} rm-admin-scope antialiased`} dir="ltr">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </TooltipProvider>
    </div>
  );
}