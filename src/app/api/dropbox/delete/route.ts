import { NextRequest, NextResponse } from 'next/server';
import { deleteFromDropbox, deleteByUrl } from '@/lib/dropbox';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, url } = body;

    if (!path && !url) {
      return NextResponse.json(
        { success: false, error: 'No path or url provided' },
        { status: 400 }
      );
    }

    let success = false;

    if (path) {
      // Delete by Dropbox path
      success = await deleteFromDropbox(path);
    } else if (url) {
      // Delete by URL
      success = await deleteByUrl(url);
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete file from Dropbox' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
