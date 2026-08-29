import { CivicIssue } from './types';

export interface DepartmentEmailPayload {
  to_email: string;
  department_name: string;
  subject: string;
  body_text: string;
  days_overdue: number;
  complaint_number: string;
  dispatch_timestamp: string;
}

/**
 * Maps department names to verified official municipal escalation email addresses.
 */
export function getDepartmentEmail(departmentName: string): string {
  const deptLower = (departmentName || '').toLowerCase();
  if (deptLower.includes('road') || deptLower.includes('pwd') || deptLower.includes('public works') || deptLower.includes('bridge')) {
    return 'pwd.nodal@punjab.gov.in';
  }
  if (deptLower.includes('waste') || deptLower.includes('garbage') || deptLower.includes('sanitation') || deptLower.includes('swm')) {
    return 'swm.punjab@punjab.gov.in';
  }
  if (deptLower.includes('water') || deptLower.includes('phed') || deptLower.includes('drain') || deptLower.includes('sewer')) {
    return 'md.pwssb@punjab.gov.in';
  }
  if (deptLower.includes('light') || deptLower.includes('pspcl') || deptLower.includes('electric') || deptLower.includes('power')) {
    return 'customercare@pspcl.in';
  }
  return 'director.localgovt@punjab.gov.in';
}

/**
 * Checks if an issue has exceeded the critical 45-day SLA threshold (45 * 24 * 60 * 60 * 1000 ms).
 */
export function is45DaysOverdue(issue: CivicIssue): boolean {
  if (issue.status === 'resolved') return false;

  const reportedTime = new Date(issue.reported_at).getTime();
  const now = Date.now();
  const diffDays = (now - reportedTime) / (1000 * 60 * 60 * 24);

  return diffDays >= 45;
}

/**
 * Generates an official department escalation email payload for tickets unresolved after 45+ days.
 */
export function generateDepartmentEscalationEmail(issue: CivicIssue): DepartmentEmailPayload {
  const reportedTime = new Date(issue.reported_at).getTime();
  const daysElapsed = Math.floor((Date.now() - reportedTime) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.max(0, daysElapsed - 15);
  const targetEmail = issue.department_email || getDepartmentEmail(issue.department);

  const subject = `[CRITICAL 45-DAY SLA VIOLATION] Ticket #${issue.complaint_number} - ${issue.zone_name}`;

  const body_text = `
OFFICIAL MUNICIPAL ESCALATION NOTICE - CIVICTRACK ACCOUNTABILITY PLATFORM
-------------------------------------------------------------------------
TO: Head of Department (${issue.department})
EMAIL: ${targetEmail}
JURISDICTION: ${issue.zone_name}
COMPLAINT NUMBER: ${issue.complaint_number}

STATUS: CRITICAL SLA VIOLATION (UNRESOLVED AFTER ${daysElapsed} DAYS)
DAYS OVERDUE: ${daysOverdue} Days (45-Day Escalation Triggered)

ISSUE SUMMARY: ${issue.title}
CATEGORY: ${issue.category.toUpperCase()}
GPS LOCATION: Lat ${issue.latitude.toFixed(6)}, Lng ${issue.longitude.toFixed(6)}
PHOTO EVIDENCE: ${issue.photo_url}

NOTICE DETAILS:
This civic infrastructure complaint was registered on ${new Date(issue.reported_at).toLocaleString()} and has exceeded the mandatory 45-day statutory SLA window without department resolution.

Under Section 84 of the Municipal Grievance Accountability Framework, this ticket has been escalated directly to the Executive Department Head. Immediate field inspection and resolution evidence photo upload are required within 48 hours.

Audit Trail Verification: https://civictrack.org/track/${issue.complaint_number}
-------------------------------------------------------------------------
AUTOMATED SYSTEM DISPATCH - CIVICTRACK GOVERNANCE ENGINE
`.trim();

  return {
    to_email: targetEmail,
    department_name: issue.department,
    subject,
    body_text,
    days_overdue: daysOverdue,
    complaint_number: issue.complaint_number,
    dispatch_timestamp: new Date().toISOString(),
  };
}
