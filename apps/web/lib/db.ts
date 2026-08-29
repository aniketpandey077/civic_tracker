/**
 * db.ts — Supabase database query layer for CivicTrack
 * Replaces localStorage-based store.ts with real Supabase queries.
 * All functions are async and return typed results.
 */

import { supabase } from './supabase';
import {
  CivicIssue,
  IssueStatusHistory,
  ResolutionEvidence,
  ResolutionVerification,
  NotificationItem,
  DashboardMetrics,
  ZoneLeaderboardAccountability,
  ZoneLeaderboardPerformance,
  ZoneBudgetData,
} from './types';

// ─── ISSUES ─────────────────────────────────────────────────────────────────

/** Fetch all civic issues, joined with zone name + department */
export async function fetchIssues(): Promise<CivicIssue[]> {
  const { data, error } = await supabase
    .from('civic_issues')
    .select(`
      *,
      admin_zones ( zone_name, department )
    `)
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('[db] fetchIssues error:', error.message);
    return [];
  }

  return (data ?? []).map(row => ({
    ...row,
    zone_name: row.admin_zones?.zone_name ?? row.zone_name ?? '',
    department: row.admin_zones?.department ?? row.department ?? '',
  })) as CivicIssue[];
}

/** Fetch a single issue by complaint number or UUID */
export async function fetchIssueByNumber(idOrNumber: string): Promise<CivicIssue | null> {
  // Try complaint_number first, then id
  const { data, error } = await supabase
    .from('civic_issues')
    .select(`*, admin_zones ( zone_name, department )`)
    .or(`complaint_number.ilike.${idOrNumber},id.eq.${idOrNumber}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[db] fetchIssueByNumber error:', error.message);
    return null;
  }

  if (!data) return null;
  return {
    ...data,
    zone_name: data.admin_zones?.zone_name ?? data.zone_name ?? '',
    department: data.admin_zones?.department ?? data.department ?? '',
  } as CivicIssue;
}

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Insert a new civic issue. Returns the created issue or null on failure. */
export async function createIssue(issue: Omit<CivicIssue, 'id'>): Promise<CivicIssue | null> {
  // Resolve zone_id using PostGIS ST_Contains if lat/lng provided
  let validZoneId: string | null = null;
  if (isValidUuid(issue.zone_id)) {
    validZoneId = issue.zone_id;
  }

  if (!validZoneId && issue.latitude && issue.longitude) {
    try {
      const { data: zoneData } = await supabase
        .rpc('get_zone_for_point', {
          lat: issue.latitude,
          lng: issue.longitude,
        });
      if (zoneData && isValidUuid(zoneData)) {
        validZoneId = zoneData;
      }
    } catch {}
  }

  const validReporterId = isValidUuid(issue.reporter_id) ? issue.reporter_id : null;

  const insertPayload = {
    complaint_number: issue.complaint_number,
    reporter_id: validReporterId,
    zone_id: validZoneId,
    category: issue.category,
    title: issue.title,
    description: issue.description,
    photo_url: issue.photo_url,
    ai_confidence: issue.ai_confidence,
    ai_detected_class: issue.ai_detected_class,
    latitude: issue.latitude,
    longitude: issue.longitude,
    location: `SRID=4326;POINT(${issue.longitude} ${issue.latitude})`,
    status: 'pending',
    upvote_count: 1,
    reported_at: issue.reported_at,
    deadline_at: issue.deadline_at,
    escalated: false,
  };

  const { data, error } = await supabase
    .from('civic_issues')
    .insert(insertPayload)
    .select(`*, admin_zones ( zone_name, department )`)
    .single();

  if (error) {
    console.error('[db] createIssue error:', error.message);
    // Fallback attempt without admin_zones join
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('civic_issues')
      .insert(insertPayload)
      .select('*')
      .single();

    if (fallbackError || !fallbackData) {
      console.error('[db] createIssue fallback error:', fallbackError?.message);
      return null;
    }

    return {
      ...fallbackData,
      zone_name: issue.zone_name || 'Ward Area',
      department: issue.department || 'Municipal Public Works',
    } as CivicIssue;
  }

  // Log initial status history entry (silent catch so issue is not lost)
  try {
    await supabase.from('issue_status_history').insert({
      issue_id: data.id,
      new_status: 'pending',
      changed_by: validReporterId,
      department_note: `Ticket created. AI validation (${((issue.ai_confidence ?? 0) * 100).toFixed(1)}% confidence) confirmed infrastructure defect. 15-day SLA started.`,
    });
  } catch {}

  return {
    ...data,
    zone_name: data.admin_zones?.zone_name ?? issue.zone_name ?? '',
    department: data.admin_zones?.department ?? issue.department ?? '',
  } as CivicIssue;
}

/** Upvote an issue (unique per user — enforced by DB constraint) */
export async function upvoteIssue(
  issueId: string,
  userId?: string
): Promise<{ success: boolean; newCount?: number }> {
  // Anonymous upvote: just increment count
  if (!userId) {
    const { data, error } = await supabase.rpc('increment_upvote', { issue_id: issueId });
    if (error) return { success: false };
    return { success: true, newCount: data };
  }

  // Authenticated upvote: insert into upvotes table (unique constraint prevents dupes)
  const { error: upvoteError } = await supabase
    .from('upvotes')
    .insert({ issue_id: issueId, user_id: userId });

  if (upvoteError) {
    // Code 23505 = unique violation = already voted
    if (upvoteError.code === '23505') return { success: false };
    return { success: false };
  }

  // Increment count on issue
  const { data, error } = await supabase.rpc('increment_upvote', { issue_id: issueId });
  if (error) return { success: true }; // vote recorded even if count rpc fails
  return { success: true, newCount: data };
}

// ─── STATUS HISTORY ──────────────────────────────────────────────────────────

export async function fetchHistory(issueId: string): Promise<IssueStatusHistory[]> {
  const { data, error } = await supabase
    .from('issue_status_history')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[db] fetchHistory error:', error.message);
    return [];
  }
  return (data ?? []) as IssueStatusHistory[];
}

// ─── EVIDENCE ────────────────────────────────────────────────────────────────

export async function fetchEvidence(issueId: string): Promise<ResolutionEvidence[]> {
  const { data, error } = await supabase
    .from('resolution_evidence')
    .select('*')
    .eq('issue_id', issueId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('[db] fetchEvidence error:', error.message);
    return [];
  }
  return (data ?? []) as ResolutionEvidence[];
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[db] fetchNotifications error:', error.message);
    return [];
  }
  return (data ?? []) as NotificationItem[];
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', notifId);
}

// ─── DASHBOARD METRICS ───────────────────────────────────────────────────────

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data, error } = await supabase.rpc('get_dashboard_metrics');

  if (error || !data) {
    console.error('[db] fetchDashboardMetrics error:', error?.message);
    return {
      total_issues: 0,
      active_issues: 0,
      resolved_issues: 0,
      overdue_issues: 0,
      avg_resolution_days: 0,
      citizen_verification_rate: 0,
    };
  }
  return data as DashboardMetrics;
}

// ─── LEADERBOARDS ────────────────────────────────────────────────────────────

export async function fetchAccountabilityLeaderboard(): Promise<ZoneLeaderboardAccountability[]> {
  const { data, error } = await supabase.rpc('get_accountability_leaderboard');
  if (error) {
    console.error('[db] fetchAccountabilityLeaderboard error:', error.message);
    return [];
  }
  return (data ?? []) as ZoneLeaderboardAccountability[];
}

export async function fetchPerformanceLeaderboard(): Promise<ZoneLeaderboardPerformance[]> {
  const { data, error } = await supabase.rpc('get_performance_leaderboard');
  if (error) {
    console.error('[db] fetchPerformanceLeaderboard error:', error.message);
    return [];
  }
  return (data ?? []) as ZoneLeaderboardPerformance[];
}

// ─── BUDGET DATA ─────────────────────────────────────────────────────────────

export async function fetchBudgetData(): Promise<ZoneBudgetData[]> {
  const { data, error } = await supabase
    .from('zone_budget_public_data')
    .select(`*, admin_zones ( zone_name, department )`);

  if (error) {
    console.error('[db] fetchBudgetData error:', error.message);
    return [];
  }
  return (data ?? []).map(row => ({
    ...row,
    zone_name: row.admin_zones?.zone_name ?? '',
    department: row.admin_zones?.department ?? '',
  })) as ZoneBudgetData[];
}

// ─── ADMIN GOVERNANCE CONTROLS ───────────────────────────────────────────────

/** Admin: Update ticket status + log official audit note in issue_status_history */
export async function adminUpdateIssueStatus(
  issueId: string,
  newStatus: string,
  note: string,
  changedBy: string = 'Municipal Administrator'
): Promise<{ success: boolean; error?: string }> {
  const updatePayload: Record<string, any> = { status: newStatus };
  if (newStatus === 'resolved') {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('civic_issues')
    .update(updatePayload)
    .eq('id', issueId);

  if (updateError) {
    console.error('[admin] update status error:', updateError.message);
    return { success: false, error: updateError.message };
  }

  // Insert status history entry
  await supabase.from('issue_status_history').insert({
    issue_id: issueId,
    new_status: newStatus,
    changed_by: changedBy,
    department_note: note || `Status updated to ${newStatus.toUpperCase()} by ${changedBy}`,
  });

  return { success: true };
}

/** Admin: Modify ticket SLA, department, or severity */
export async function adminUpdateIssueDetails(
  issueId: string,
  updates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('civic_issues')
    .update(updates)
    .eq('id', issueId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Admin: Purge / Delete a bogus or invalid docket with full cascade */
export async function adminDeleteIssue(issueId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Try RPC function first (bypasses any foreign key/RLS issues via Security Definer)
    const { data: rpcSuccess, error: rpcError } = await supabase.rpc('delete_civic_issue_cascade', {
      target_id: issueId,
    });

    if (!rpcError && rpcSuccess) {
      return { success: true };
    }

    // Fallback direct cascade queries
    await supabase.from('resolution_evidence').delete().eq('issue_id', issueId);
    await supabase.from('issue_status_history').delete().eq('issue_id', issueId);
    await supabase.from('resolution_verifications').delete().eq('issue_id', issueId);
    await supabase.from('upvotes').delete().eq('issue_id', issueId);
    await supabase.from('notifications').delete().eq('complaint_number', issueId);

    const { error } = await supabase
      .from('civic_issues')
      .delete()
      .or(`id.eq.${issueId},complaint_number.eq.${issueId}`);

    if (error) {
      console.warn('[db] adminDeleteIssue error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[db] adminDeleteIssue exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

/** Admin: Upload official contractor resolution proof */
export async function adminSubmitEvidence(
  issueId: string,
  beforePhotoUrl: string,
  afterPhotoUrl: string,
  description: string,
  contractorName: string = 'Municipal Contractor'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('resolution_evidence').insert({
    issue_id: issueId,
    before_photo_url: beforePhotoUrl,
    after_photo_url: afterPhotoUrl,
    description: description || 'Official contractor repair completion photo evidence.',
    submitted_by: contractorName,
    verification_status: 'pending',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Automatically transition status to verified
  await adminUpdateIssueStatus(
    issueId,
    'verified',
    `Contractor proof uploaded by ${contractorName}. Ready for citizen verification.`
  );

  return { success: true };
}

/** Admin: Broadcast emergency alert */
export async function adminBroadcastNotification(
  title: string,
  message: string,
  type: string = 'deadline_warning'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('notifications').insert({
    type,
    title,
    message,
    read: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

