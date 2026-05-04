/**
 * Image URL Utility - Supabase Storage version
 * Dropbox is no longer used. All images are Supabase Storage URLs or local public files.
 */

// No-op cache (kept for API compatibility)
export function checkCache(_path: string): string | null {
  return null;
}

export function isDropboxPath(_path: string): boolean {
  return false;
}

export function isDropboxUrl(_url: string): boolean {
  return false;
}

/**
 * Resolve any image path to a displayable URL.
 * - https:// → return as-is (Supabase Storage)
 * - /something → return as-is (local public file)
 * - empty → placeholder
 */
export async function getDropboxImageUrl(path: string): Promise<string> {
  if (!path) return '/placeholder-product.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return '/placeholder-product.jpg';
}

export function getImageUrlSync(path: string): string {
  if (!path) return '/placeholder-product.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return '/placeholder-product.jpg';
}

export async function preloadImageUrls(paths: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  paths.forEach(p => results.set(p, getImageUrlSync(p)));
  return results;
}
