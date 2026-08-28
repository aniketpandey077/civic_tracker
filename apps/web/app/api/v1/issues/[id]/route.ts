import { NextRequest, NextResponse } from 'next/server';
import { getIssueByIdOrNumber, getStoredHistory, getStoredEvidence } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const issue = getIssueByIdOrNumber(params.id);

  if (!issue) {
    return NextResponse.json(
      { success: false, error: 'Complaint not found' },
      { status: 404 }
    );
  }

  const allHistory = getStoredHistory();
  const issueHistory = allHistory.filter(h => h.issue_id === issue.id);

  const allEvidence = getStoredEvidence();
  const evidence = allEvidence.find(e => e.issue_id === issue.id);

  return NextResponse.json({
    success: true,
    data: {
      issue,
      history: issueHistory,
      evidence,
    },
  });
}
