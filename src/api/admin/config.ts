// Dropbox Configuration for File Uploads
// Only Dropbox integration is kept for file management

export const DROPBOX_CONFIG = {
  // Dropbox API endpoints
  uploadEndpoint: "/api/dropbox/upload",
  deleteEndpoint: "/api/dropbox/delete", 
  authEndpoint: "/api/dropbox-auth",
  testEndpoint: "/api/dropbox/test",
} as const;

// Mock API URLs for compatibility with existing admin components
export const API_URLS = {
  dashboard: "https://mock-api.example.com/dashboard",
  masaha: "https://mock-api.example.com/masaha",
  backend: "https://mock-api.example.com/api",
  supabase: "https://mock-supabase.example.com",
} as const;

// Helper to get full image URL (Dropbox only)
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If already a full URL, return as is (but handle dropbox conversion)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('dropbox.com')) {
      return path.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    }
    return path;
  }
  
  // For local development or fallback
  return path.startsWith('/') ? path : `/${path}`;
};

// Convert Dropbox share URL to direct download URL
export const convertToDirectUrl = (shareUrl: string): string => {
  return shareUrl
    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    .replace('dropbox.com', 'dl.dropboxusercontent.com')
    .replace('?dl=0', '');
};