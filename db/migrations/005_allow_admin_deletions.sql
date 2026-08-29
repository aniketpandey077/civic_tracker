-- CivicTrack Migration 005 — Enable RLS Delete/Update Policies & Cascade Purge RPC
-- Run this in your Supabase SQL Editor

-- 1. Enable DELETE & UPDATE policies for civic_issues and all relational tables
DROP POLICY IF EXISTS "Allow delete civic_issues" ON civic_issues;
CREATE POLICY "Allow delete civic_issues"
  ON civic_issues FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow update civic_issues" ON civic_issues;
CREATE POLICY "Allow update civic_issues"
  ON civic_issues FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow delete issue_status_history" ON issue_status_history;
CREATE POLICY "Allow delete issue_status_history"
  ON issue_status_history FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow delete resolution_evidence" ON resolution_evidence;
CREATE POLICY "Allow delete resolution_evidence"
  ON resolution_evidence FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow delete upvotes" ON upvotes;
CREATE POLICY "Allow delete upvotes"
  ON upvotes FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow delete resolution_verifications" ON resolution_verifications;
CREATE POLICY "Allow delete resolution_verifications"
  ON resolution_verifications FOR DELETE
  USING (true);

-- 2. Master Security Definer Cascade Delete Function (Bypasses RLS restrictions safely)
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
