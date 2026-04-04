import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Cloudinary delivery URLs are already signed/public, so this endpoint is now a no-op.
export async function GET(req: NextRequest) {
  const user = authMiddleware(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing token' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const directUrl = searchParams.get('url');

  if (directUrl) {
    return NextResponse.json({ success: true, signedUrl: directUrl }, { status: 200 });
  }

  return NextResponse.json(
    {
      error: 'Signed URLs are no longer required. Use videoMetadata.videoUrl directly.',
    },
    { status: 410 }
  );
}