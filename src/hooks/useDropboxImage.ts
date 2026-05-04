'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Image URL hook - Supabase Storage version
 * No more Dropbox. All images are either:
 * - Full https:// URLs (Supabase Storage public URLs)
 * - Local /public files (e.g. /hero.webp)
 * Both are returned as-is with no async fetching needed.
 */
export function useDropboxImage(path: string | undefined): {
  url: string;
  loading: boolean;
  error: boolean;
  refresh: () => void;
} {
  const resolvedUrl = resolveImageUrl(path);

  return {
    url: resolvedUrl,
    loading: false,
    error: false,
    refresh: () => {},
  };
}

/**
 * Resolve any image path to a displayable URL.
 * - https:// → return as-is (Supabase Storage or any CDN)
 * - /something → return as-is (local public file)
 * - empty/null → placeholder
 */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path) return '/placeholder-product.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return '/placeholder-product.jpg';
}

/**
 * Hook for multiple image URLs
 */
export function useDropboxImages(paths: (string | undefined)[]): {
  urls: Map<string, string>;
  loading: boolean;
  allLoaded: boolean;
} {
  const urls = new Map<string, string>();
  paths.forEach(p => {
    if (p) urls.set(p, resolveImageUrl(p));
  });

  return { urls, loading: false, allLoaded: true };
}
