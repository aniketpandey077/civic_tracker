import { NextResponse } from 'next/server';
import { getStoredIssues, saveStoredIssues, getStoredHistory, saveStoredHistory, getStoredNotifications, saveStoredNotifications } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST() {
  const issues = getStoredIssues();
  const now = Date.now();
  let escalatedCount = 0;

  const history = getStoredHistory();
  const notifs = getStoredNotifications();

  const updatedIssues = issues.map(issue => {
    if (issue.status !== 'resolved' && !issue.escalated) {
      const isOverdue = new Date(issue.deadline_at).getTime() < now;
      if (isOverdue) {
        escalatedCount++;
        history.push({
          id: `h-esc-${Date.now()}-${issue.id}`,
          issue_id: issue.id,
          old_status: issue.status,
          new_status: issue.status,
          changed_by: 'Daily Escalation Scheduler',
          department_note: `Ticket exceeded SLA deadline. Escalated to Public Accountability Leaderboard and municipal dispatch queue.`,
          created_at: new Date().toISOString(),
        });

        notifs.unshift({
          id: `notif-esc-${Date.now()}-${issue.id}`,
          type: 'escalation',
          title: `Ticket Escalated: ${issue.complaint_number}`,
          message: `Ticket in ${issue.zone_name} has exceeded its resolution window and is now prioritized on the public accountability board.`,
          complaint_number: issue.complaint_number,
          read: false,
          created_at: new Date().toISOString(),
        });

        return {
          ...issue,
          escalated: true,
          escalation_graphic_url: '/mock-escalation-post.png',
        };
      }
    }
    return issue;
  });

  saveStoredIssues(updatedIssues);
  saveStoredHistory(history);
  saveStoredNotifications(notifs);

  return NextResponse.json({
    success: true,
    escalated_count: escalatedCount,
    checked_at: new Date().toISOString(),
  });
}
