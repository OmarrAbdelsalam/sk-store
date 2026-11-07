'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDropboxImage } from '@/hooks/useDropboxImage';
import { Loader2 } from 'lucide-react';
import { cutoutSrc } from '@/lib/cutout';

interface DropboxImageProps {
  src: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  showLoader?: boolean;
  fallbackSrc?: string;
  /** Turn the photo's white background into the tile gray (server-side, see lib/cutout). */
  cutout?: boolean;
  /** Pixel width to request when `cutout` is on. */
  cutoutWidth?: number;
}

/**
 * Image component that automatically handles Dropbox URLs
 * - For Dropbox paths (starting with /), fetches a fresh link
 * - For regular URLs, uses them directly
 * - Shows a loader while fetching
 * - Falls back to placeholder on error
 */
export default function DropboxImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  style,
  priority = false,
  quality,
  sizes,
  onLoad,
  onError,
  showLoader = true,
  fallbackSrc = '/placeholder.png',
  cutout = false,
  cutoutWidth = 828,
}: DropboxImageProps) {
  const { url, loading, error } = useDropboxImage(src);
  const [imgError, setImgError] = useState(false);
  // The processed (gray-background) version failed → fall back to the original.
  const [cutoutFailed, setCutoutFailed] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImgError(false);
    setCutoutFailed(false);
  }, [src]);

  const handleError = () => {
    if (cutout && !cutoutFailed) {
      setCutoutFailed(true);
      return;
    }
    setImgError(true);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const baseUrl = imgError || error ? fallbackSrc : url;
  const finalUrl = cutout && !cutoutFailed && !imgError && !error ? cutoutSrc(baseUrl, cutoutWidth) || baseUrl : baseUrl;

  if (loading && showLoader) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
      >
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  // Use regular img tag for external URLs to avoid Next.js image optimization issues
  if (finalUrl.startsWith('http') || finalUrl.startsWith('/api/cutout')) {
    return (
      <img
        src={finalUrl}
        alt={alt}
        className={className}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          objectFit: 'cover',
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // Use Next.js Image for local images
  return (
    <Image
      src={finalUrl}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      style={style}
      priority={priority}
      quality={quality}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      unoptimized
    />
  );
}

/**
 * Simple img tag version for cases where Next.js Image is not needed
 */
export function DropboxImg({
  src,
  alt,
  className = '',
  style,
  onLoad,
  onError,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const { url, loading, error } = useDropboxImage(src);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={style}
      >
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  return (
    <img
      src={imgError || error ? '/placeholder.png' : url}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={() => {
        setImgError(true);
        onError?.();
      }}
    />
  );
}
