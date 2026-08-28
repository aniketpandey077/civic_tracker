import { NextRequest, NextResponse } from 'next/server';
import { updateIssueStatus, getIssueByIdOrNumber } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issue = getIssueByIdOrNumber(params.id);
    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, note, changed_by } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = updateIssueStatus(issue.id, status, note, changed_by || 'Department Staff');

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
