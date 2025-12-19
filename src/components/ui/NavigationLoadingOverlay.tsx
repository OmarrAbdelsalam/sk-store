"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationLoading } from '@/contexts/NavigationLoadingContext';
import { useLocale } from 'next-intl';

export default function NavigationLoadingOverlay() {
  const { isNavigating } = useNavigationLoading();
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-lg border"
            >
              {/* Loading Animation */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full smooth-spinner"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-8 h-8 border-2 border-transparent border-b-primary/40 rounded-full smooth-spinner"
                />
              </div>

              {/* Loading Text */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-center"
              >
                <p className="text-sm font-medium text-gray-700">
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                  className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}