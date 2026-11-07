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
      className="fixed inset-0 z-50 bg-white/80 animate-fade-in"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-ds border border-gray-200 bg-background p-8">
          {/* Simple CSS Spinner */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 animate-spin rounded-pill border border-gray-200 border-t-primary" />
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <p className="ds-label text-ink">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
            <div className="mx-auto mt-2 h-px w-24 bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
