# task.md — CivicTrack (build order across all 4 members)

## Phase 1 — Core Loop (Hour 0–4)
- [x] M2: Supabase project + run `001_init_schema.sql`
- [x] M2: `/issues/report` API + complaint number generator + zone matcher
- [x] M1: Report screen (camera + GPS capture, no gallery)
- [x] M4: Source 3–5 real ward boundary GeoJSONs for demo city, seed `admin_zones`
- [x] M3: FastAPI service skeleton + `/ai/detect` stub (return dummy response first, wire YOLO after)

## Phase 2 — Tracking + Map (Hour 4–8)
- [x] M1: Map screen with status-colored pins
- [x] M1: "My Complaints" + tracking detail page with status timeline
- [x] M2: `/issues/:id/status` + `issue_status_history` logging
- [x] M2: `/issues/:id/upvote` with 500-threshold deadline compression
- [x] M4: Public dashboard skeleton (`/dashboard` page, overview counts)

## Phase 3 — AI + Heatmap + Alerts (Hour 8–14)
- [x] M3: Wire real YOLOv8 model into `/ai/detect`, connect to report flow
- [x] M3: OpenCV preprocessing before inference
- [x] M1: Heatmap toggle on map (consumes `/issues/heatmap`)
- [x] M2: `/issues/nearby` endpoint
- [x] M1: Nearby-issue push notification UI + cooldown logic

## Phase 4 — Resolution + Receipt (Hour 14–20)
- [x] M2: `/issues/:id/resolution-evidence` + `/issues/:id/verify`
- [x] M1: Before/after evidence UI + verify Yes/No prompt
- [x] M2/M1: PDF receipt generation + QR code (`/issues/:id/receipt.pdf`)

## Phase 5 — Escalation + Leaderboards + Polish (Hour 20–26)
- [x] M3: Daily escalation cron + image composition engine
- [x] M3: Simulated social publish (mock response acceptable for demo)
- [x] M4: Accountability leaderboard + Resolution Performance leaderboard
- [x] M4: Budget transparency card (only real source data)
- [x] All: End-to-end test of full journey (report → detect → track → resolve → verify)
- [x] All: Demo script rehearsal

## Definition of Done (per task)
A task is "done" only when the owning member can explain it out loud without reading code off screen — not just when it runs.
