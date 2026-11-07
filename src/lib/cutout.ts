/**
 * Product photos are shot on near-white. To make that white become exactly
 * the gray tile colour (--ds-beige, #F5F5F5) on EVERY device, the pixels are
 * changed on the server (src/app/api/cutout/route.ts) instead of with CSS
 * blend modes / filters — iPhone Safari renders those differently, which
 * left a lighter box around every bag on iOS.
 *
 * cutoutSrc(url, width) → the processed, resized WebP for that photo.
 */

// Fixed widths so the CDN only ever caches a handful of variants per photo.
export const CUTOUT_WIDTHS = [128, 256, 384, 640, 828, 1080, 1600] as const;

export function cutoutWidth(requested: number): number {
  return CUTOUT_WIDTHS.find((w) => w >= requested) ?? CUTOUT_WIDTHS[CUTOUT_WIDTHS.length - 1];
}

export function cutoutSrc(src: string | null | undefined, width = 828): string {
  if (!src) return "";
  // Nothing to melt in vector logos or inline data.
  if (src.startsWith("data:") || src.startsWith("blob:") || /\.svg(\?|$)/i.test(src)) return src;
  // Already processed.
  if (src.startsWith("/api/cutout")) return src;
  return `/api/cutout?u=${encodeURIComponent(src)}&w=${cutoutWidth(width)}`;
}
