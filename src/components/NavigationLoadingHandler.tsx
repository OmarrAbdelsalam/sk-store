"use client";

import { useEffect } from 'react';
import { useNavigationLoading } from '@/contexts/NavigationLoadingContext';

export default function NavigationLoadingHandler() {
  const { stopNavigation } = useNavigationLoading();

  useEffect(() => {
    // Stop loading when component mounts (page has loaded)
    const timer = setTimeout(() => {
      stopNavigation();
    }, 100); // Small delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, [stopNavigation]);

  return null;
}