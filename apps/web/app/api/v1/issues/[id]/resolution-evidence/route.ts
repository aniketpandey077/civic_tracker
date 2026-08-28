import { NextRequest, NextResponse } from 'next/server';
import { submitResolutionEvidence, getIssueByIdOrNumber } from '@/lib/store';

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
    const { before_photo_url, after_photo_url, description, submitted_by, latitude, longitude } = body;

    if (!after_photo_url || !description) {
      return NextResponse.json(
        { success: false, error: 'after_photo_url and description are required' },
        { status: 400 }
      );
    }

    const evidence = submitResolutionEvidence({
      issue_id: issue.id,
      before_photo_url: before_photo_url || issue.photo_url,
      after_photo_url,
      description,
      submitted_by: submitted_by || 'Department Maintenance Team',
      latitude: latitude || issue.latitude,
      longitude: longitude || issue.longitude,
    });

    return NextResponse.json({
      success: true,
      data: evidence,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
