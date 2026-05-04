import { NextRequest, NextResponse } from 'next/server';
import { uploadToDropbox } from '@/lib/dropbox';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '/uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const uniqueFileName = `${baseName}_${timestamp}.${extension}`;

    // Upload to Dropbox
    const result = await uploadToDropbox(buffer, uniqueFileName, folder);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          // dropboxPath is the primary value to store in database (never expires)
          dropboxPath: result.dropboxPath,
          // url is provided for immediate display (may be temporary, expires in 4 hours)
          url: result.directUrl,
          sharedUrl: result.sharedUrl,
          fileName: result.fileName,
          size: result.size,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
