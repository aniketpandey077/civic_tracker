import { NextRequest, NextResponse } from 'next/server';
import { verifyResolution, getIssueByIdOrNumber } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issue = getIssueByIdOrNumber(params.id);
    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    const body = await request.json();
    const { decision, comment } = body;

    if (decision !== 'confirmed' && decision !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'decision must be confirmed or rejected' },
        { status: 400 }
      );
    }

    const ok = verifyResolution(issue.id, decision, comment);

    return NextResponse.json({
      success: ok,
      decision,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
