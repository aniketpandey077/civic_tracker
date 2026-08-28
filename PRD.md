# PRD.md — CivicTrack
**Report. Track. Verify. Resolve.**

## 1. Problem Statement (PS 31 — base)
Citizens have no reliable way to report civic issues (potholes, garbage, broken streetlights) and see them tracked to resolution. Existing government apps are opaque — complaints vanish with no accountability.

## 2. One-Line Pitch
"CivicTrack turns a civic complaint into a traceable digital ticket, maps its impact in real time, alerts nearby citizens, verifies the resolution with evidence, and automatically escalates unresolved issues."

## 3. Target Users
- **Citizens** — report issues, track status, verify resolution, get nearby alerts
- **Department/zone staff (simulated for demo)** — update status, submit resolution evidence
- **Public/judges/media** — view leaderboards, heatmap, city-wide stats

## 4. Core Features (MVP, in priority order)
1. Live photo + GPS civic issue reporting
2. AI/CV validation — YOLO model detects pothole/garbage/streetlight in the photo before ticket creation
3. Zone matching (GPS → Ward/Department via PostGIS)
4. Unique complaint number + downloadable PDF receipt with QR code
5. Shared map with status-colored pins
6. Complaint tracking page with status timeline
7. Upvote system (one vote/user); 500 upvotes compresses 15-day deadline to 5 days
8. Resolution evidence (before/after photo) + citizen verification (Yes/No)
9. Automatic escalation graphic generation after deadline (simulated social post if API setup is a time sink)
10. Public dashboard: Accountability leaderboard (zone-wise, not individual) + Resolution Performance leaderboard
11. Heatmap of issue density by category
12. Nearby-issue alerts (geofenced notification, cooldown to avoid spam)

## 5. Explicit Guardrails (non-negotiable)
- Never name or tag an individual government employee — zone/department level only
- Never claim "guaranteed proof" of resolution — call it "Resolution Evidence"
- Never fabricate budget/fund data — only show figures with a `source_url` to an official public dataset; if none exists, show "Public budget data unavailable"
- 15-day / 500-upvote rule is explicitly labeled in the UI as "CivicTrack's own accountability rule," not an official government SLA

## 6. Success Metric for Demo
Judges should be able to: report a real pothole photo live → see AI/YOLO detect it → see it appear on the map/heatmap → see a generated ticket + PDF receipt with QR → see the escalation graphic mockup → see the leaderboard update.

## 7. Out of Scope for Hackathon (mention only in pitch, Phase 2)
Multi-language captions, WhatsApp channel, monthly auto-PDF city report, production Instagram publishing (simulate instead).
