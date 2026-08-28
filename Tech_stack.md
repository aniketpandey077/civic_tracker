# Tech_stack.md — CivicTrack

## Why this stack
Judges (SyncGaze — enterprise dashboards/internal tools company) respect teams who can explain *why* each piece exists, not just that "AI built it." Every member should be able to explain their layer in plain words. Vibe coding tools are fine to speed up boilerplate — but each member must understand and be able to walk through their own code.

## Core Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Fast to ship, SSR for the public dashboard, reusable from your ARIA/CafeSathi pattern |
| Maps | Google Maps JS SDK (or Mapbox GL JS) | Heatmap layer + custom pins support out of the box |
| Backend API | Next.js API Routes (or a separate FastAPI service if Python is preferred for AI parts) | One repo, less context-switching for a 4-person team in limited time |
| Database | PostgreSQL + PostGIS via Supabase | Geo queries (zone matching, "nearby issues") need PostGIS; Supabase gives instant hosted Postgres + realtime + storage |
| File/Photo Storage | Supabase Storage | Photos for reports + before/after evidence |
| AI Image Validation | **YOLOv8 (Ultralytics) + OpenCV**, served via a small FastAPI microservice | Real object-detection model, not just an API wrapper — this is the "we actually understand the tech" proof point for judges |
| PDF Receipt Generation | `@react-pdf/renderer` (Node) or `reportlab`/`weasyprint` (Python) | Generates the downloadable ticket receipt with embedded QR |
| QR Code | `qrcode` npm package or `qrcode` Python lib | Encodes the tracking URL |
| Cron/Scheduler | `node-cron` (simplest for hackathon) or Supabase Edge Functions scheduled trigger | Daily escalation check |
| Social Publish (simulated) | Meta Graph API stub / mock response for demo | Avoid burning time on real app review approval mid-hackathon |
| Realtime updates | Supabase Realtime (Postgres changes) | Live map/leaderboard updates without polling — same pattern as CafeSathi's kitchen live updates |
| Auth | Supabase Auth (phone/email OTP) | Fast, no custom auth needed |
| Deployment | Vercel (frontend/API) + Railway/Render (Python YOLO microservice) | Free tiers, fast deploy |

## Per-Member Best AI Tool + Paste-Ready Prompt

> Rule: run these prompts in **your own Claude chat**, one member = one thread, so each person actually reads and understands what gets generated. Don't just copy output blind — ask Claude to explain any line you don't get.

### Member 1 — Frontend + Maps
**Best tool:** Claude (Sonnet) in a code-focused chat, or Claude Code if installed — for React/Next.js component generation with explanation.
**Paste-ready prompt:**
```
I'm building the frontend of a Next.js 14 (App Router) + Tailwind civic-issue-reporting
app called CivicTrack. I need:
1. A "Report Issue" screen with live camera capture only (no gallery upload), a category
   selector, description field, and GPS auto-fetch on submit.
2. A map screen using Google Maps JS SDK showing pins colored by status
   (red=pending, orange=<5 days left, green=resolved), with a heatmap toggle.
3. A "My Complaints" list + a complaint tracking detail page showing a vertical status
   timeline (Reported → Verified → Assigned → In Progress → Resolved).
Build these as clean, componentized React code. After each component, explain in 3-4
lines what state/hooks it uses and why, so I can explain this code confidently to judges.
```

### Member 2 — Backend, Database & Geolocation
**Best tool:** Claude for schema/API design + explanation; Supabase's built-in SQL editor for running it.
**Paste-ready prompt:**
```
I'm building the backend for CivicTrack, a civic-issue tracking app, using Supabase
(PostgreSQL + PostGIS) and Next.js API routes. Given this schema concept: users,
admin_zones (with polygon boundaries), civic_issues, upvotes, issue_status_history,
resolution_evidence, resolution_verifications, notifications — generate the full SQL
migration with PostGIS types, plus Next.js API route handlers for: create issue,
zone-matching by lat/lng (ST_Contains), upvote (one per user), update status with
history logging, and submit/verify resolution evidence. After each API route, explain
in plain words what it does and what could break it, so I can defend this code in a
judge Q&A.
```

### Member 3 — AI/CV, Automation & Media Generation
**Best tool:** Claude for the FastAPI/YOLO scaffolding + explanation; Ultralytics docs directly for model specifics (Claude can walk through them).
**Paste-ready prompt:**
```
I need a small FastAPI microservice that accepts an uploaded photo and runs it through
a YOLOv8 model (Ultralytics, pretrained then fine-tuned on a small pothole/garbage/
streetlight dataset if time allows, otherwise use a general damage/object detector as
a fallback) plus OpenCV preprocessing (resize, contrast normalization). It should
return: detected_class, confidence, and a boolean "is_civic_issue". Also write a daily
cron-style Python script that queries unresolved tickets past their deadline and calls
an image-composition function (Pillow) to overlay "X days unresolved", the zone name,
and the ticket number onto the original photo, saving the result. Explain how YOLO's
inference actually works in this pipeline in a few sentences I can repeat confidently
to a judge who asks "so how does the AI detection really work?"
```

### Member 4 — Zone Data, Dashboards & QA
**Best tool:** Claude for dashboard component + aggregation query generation; QGIS or a free ward-boundary GeoJSON source for real zone data.
**Paste-ready prompt:**
```
I'm building the public dashboard for CivicTrack (Next.js + Tailwind + Supabase).
I need: (1) a "City Overview" component showing total/active/resolved/overdue counts
and average resolution days, pulled via a Supabase aggregate query, (2) an
"Accountability Leaderboard" table (zone, department, open issues, overdue count,
avg days unresolved) sorted worst-first, (3) a "Resolution Performance" leaderboard
(zone, resolved %, avg resolution time) sorted best-first, (4) a "Budget Transparency"
card that only renders a figure if a source_url exists in the zone_budget_public_data
table, otherwise shows "Public budget data unavailable." Also write 5 end-to-end test
cases (as plain English test steps, not code) covering: report → detect → zone-match →
ticket creation → escalation. Explain the SQL aggregation logic in plain words after
each query.
```

## Judge-facing rule for all 4 members
Every member should be able to answer, unprompted: *"Walk me through what your part of the code actually does, line by line, without reading it off the screen."* If AI wrote the boilerplate, that's fine — the team's job is to understand and be able to modify it live if a judge asks for a tweak.
