import { Dropbox } from 'dropbox';

// Initialize Dropbox client with refresh token for long-term access
const getDropboxClient = () => {
  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    fetch: fetch, // Explicitly pass global fetch
  });
};

/**
 * Convert Dropbox share URL to direct download URL
 */
export function convertToDirectUrl(shareUrl: string): string {
  return shareUrl
    .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    .replace('dropbox.com', 'dl.dropboxusercontent.com')
    .replace('?dl=0', '');
}

/**
 * Upload file to Dropbox
 */
export async function uploadToDropbox(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = '/uploads'
): Promise<{
  success: boolean;
  dropboxPath?: string;
  directUrl?: string;
  sharedUrl?: string;
  fileName?: string;
  size?: number;
  error?: string;
}> {
  try {
    const dbx = getDropboxClient();
    const dropboxPath = `${folder}/${fileName}`;

    // Upload file to Dropbox
    const uploadResponse = await dbx.filesUpload({
      path: dropboxPath,
      contents: fileBuffer,
      mode: { '.tag': 'overwrite' },
      autorename: true,
    });

    console.log('Dropbox upload successful:', uploadResponse.result.path_display);

    // Try to create shared link
    let directUrl: string | null = null;
    let sharedUrl: string | null = null;

    try {
      // Try shared link first
      const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: dropboxPath,
        settings: {
          requested_visibility: { '.tag': 'public' },
          audience: { '.tag': 'public' },
          access: { '.tag': 'viewer' },
        },
      });
      sharedUrl = sharedLinkResponse.result.url;
      directUrl = sharedUrl ? convertToDirectUrl(sharedUrl) : null;
      console.log('Created shared link:', directUrl);
    } catch (shareError: any) {
      console.log('Shared link creation failed, checking for existing link...');

      // Try to find existing shared link
      try {
        const existingLinksResponse = await dbx.sharingListSharedLinks({
          path: dropboxPath,
        });

        if (existingLinksResponse.result.links.length > 0) {
          sharedUrl = existingLinksResponse.result.links[0].url;
          directUrl = sharedUrl ? convertToDirectUrl(sharedUrl) : null;
          console.log('Using existing shared link:', directUrl);
        }
      } catch (listError) {
        console.log('Could not get existing shared links');
      }

      // If shared link failed, try temporary link
      if (!directUrl) {
        console.warn('WARNING: Falling back to TEMPORARY link. This link will expire in 4 hours!');
        try {
          const tempLinkResponse = await dbx.filesGetTemporaryLink({
            path: dropboxPath,
          });
          directUrl = tempLinkResponse.result.link;
          console.log('Using temporary link:', directUrl);
        } catch (tempError) {
          console.log('Temporary link also failed');
          directUrl = `https://www.dropbox.com/preview${dropboxPath}`;
        }
      }
    }

    return {
      success: true,
      dropboxPath: uploadResponse.result.path_display || dropboxPath,
      sharedUrl: sharedUrl || directUrl || undefined,
      directUrl: directUrl || undefined,
      fileName: uploadResponse.result.name,
      size: uploadResponse.result.size,
    };
  } catch (error: any) {
    console.error('Dropbox upload error:', error);

    if (error.status === 401) {
      return { success: false, error: 'Dropbox authentication failed. Please check access token.' };
    }

    if (error.status === 429) {
      return { success: false, error: 'Dropbox rate limit exceeded. Please try again later.' };
    }

    return { success: false, error: `Dropbox upload failed: ${error.message}` };
  }
}

/**
 * Delete file from Dropbox
 */
export async function deleteFromDropbox(dropboxPath: string): Promise<boolean> {
  try {
    const dbx = getDropboxClient();
    await dbx.filesDeleteV2({ path: dropboxPath });
    console.log('Dropbox file deleted:', dropboxPath);
    return true;
  } catch (error) {
    console.error('Dropbox delete error:', error);
    return false;
  }
}

/**
 * Delete file by URL (extracts path from Dropbox URL)
 */
export async function deleteByUrl(dropboxUrl: string): Promise<boolean> {
  try {
    // Extract path from Dropbox URL
    // URL format: https://dl.dropboxusercontent.com/uploads/filename.jpg
    const urlObj = new URL(dropboxUrl);
    const pathMatch = urlObj.pathname;
    
    if (pathMatch) {
      return await deleteFromDropbox(pathMatch);
    }
    
    console.warn('Could not extract Dropbox path from URL:', dropboxUrl);
    return false;
  } catch (error) {
    console.error('Error deleting by URL:', error);
    return false;
  }
}

/**
 * Test Dropbox connection
 */
export async function testDropboxConnection(): Promise<{
  success: boolean;
  account?: string;
  error?: string;
}> {
  try {
    const dbx = getDropboxClient();
    const response = await dbx.usersGetCurrentAccount();
    return {
      success: true,
      account: response.result.email,
    };
  } catch (error: any) {
    console.error('Dropbox connection test failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List files in Dropbox folder
 */
export async function listDropboxFiles(folder: string = '/uploads'): Promise<{
  success: boolean;
  files?: Array<{ name: string; path: string; size?: number }>;
  error?: string;
}> {
  try {
    const dbx = getDropboxClient();
    const response = await dbx.filesListFolder({ path: folder });
    
    const files = response.result.entries.map((entry: any) => ({
      name: entry.name,
      path: entry.path_display || entry.path_lower || '',
      size: 'size' in entry ? entry.size : undefined,
    }));

    return { success: true, files };
  } catch (error: any) {
    console.error('Dropbox list files error:', error);
    return { success: false, error: error.message };
  }
}
