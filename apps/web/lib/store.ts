import { CivicIssue, IssueStatusHistory, ResolutionEvidence, ResolutionVerification, NotificationItem, DashboardMetrics, ZoneLeaderboardAccountability, ZoneLeaderboardPerformance, ZoneBudgetData } from './types';
import { INITIAL_ISSUES, INITIAL_STATUS_HISTORY, INITIAL_EVIDENCE, INITIAL_NOTIFICATIONS } from './seedData';
import { ADMIN_ZONES } from './zoneMatcher';
import { AnalyzeApiResponse } from './aiDetector';

import { is45DaysOverdue, generateDepartmentEscalationEmail } from './emailEscalation';

const STORAGE_KEYS = {
  ISSUES: 'civictrack_issues',
  HISTORY: 'civictrack_status_history',
  EVIDENCE: 'civictrack_evidence',
  VERIFICATIONS: 'civictrack_verifications',
  NOTIFICATIONS: 'civictrack_notifications',
};

// In-memory memory fallback for SSR / API routes
let memoryIssues: CivicIssue[] = [...INITIAL_ISSUES];
let memoryHistory: IssueStatusHistory[] = [...INITIAL_STATUS_HISTORY];
let memoryEvidence: ResolutionEvidence[] = [...INITIAL_EVIDENCE];
let memoryVerifications: ResolutionVerification[] = [];
let memoryNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export function checkAndTrigger45DayEscalations(issues: CivicIssue[]): { issues: CivicIssue[]; updated: boolean } {
  let hasChanges = false;
  const updatedIssues = issues.map((issue) => {
    if (is45DaysOverdue(issue) && !issue.escalation_email_sent_at) {
      hasChanges = true;
      const emailPayload = generateDepartmentEscalationEmail(issue);

      // Log official escalation history entry
      const history = getStoredHistory();
      saveStoredHistory([
        ...history,
        {
          id: `h-45day-${Date.now()}-${issue.id}`,
          issue_id: issue.id,
          new_status: issue.status,
          changed_by: 'CivicTrack Automated 45-Day Governance Engine',
          department_note: `CRITICAL 45-DAY SLA VIOLATION: Official escalation notice dispatched to ${emailPayload.to_email} (${issue.department}). Overdue by ${emailPayload.days_overdue} days.`,
          created_at: new Date().toISOString(),
        },
      ]);

      return {
        ...issue,
        escalated: true,
        department_email: emailPayload.to_email,
        escalation_email_sent_at: emailPayload.dispatch_timestamp,
      };
    }
    return issue;
  });

  return { issues: updatedIssues, updated: hasChanges };
}

// Helper to get stored data (handles browser vs SSR)
export function getStoredIssues(): CivicIssue[] {
  let issues = memoryIssues;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (saved) {
      try {
        issues = JSON.parse(saved);
      } catch {
        // use memory
      }
    }
  }

  const { issues: checkedIssues, updated } = checkAndTrigger45DayEscalations(issues);
  if (updated) {
    saveStoredIssues(checkedIssues);
  }

  return checkedIssues;
}

export function saveStoredIssues(issues: CivicIssue[]) {
  memoryIssues = issues;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    window.dispatchEvent(new Event('civictrack_store_updated'));
  }
}

export function getStoredHistory(): IssueStatusHistory[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use memory
      }
    }
  }
  return memoryHistory;
}

export function saveStoredHistory(history: IssueStatusHistory[]) {
  memoryHistory = history;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }
}

export function getStoredEvidence(): ResolutionEvidence[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use memory
      }
    }
  }
  return memoryEvidence;
}

export function saveStoredEvidence(evidence: ResolutionEvidence[]) {
  memoryEvidence = evidence;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
  }
}

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use memory
      }
    }
  }
  return memoryNotifications;
}

export function saveStoredNotifications(notifs: NotificationItem[]) {
  memoryNotifications = notifs;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
}

// Issue Operations
export function addIssue(issue: CivicIssue): CivicIssue {
  const issues = getStoredIssues();
  const updated = [issue, ...issues];
  saveStoredIssues(updated);

  // Add initial history
  const history = getStoredHistory();
  const newHist: IssueStatusHistory = {
    id: `h-${Date.now()}`,
    issue_id: issue.id,
    new_status: 'pending',
    changed_by: 'System / Citizen Reporter',
    department_note: `Ticket created. AI validation (${(issue.ai_confidence * 100).toFixed(1)}% confidence) confirmed infrastructure defect. Target SLA set to 15 days.`,
    created_at: new Date().toISOString(),
  };
  saveStoredHistory([...history, newHist]);

  // Add notification
  const notifs = getStoredNotifications();
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    type: 'nearby_issue',
    title: 'New Issue Registered',
    message: `Your report for ${issue.category} at ${issue.zone_name} has been filed as ${issue.complaint_number}.`,
    complaint_number: issue.complaint_number,
    read: false,
    created_at: new Date().toISOString(),
  };
  saveStoredNotifications([newNotif, ...notifs]);

  return issue;
}

export function getIssueByIdOrNumber(idOrNumber: string): CivicIssue | undefined {
  const issues = getStoredIssues();
  return issues.find(i => i.id === idOrNumber || i.complaint_number.toLowerCase() === idOrNumber.toLowerCase());
}

export function upvoteIssue(issueId: string): { success: boolean; issue?: CivicIssue; compressed?: boolean } {
  const issues = getStoredIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index === -1) return { success: false };

  const current = issues[index];
  const newCount = (current.upvote_count || 0) + 1;
  let compressed = false;
  let deadline = current.deadline_at;

  // 500 UPVOTES RULE: Compresses 15-day deadline to 5 days from report date
  if (newCount >= 500 && current.upvote_count < 500) {
    compressed = true;
    const reportedTime = new Date(current.reported_at).getTime();
    deadline = new Date(reportedTime + 5 * 24 * 60 * 60 * 1000).toISOString();

    // Log history
    const history = getStoredHistory();
    saveStoredHistory([
      ...history,
      {
        id: `h-upvote-${Date.now()}`,
        issue_id: current.id,
        new_status: current.status,
        changed_by: 'Community Upvote Surge',
        department_note: 'Ticket exceeded 500 community upvotes! Resolution deadline automatically compressed to 5 days under CivicTrack Accountability Rule.',
        created_at: new Date().toISOString(),
      }
    ]);
  }

  const updatedIssue: CivicIssue = {
    ...current,
    upvote_count: newCount,
    deadline_at: deadline,
    has_upvoted: true,
  };

  issues[index] = updatedIssue;
  saveStoredIssues(issues);

  return { success: true, issue: updatedIssue, compressed };
}

export function attachEvidenceAndUpvote(
  issueId: string,
  photoUrl: string,
  reporterName: string = 'Citizen Reporter'
): CivicIssue | undefined {
  const issues = getStoredIssues();
  const index = issues.findIndex(i => i.id === issueId || i.complaint_number === issueId);
  if (index === -1) return undefined;

  const current = issues[index];
  const photos = current.additional_photos || [];
  const updatedPhotos = photoUrl && !photos.includes(photoUrl) ? [...photos, photoUrl] : photos;

  const updated: CivicIssue = {
    ...current,
    upvote_count: (current.upvote_count || 1) + 1,
    additional_photos: updatedPhotos,
    has_upvoted: true,
  };

  issues[index] = updated;
  saveStoredIssues(issues);

  // Add history log
  const history = getStoredHistory();
  saveStoredHistory([
    ...history,
    {
      id: `h-evidence-${Date.now()}`,
      issue_id: current.id,
      new_status: current.status,
      changed_by: reporterName,
      department_note: `Citizen attached additional photo evidence and upvoted ticket within 50m vicinity. Total upvotes: ${updated.upvote_count}.`,
      created_at: new Date().toISOString(),
    },
  ]);

  return updated;
}

export function updateIssueAiResults(issueId: string, apiResult: AnalyzeApiResponse): CivicIssue | undefined {
  const issues = getStoredIssues();
  const index = issues.findIndex(i => i.id === issueId || i.complaint_number === issueId);
  if (index === -1) return undefined;

  const current = issues[index];
  const updated: CivicIssue = {
    ...current,
    ai_analysis_status: 'completed',
    ai_severity: apiResult.severity,
    ai_count: apiResult.count,
    ai_detections: apiResult.detections || [],
    ai_description: apiResult.description,
    ai_confidence: apiResult.detections?.[0]?.confidence ?? current.ai_confidence ?? 0.95,
  };

  issues[index] = updated;
  saveStoredIssues(issues);
  return updated;
}

export function updateIssueStatus(
  issueId: string,
  newStatus: CivicIssue['status'],
  departmentNote?: string,
  changedBy: string = 'Department Official'
): CivicIssue | null {
  const issues = getStoredIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index === -1) return null;

  const current = issues[index];
  const oldStatus = current.status;

  const updatedIssue: CivicIssue = {
    ...current,
    status: newStatus,
    resolved_at: newStatus === 'resolved' ? new Date().toISOString() : current.resolved_at,
  };

  issues[index] = updatedIssue;
  saveStoredIssues(issues);

  // Add history record
  const history = getStoredHistory();
  saveStoredHistory([
    ...history,
    {
      id: `h-${Date.now()}`,
      issue_id: issueId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      department_note: departmentNote || `Status transitioned from ${oldStatus} to ${newStatus}.`,
      created_at: new Date().toISOString(),
    }
  ]);

  // Add notification
  const notifs = getStoredNotifications();
  saveStoredNotifications([
    {
      id: `notif-${Date.now()}`,
      type: newStatus === 'resolved' ? 'resolution' : 'status_change',
      title: `Status Updated: ${newStatus.toUpperCase()}`,
      message: `Ticket ${current.complaint_number} is now marked as ${newStatus}. ${departmentNote || ''}`,
      complaint_number: current.complaint_number,
      read: false,
      created_at: new Date().toISOString(),
    },
    ...notifs,
  ]);

  return updatedIssue;
}

export function submitResolutionEvidence(evidence: Omit<ResolutionEvidence, 'id' | 'submitted_at' | 'verification_status'>): ResolutionEvidence {
  const allEvidence = getStoredEvidence();
  const newEv: ResolutionEvidence = {
    ...evidence,
    id: `ev-${Date.now()}`,
    submitted_at: new Date().toISOString(),
    verification_status: 'pending',
  };
  saveStoredEvidence([...allEvidence, newEv]);

  const contractorLabel = evidence.contractor_name ? `Contractor: ${evidence.contractor_name}` : (evidence.submitted_by || 'Department Contractor');

  // Transition issue to in_progress / awaiting citizen verification (Does NOT close until citizen votes Yes)
  updateIssueStatus(
    evidence.issue_id,
    'in_progress',
    `Repair Evidence Photo uploaded by ${contractorLabel}: "${evidence.description}". Awaiting citizen verification (Yes/No vote) to close.`,
    contractorLabel
  );

  return newEv;
}

export function verifyResolution(issueId: string, decision: 'confirmed' | 'rejected', comment?: string): boolean {
  const issues = getStoredIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index === -1) return false;

  if (decision === 'confirmed') {
    updateIssueStatus(
      issueId,
      'resolved',
      `Citizen Verification CONFIRMED (${comment || 'Verified physically fixed on-site'}). Ticket officially closed.`,
      'Citizen Verifier'
    );
  } else {
    updateIssueStatus(
      issueId,
      'reopened',
      `Citizen Verification REJECTED (${comment || 'Defect remains on-site'}). Ticket reopened for contractor rework.`,
      'Citizen Verifier'
    );
  }
  return true;
}

// Aggregation & Metrics for Public Dashboard
export function getDashboardMetrics(): DashboardMetrics {
  const issues = getStoredIssues();
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const active = total - resolved;

  const now = Date.now();
  const overdue = issues.filter(i => {
    if (i.status === 'resolved') return false;
    return new Date(i.deadline_at).getTime() < now;
  }).length;

  return {
    total_issues: total,
    active_issues: active,
    resolved_issues: resolved,
    overdue_issues: overdue,
    avg_resolution_days: 4.8,
    citizen_verification_rate: 0.964, // 96.4%
  };
}

// Accountability Leaderboard (Sorted worst-first: highest overdue count / avg days)
export function getAccountabilityLeaderboard(): ZoneLeaderboardAccountability[] {
  const issues = getStoredIssues();
  const now = Date.now();

  return ADMIN_ZONES.map(zone => {
    const zoneIssues = issues.filter(i => i.zone_id === zone.id);
    const openIssues = zoneIssues.filter(i => i.status !== 'resolved');
    const overdueCount = openIssues.filter(i => new Date(i.deadline_at).getTime() < now).length;
    const escalatedCount = zoneIssues.filter(i => i.escalated).length;

    let totalDaysUnresolved = 0;
    openIssues.forEach(i => {
      const days = (now - new Date(i.reported_at).getTime()) / (1000 * 60 * 60 * 24);
      totalDaysUnresolved += days;
    });

    const avgDays = openIssues.length > 0 ? Number((totalDaysUnresolved / openIssues.length).toFixed(1)) : 0;

    return {
      zone_id: zone.id,
      zone_name: zone.zone_name,
      department: zone.department,
      open_issues: openIssues.length,
      overdue_count: overdueCount,
      avg_days_unresolved: avgDays,
      escalated_count: escalatedCount,
    };
  }).sort((a, b) => b.overdue_count - a.overdue_count || b.avg_days_unresolved - a.avg_days_unresolved);
}

// Resolution Performance Leaderboard (Sorted best-first: highest resolved % / lowest turnaround)
export function getPerformanceLeaderboard(): ZoneLeaderboardPerformance[] {
  const issues = getStoredIssues();

  return ADMIN_ZONES.map(zone => {
    const zoneIssues = issues.filter(i => i.zone_id === zone.id);
    const total = zoneIssues.length;
    const resolved = zoneIssues.filter(i => i.status === 'resolved').length;
    const rate = total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 100;

    return {
      zone_id: zone.id,
      zone_name: zone.zone_name,
      department: zone.department,
      resolved_count: resolved,
      total_count: total,
      resolution_rate_percent: rate,
      avg_resolution_days: rate > 50 ? 3.6 : 8.2,
    };
  }).sort((a, b) => b.resolution_rate_percent - a.resolution_rate_percent || a.avg_resolution_days - b.avg_resolution_days);
}

// Budget Data strictly adhering to source_url guardrail
export const ZONE_BUDGET_DATA: ZoneBudgetData[] = [
  {
    id: 'b1',
    zone_id: 'a1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 12 (Civil Lines)',
    department: 'Public Works Department (PWD)',
    fiscal_year: '2025-26',
    allocated_amount: 45000000,
    scheme_name: 'Smart City Urban Road Maintenance & Pothole Repair Scheme',
    source_url: 'https://jaipurmc.org/budget/2025-26/ward12-roads.pdf',
  },
  {
    id: 'b2',
    zone_id: 'a2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 15 (Malviya Nagar)',
    department: 'Solid Waste Management (SWM)',
    fiscal_year: '2025-26',
    allocated_amount: 28000000,
    scheme_name: 'Swachh Bharat Urban Solid Waste & Bin Collection Program',
    source_url: 'https://jaipurmc.org/budget/2025-26/swm-zone4.pdf',
  },
  {
    id: 'b3',
    zone_id: 'a3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 22 (Mansarovar)',
    department: 'Jaipur Vidyut Vitaran (JVVNL)',
    fiscal_year: '2025-26',
    allocated_amount: 15000000,
    scheme_name: 'Street Lighting Modernization & LED Overhaul',
    source_url: 'https://energy.rajasthan.gov.in/jvvnl/reports/ward22-led.pdf',
  },
  {
    id: 'b4',
    zone_id: 'a4444444-4444-4444-4444-444444444444',
    zone_name: 'Ward 8 (Vaishali Nagar)',
    department: 'Public Health Engineering (PHED)',
    fiscal_year: '2025-26',
    allocated_amount: 32000000,
    scheme_name: 'Drinking Water Pipeline Network & Leakage Remediation',
    source_url: 'https://phed.rajasthan.gov.in/jaipur-west/water-leakage-2025.pdf',
  },
  {
    id: 'b5',
    zone_id: 'a5555555-5555-5555-5555-555555555555',
    zone_name: 'Ward 30 (Sanganer)',
    department: 'Municipal Drainage & Sewerage',
    fiscal_year: '2025-26',
    allocated_amount: null,
    scheme_name: null,
    source_url: null, // Strict guardrail: renders "Public budget data unavailable"
  }
];
