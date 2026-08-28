import { NextRequest, NextResponse } from 'next/server';
import { detectCivicIssue } from '@/lib/aiDetector';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, category_hint } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: 'Image data is required' }, { status: 400 });
    }

    const result = await detectCivicIssue(image, category_hint);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
