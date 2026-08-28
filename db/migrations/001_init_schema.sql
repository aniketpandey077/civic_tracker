-- CivicTrack Database Schema Migration
-- PostgreSQL + PostGIS (Supabase compatible)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'citizen',        -- citizen | department_staff | admin
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADMIN ZONES (Ward / Department boundaries)
CREATE TABLE IF NOT EXISTS admin_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,             -- e.g. "Ward 12 (Civil Lines)"
    department TEXT NOT NULL,            -- e.g. "Public Works Department (PWD)"
    city TEXT NOT NULL DEFAULT 'Jaipur',
    city_code TEXT NOT NULL DEFAULT 'JPR', -- e.g. "JPR" for ticket numbering
    boundary GEOMETRY(POLYGON, 4326),
    official_handle TEXT,                -- e.g. "@Jaipur_PWD_Official" (zone/department level only)
    UNIQUE (zone_name, city)
);

-- 3. CIVIC ISSUES (Tickets)
CREATE TABLE IF NOT EXISTS civic_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number TEXT UNIQUE NOT NULL,   -- e.g. CTR-2026-JPR-000184
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES admin_zones(id) ON DELETE SET NULL,
    category TEXT NOT NULL,                  -- pothole | garbage | streetlight | manhole | road_damage | water_leakage | other
    title TEXT,
    description TEXT,
    photo_url TEXT NOT NULL,
    ai_confidence NUMERIC,                   -- YOLO detection confidence (0.00 - 1.00)
    ai_detected_class TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    status TEXT DEFAULT 'pending',           -- pending | verified | assigned | in_progress | resolved | reopened
    upvote_count INT DEFAULT 0,
    reported_at TIMESTAMPTZ DEFAULT now(),
    deadline_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    escalated BOOLEAN DEFAULT FALSE,
    escalation_graphic_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_civic_issues_location ON civic_issues USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON civic_issues (status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_zone ON civic_issues (zone_id);

-- 4. UPVOTES (One vote per user)
CREATE TABLE IF NOT EXISTS upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (issue_id, user_id)
);

-- 5. ISSUE STATUS HISTORY (Powers the vertical timeline)
CREATE TABLE IF NOT EXISTS issue_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    department_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RESOLUTION EVIDENCE (Before/After photos submitted by department staff)
CREATE TABLE IF NOT EXISTS resolution_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    before_photo_url TEXT,
    after_photo_url TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    verification_status TEXT DEFAULT 'pending'  -- pending | confirmed | rejected
);

-- 7. CITIZEN VERIFICATION (Yes/No response from citizens)
CREATE TABLE IF NOT EXISTS resolution_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    decision TEXT NOT NULL,              -- confirmed | rejected
    comment TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. NOTIFICATIONS (Geofenced alerts & status updates)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    type TEXT NOT NULL,                  -- nearby_issue | status_change | deadline_warning | escalation | resolution
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PUBLIC BUDGET DATA (Strictly requiring verifiable source_url)
CREATE TABLE IF NOT EXISTS zone_budget_public_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES admin_zones(id) ON DELETE CASCADE,
    fiscal_year TEXT NOT NULL,
    allocated_amount NUMERIC NOT NULL,
    scheme_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT now()
);
