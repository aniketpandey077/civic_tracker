# project_RULES.md — CivicTrack

## Non-negotiable product rules
1. Never name, tag, or expose personal details of an individual government employee — accountability stays at zone/department level, always.
2. Never claim "guaranteed proof" — resolution photos are labeled "Resolution Evidence" only.
3. Never fabricate or estimate budget/fund figures — every number shown must carry a `source_url`; if none exists, show "Public budget data unavailable."
4. The 15-day deadline and 500-upvote rule must be labeled in the UI as CivicTrack's own accountability mechanism — never implied to be an official government SLA.
5. Reporter's personal info is never shown on the public map or public ticket lookup.

## Team rules
1. **Understand before you ship.** If an AI tool generated a piece of code, the owning member reads it end-to-end and can explain it before merging. If you can't explain it, ask your Claude chat to explain it back to you in plain words — do this before moving to the next task.
2. **Update docs with code.** Any change to an API route, schema, or flow gets reflected the same day in `API_SPEC.md` / `database_schema.md` / `application_flow.md` — stale docs are treated as a bug.
3. **task.md and Implementation_status.md are updated at the end of every work session** — not just before the demo.
4. **One feature branch per task**, PR reviewed by at least one other member before merge (even in a hackathon — catches "I don't understand this" early).
5. **No fabricated demo data presented as real.** Simulated steps (e.g. social publish) must be clearly labeled "Simulated" in the demo, not passed off as live.
6. **Judge Q&A prep:** each member owns being able to answer questions about their layer only — don't let one person answer everything; this itself signals genuine teamwork to judges.
