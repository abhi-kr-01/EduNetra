import { NextRequest, NextResponse } from 'next/server';

// Supabase storage is deprecated; Cloudinary handles uploads directly from the browser.
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Supabase storage has been replaced by Cloudinary uploads.',
    },
    { status: 410 }
  );
}
