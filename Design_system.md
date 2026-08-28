# Design_system.md — CivicTrack

## Brand
- **Name:** CivicTrack — "Report. Track. Verify. Resolve."
- **Tone:** civic, trustworthy, factual — never accusatory in visual tone (avoid angry-red-everywhere; balance shame/praise visually)

## Color System (status-driven — this IS the UI language)
| Token | Hex | Usage |
|---|---|---|
| `--critical` | #DC2626 | Overdue/unresolved pins, critical heatmap zone |
| `--warning` | #F59E0B | <5 days remaining, medium heatmap zone |
| `--pending` | #6366F1 | Newly reported, "Reported" timeline step |
| `--progress` | #FBBF24 | "In Progress" |
| `--success` | #16A34A | Resolved pins, praise leaderboard |
| `--neutral-bg` | #F8FAFC | App background |
| `--neutral-text` | #0F172A | Primary text |
| `--card-border` | #E2E8F0 | Card outlines |

## Typography
- Headings: Inter or Poppins, semibold
- Body: Inter, regular
- Ticket numbers / monospace data: `JetBrains Mono` or `Roboto Mono` (makes complaint numbers/receipts feel "official")

## Core Components
- **Status Pill** — rounded-full, colored per status token, used on map popups, ticket lists, timeline
- **Status Timeline** — vertical stepper, filled circle = completed, hollow = pending, connecting line colored by progress
- **Leaderboard Table** — zebra rows, worst-first (accountability) sorted descending by overdue count; best-first (performance) sorted descending by resolved %
- **Map Pin** — teardrop marker colored by status; heatmap uses a soft radial gradient blend (green→yellow→orange→red) never harsh blocks
- **Receipt Card** — bordered card mimicking a real government receipt layout; monospace ticket number top-right; QR bottom-right
- **Budget Card** — if no `source_url` exists, render a muted gray card saying "Public budget data unavailable" — never leave it blank or guess

## Layout Principles
- Public dashboard should read cleanly on a projector (judges will view it live) — large numbers, high contrast, minimal clutter
- Mobile-first for the reporting flow (citizens report from their phone)
- Keep the "Leaderboard of Shame" framing internal only — in the actual UI it's labeled **"Public Accountability"**, factual tone, not punitive

## Accessibility
- Status conveyed by color **and** icon/label (colorblind-safe) — e.g. red pin also has a small "!" icon
- All interactive elements minimum 44px tap target (mobile reporting flow)
