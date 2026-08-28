import { NextRequest, NextResponse } from 'next/server';
import { upvoteIssue, getIssueByIdOrNumber } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const issue = getIssueByIdOrNumber(params.id);
  if (!issue) {
    return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
  }

  const result = upvoteIssue(issue.id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: 'Failed to record upvote' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: result.issue,
    deadline_compressed: result.compressed,
  });
}
