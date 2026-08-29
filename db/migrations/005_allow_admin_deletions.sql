-- CivicTrack Migration 005 — Enable Full Real-Time Sync, Issue Creation & Purge Policies
-- Run this in your Supabase SQL Editor

-- 1. Enable Full RLS Policies on civic_issues for all clients (anon + authenticated)
DROP POLICY IF EXISTS "Public can create issues" ON civic_issues;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON civic_issues;
CREATE POLICY "Public can create issues"
  ON civic_issues FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read civic_issues" ON civic_issues;
CREATE POLICY "Public can read civic_issues"
  ON civic_issues FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow update civic_issues" ON civic_issues;
CREATE POLICY "Allow update civic_issues"
  ON civic_issues FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow delete civic_issues" ON civic_issues;
CREATE POLICY "Allow delete civic_issues"
  ON civic_issues FOR DELETE
  USING (true);

-- 2. Issue Status History Policies
DROP POLICY IF EXISTS "Public can insert status history" ON issue_status_history;
CREATE POLICY "Public can insert status history"
  ON issue_status_history FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read issue_status_history" ON issue_status_history;
CREATE POLICY "Public can read issue_status_history"
  ON issue_status_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow delete issue_status_history" ON issue_status_history;
CREATE POLICY "Allow delete issue_status_history"
  ON issue_status_history FOR DELETE
  USING (true);

-- 3. Resolution Evidence Policies
DROP POLICY IF EXISTS "Public can insert evidence" ON resolution_evidence;
CREATE POLICY "Public can insert evidence"
  ON resolution_evidence FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read resolution_evidence" ON resolution_evidence;
CREATE POLICY "Public can read resolution_evidence"
  ON resolution_evidence FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow delete resolution_evidence" ON resolution_evidence;
CREATE POLICY "Allow delete resolution_evidence"
  ON resolution_evidence FOR DELETE
  USING (true);

-- 4. Upvotes Policies
DROP POLICY IF EXISTS "Public can insert upvotes" ON upvotes;
DROP POLICY IF EXISTS "Authenticated users can upvote" ON upvotes;
CREATE POLICY "Public can insert upvotes"
  ON upvotes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete upvotes" ON upvotes;
CREATE POLICY "Allow delete upvotes"
  ON upvotes FOR DELETE
  USING (true);

-- 5. Master Security Definer Cascade Delete Function
CREATE OR REPLACE FUNCTION delete_civic_issue_cascade(target_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete foreign records
  DELETE FROM resolution_evidence WHERE issue_id::text = target_id;
  DELETE FROM issue_status_history WHERE issue_id::text = target_id;
  DELETE FROM resolution_verifications WHERE issue_id::text = target_id;
  DELETE FROM upvotes WHERE issue_id::text = target_id;

  -- Delete issue row
  DELETE FROM civic_issues WHERE id::text = target_id OR complaint_number = target_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
