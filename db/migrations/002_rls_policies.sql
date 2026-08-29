-- CivicTrack Migration 002 — Row Level Security Policies + Helper RPCs
-- Run this in Supabase SQL Editor AFTER 001_init_schema.sql

-- ─── ENABLE ROW LEVEL SECURITY ──────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_budget_public_data ENABLE ROW LEVEL SECURITY;

-- ─── PUBLIC READ POLICIES ────────────────────────────────────────────────────
-- Anyone (anonymous or authenticated) can read these tables:

CREATE POLICY "Public can read admin_zones"
  ON admin_zones FOR SELECT USING (true);

CREATE POLICY "Public can read civic_issues"
  ON civic_issues FOR SELECT USING (true);

CREATE POLICY "Public can read issue_status_history"
  ON issue_status_history FOR SELECT USING (true);

CREATE POLICY "Public can read resolution_evidence"
  ON resolution_evidence FOR SELECT USING (true);

CREATE POLICY "Public can read zone_budget_public_data"
  ON zone_budget_public_data FOR SELECT USING (true);

-- ─── AUTHENTICATED WRITE POLICIES ───────────────────────────────────────────

-- Any authenticated user can create an issue
CREATE POLICY "Authenticated users can create issues"
  ON civic_issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Any authenticated user can upvote (unique constraint handles 1-per-user)
CREATE POLICY "Authenticated users can upvote"
  ON upvotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anonymous users can also read upvotes (for count display)
CREATE POLICY "Public can read upvotes"
  ON upvotes FOR SELECT USING (true);

-- Any authenticated user can submit resolution verification
CREATE POLICY "Authenticated users can submit verifications"
  ON resolution_verifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read resolution_verifications"
  ON resolution_verifications FOR SELECT USING (true);

-- ─── NOTIFICATIONS (private per user) ───────────────────────────────────────

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- System/service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ─── HELPER RPC FUNCTIONS ───────────────────────────────────────────────────

-- 1. PostGIS zone lookup: returns zone UUID for a given lat/lng point
CREATE OR REPLACE FUNCTION get_zone_for_point(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM admin_zones
  WHERE ST_Contains(
    boundary,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  )
  LIMIT 1;
$$;

-- 2. Increment upvote count atomically
CREATE OR REPLACE FUNCTION increment_upvote(issue_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE civic_issues
  SET upvote_count = upvote_count + 1
  WHERE id = issue_id
  RETURNING upvote_count INTO new_count;
  RETURN new_count;
END;
$$;

-- 3. Dashboard metrics aggregate
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total_issues',              COUNT(*),
    'active_issues',             COUNT(*) FILTER (WHERE status NOT IN ('resolved')),
    'resolved_issues',           COUNT(*) FILTER (WHERE status = 'resolved'),
    'overdue_issues',            COUNT(*) FILTER (WHERE status != 'resolved' AND deadline_at < NOW()),
    'avg_resolution_days',       ROUND(
                                   COALESCE(
                                     AVG(
                                       EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 86400
                                     ) FILTER (WHERE resolved_at IS NOT NULL),
                                     0
                                   )::NUMERIC, 1
                                 ),
    'citizen_verification_rate', ROUND(
                                   COALESCE(
                                     (COUNT(*) FILTER (WHERE status = 'resolved')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
                                     0
                                   ), 1
                                 )
  )
  FROM civic_issues;
$$;

-- 4. Accountability leaderboard (worst zones first — highest overdue)
CREATE OR REPLACE FUNCTION get_accountability_leaderboard()
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  department TEXT,
  open_issues BIGINT,
  overdue_count BIGINT,
  avg_days_unresolved NUMERIC,
  escalated_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    az.id                                                           AS zone_id,
    az.zone_name,
    az.department,
    COUNT(ci.id) FILTER (WHERE ci.status != 'resolved')            AS open_issues,
    COUNT(ci.id) FILTER (
      WHERE ci.status != 'resolved' AND ci.deadline_at < NOW()
    )                                                               AS overdue_count,
    ROUND(
      COALESCE(
        AVG(
          EXTRACT(EPOCH FROM (NOW() - ci.reported_at)) / 86400
        ) FILTER (WHERE ci.status != 'resolved'),
        0
      )::NUMERIC, 1
    )                                                               AS avg_days_unresolved,
    COUNT(ci.id) FILTER (WHERE ci.escalated = TRUE)                AS escalated_count
  FROM admin_zones az
  LEFT JOIN civic_issues ci ON ci.zone_id = az.id
  GROUP BY az.id, az.zone_name, az.department
  ORDER BY overdue_count DESC, open_issues DESC;
$$;

-- 5. Performance leaderboard (best zones first — highest resolution %)
CREATE OR REPLACE FUNCTION get_performance_leaderboard()
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  department TEXT,
  resolved_count BIGINT,
  total_count BIGINT,
  resolution_rate_percent NUMERIC,
  avg_resolution_days NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    az.id                                                            AS zone_id,
    az.zone_name,
    az.department,
    COUNT(ci.id) FILTER (WHERE ci.status = 'resolved')              AS resolved_count,
    COUNT(ci.id)                                                     AS total_count,
    ROUND(
      COALESCE(
        (COUNT(ci.id) FILTER (WHERE ci.status = 'resolved')::NUMERIC
          / NULLIF(COUNT(ci.id), 0)) * 100,
        0
      ), 1
    )                                                                AS resolution_rate_percent,
    ROUND(
      COALESCE(
        AVG(
          EXTRACT(EPOCH FROM (ci.resolved_at - ci.reported_at)) / 86400
        ) FILTER (WHERE ci.resolved_at IS NOT NULL),
        0
      )::NUMERIC, 1
    )                                                                AS avg_resolution_days
  FROM admin_zones az
  LEFT JOIN civic_issues ci ON ci.zone_id = az.id
  GROUP BY az.id, az.zone_name, az.department
  ORDER BY resolution_rate_percent DESC, avg_resolution_days ASC;
$$;
