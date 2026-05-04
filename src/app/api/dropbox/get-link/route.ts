import { NextRequest, NextResponse } from 'next/server';
import { Dropbox } from 'dropbox';

// Initialize Dropbox client with refresh token for long-term access
const getDropboxClient = () => {
  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    fetch: fetch,
  });
};

/**
 * Convert Dropbox share URL to direct download URL
 */
function convertToDirectUrl(shareUrl: string): string {
  return shareUrl
    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    .replace('dropbox.com', 'dl.dropboxusercontent.com')
    .replace('?dl=0', '');
}

// Cache for links to reduce API calls (in-memory, will reset on server restart)
const linkCache = new Map<string, { url: string; expires: number }>();

/**
 * GET /api/dropbox/get-link?path=/products/image.jpg
 * Returns a fresh temporary link for a Dropbox file
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dropboxPath = searchParams.get('path');

    if (!dropboxPath) {
      return NextResponse.json(
        { success: false, error: 'Missing path parameter' },
        { status: 400 }
      );
    }

    // Check cache first (cache for 3 hours, links expire in 4 hours)
    const cached = linkCache.get(dropboxPath);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({
        success: true,
        url: cached.url,
        cached: true,
      });
    }

    const dbx = getDropboxClient();

    // First try to get shared link (permanent)
    try {
      const existingLinks = await dbx.sharingListSharedLinks({ path: dropboxPath });
      if (existingLinks.result.links.length > 0) {
        const url = convertToDirectUrl(existingLinks.result.links[0].url);
        // Cache for 24 hours since shared links don't expire
        linkCache.set(dropboxPath, { url, expires: Date.now() + 24 * 60 * 60 * 1000 });
        return NextResponse.json({ success: true, url, type: 'shared' });
      }
    } catch (error) {
      // No existing shared link, continue to create one or get temporary
    }

    // Try to create a shared link
    try {
      const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: dropboxPath,
        settings: {
          requested_visibility: { '.tag': 'public' },
          audience: { '.tag': 'public' },
          access: { '.tag': 'viewer' },
        },
      });
      const url = convertToDirectUrl(sharedLink.result.url);
      // Cache for 24 hours since shared links don't expire
      linkCache.set(dropboxPath, { url, expires: Date.now() + 24 * 60 * 60 * 1000 });
      return NextResponse.json({ success: true, url, type: 'shared' });
    } catch (error: any) {
      // If shared link already exists (error 409), we already handled it above
      // Fall through to temporary link
    }

    // Fall back to temporary link (valid for 4 hours)
    const tempLink = await dbx.filesGetTemporaryLink({ path: dropboxPath });
    const url = tempLink.result.link;
    
    // Cache for 3 hours to be safe (links expire in 4 hours)
    linkCache.set(dropboxPath, { url, expires: Date.now() + 3 * 60 * 60 * 1000 });
    
    return NextResponse.json({
      success: true,
      url,
      type: 'temporary',
      expiresIn: '4 hours',
    });

  } catch (error: any) {
    console.error('Get link error:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get link' },
      { status: 500 }
    );
  }
}
