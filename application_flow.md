# application_flow.md — CivicTrack

## Primary User Journey (citizen reporting)
```
Open app → Login/Guest
   ↓
Tap "Report Issue"
   ↓
Live camera opens (gallery upload blocked)
   ↓
Photo captured → sent to YOLO/OpenCV detection service
   ↓
   ├─ Issue detected (pothole/garbage/streetlight/manhole) → confidence shown
   └─ Nothing detected → "Please capture the actual infrastructure problem" → retry
   ↓
GPS auto-captured (lat, lng, timestamp)
   ↓
Backend: zone matcher (PostGIS) → Ward + Department resolved
   ↓
User adds short description → Submit
   ↓
Complaint created: unique number (CTR-2026-JPR-000184 style)
   ↓
PDF receipt generated (QR code → live status page) → downloadable
   ↓
15-day countdown starts, ticket status = "Pending"
   ↓
Ticket appears on public map + heatmap
```

## Tracking Journey
```
"My Complaints" → list of user's tickets with countdown
   ↓
Tap a ticket → Status Timeline (Reported → Verified → Assigned → In Progress → Resolved)
   ↓
Anyone can also search by complaint number (no login needed) → same tracking view
```

## Resolution + Verification Journey
```
Department (simulated demo login) marks "Work in Progress"
   ↓
Uploads Before/After photo as "Resolution Evidence"
   ↓
Original reporter gets prompt: "Has this been resolved?"
   ↓
   ├─ YES → ticket closed, resolved_at set, leaderboard updated
   └─ NO  → ticket reopens, reason requested, back to "active"
```

## Escalation Journey (automated)
```
Daily cron checks: now() >= deadline_at AND status != resolved
   ↓
If upvotes >= 500 → deadline was already compressed to 5 days
   ↓
Trigger: Media Generation Engine → overlay photo + zone + days-elapsed + ticket number
   ↓
Publish (or simulate publish) → tag zone/department handle only
   ↓
escalated = true, appears on Accountability Leaderboard
```

## Nearby Alert Journey
```
User has location permission on + app in foreground/background
   ↓
Backend periodically checks: any unresolved issue within 200m?
   ↓
   ├─ Yes + not alerted in last X hours → push notification
   └─ Already alerted recently → skip (cooldown)
```

## Public/Judge-Facing Journey
```
Public Dashboard (no login) →
   City stats (total/active/resolved/overdue/avg resolution)
   ↓
   Accountability Leaderboard (zone, open, overdue, avg days)
   ↓
   Resolution Performance Leaderboard (zone, resolved %, avg time)
   ↓
   Heatmap (filterable by category)
   ↓
   Budget Transparency panel (only where public source data exists)
```
