import { NextRequest, NextResponse } from 'next/server';
import { listDropboxFiles } from '@/lib/dropbox';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '/uploads';

    const result = await listDropboxFiles(folder);

    if (result.success) {
      return NextResponse.json({
        success: true,
        files: result.files,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('List files API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
