import { NextResponse } from 'next/server';
import { testDropboxConnection, listDropboxFiles } from '@/lib/dropbox';

// Test Dropbox connection
export async function GET() {
  try {
    const result = await testDropboxConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Dropbox connection successful',
        account: result.account,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Dropbox test API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Connection test failed' },
      { status: 500 }
    );
  }
}
