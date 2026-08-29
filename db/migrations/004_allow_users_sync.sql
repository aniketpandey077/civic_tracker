-- CivicTrack Migration 004 — Allow Users Table Sync
-- Run this in Supabase SQL Editor

-- 1. Allow public select on users table
CREATE POLICY IF NOT EXISTS "Public can read users"
  ON users FOR SELECT
  USING (true);

-- 2. Allow public / authenticated insert on users table
CREATE POLICY IF NOT EXISTS "Public can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- 3. Allow users to update their profile
CREATE POLICY IF NOT EXISTS "Public can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);
