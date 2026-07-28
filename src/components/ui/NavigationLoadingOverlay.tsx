"use client";

import { useNavigationLoading } from '@/contexts/NavigationLoadingContext';
import { useLocale } from 'next-intl';

export default function NavigationLoadingOverlay() {
  const { isNavigating } = useNavigationLoading();
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (!isNavigating) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-lg border">
          {/* Simple CSS Spinner */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
            <div className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full mt-2 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
