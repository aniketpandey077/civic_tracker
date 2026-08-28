# database_schema.md — CivicTrack (PostgreSQL + PostGIS via Supabase)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    role TEXT DEFAULT 'citizen',        -- citizen | department_staff | admin
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ADMIN ZONES (Ward/Department boundaries)
CREATE TABLE admin_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,             -- e.g. "Ward 12"
    department TEXT NOT NULL,            -- e.g. "PWD"
    city TEXT NOT NULL,
    city_code TEXT NOT NULL,             -- e.g. "JPR" for ticket numbers
    boundary GEOMETRY(POLYGON, 4326),
    official_handle TEXT,                -- public dept/zone handle only
    UNIQUE (zone_name, city)
);

-- CIVIC ISSUES (tickets)
CREATE TABLE civic_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number TEXT UNIQUE NOT NULL,   -- CTR-2026-JPR-000184
    reporter_id UUID REFERENCES users(id),
    zone_id UUID REFERENCES admin_zones(id),
    category TEXT NOT NULL,              -- pothole|garbage|streetlight|manhole|road_damage|water_leakage|other
    description TEXT,
    photo_url TEXT NOT NULL,
    ai_confidence NUMERIC,               -- YOLO detection confidence
    ai_detected_class TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    status TEXT DEFAULT 'pending',       -- pending|verified|assigned|in_progress|resolved|reopened
    upvote_count INT DEFAULT 0,
    reported_at TIMESTAMPTZ DEFAULT now(),
    deadline_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    escalated BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_civic_issues_location ON civic_issues USING GIST (location);

-- UPVOTES
CREATE TABLE upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (issue_id, user_id)
);

-- STATUS HISTORY (powers the timeline UI)
CREATE TABLE issue_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id),
    old_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RESOLUTION EVIDENCE
CREATE TABLE resolution_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id),
    submitted_by UUID REFERENCES users(id),
    before_photo_url TEXT,
    after_photo_url TEXT,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    verification_status TEXT DEFAULT 'pending'  -- pending|confirmed|rejected
);

-- CITIZEN VERIFICATION
CREATE TABLE resolution_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES civic_issues(id),
    user_id UUID REFERENCES users(id),
    decision TEXT NOT NULL,              -- confirmed|rejected
    comment TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    issue_id UUID REFERENCES civic_issues(id),
    type TEXT,                           -- nearby_issue|status_change|deadline_warning|escalation|resolution
    title TEXT,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PUBLIC BUDGET DATA (only from verifiable public sources)
CREATE TABLE zone_budget_public_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES admin_zones(id),
    fiscal_year TEXT,
    allocated_amount NUMERIC,
    scheme_name TEXT,
    source_url TEXT NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT now()
);
```

## Notes
- `complaint_number` is generated app-side as `CTR-{year}-{city_code}-{zero_padded_sequence}` — never expose the raw UUID to users.
- `location` uses `GEOGRAPHY(POINT)` for accurate distance queries (nearby alerts); `boundary` on zones uses `GEOMETRY(POLYGON)` for `ST_Contains` zone matching.
- Heatmap data is **derived at query time** via spatial grid aggregation — no separate heatmap table needed.
