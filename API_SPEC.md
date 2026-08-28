# API_SPEC.md — CivicTrack

Base URL (Next.js API routes): `/api/v1`
Base URL (Python AI microservice): `/ai`

## Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Supabase auth wrapper — phone/email OTP |
| POST | `/auth/login` | Login |

## Issues (Tickets)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues/report` | Create a new ticket. Body: `{photo_url, category, description, lat, lng}`. Server runs zone-match + generates complaint_number + sets deadline_at = now()+15d |
| GET | `/issues` | List issues. Query params: `zone`, `category`, `status`, `bbox` (map viewport) |
| GET | `/issues/:id` | Full ticket detail incl. status history |
| GET | `/issues/track/:complaint_number` | Public lookup by ticket number, no auth needed |
| PATCH | `/issues/:id/status` | Update status (department/admin only). Logs to `issue_status_history` |
| POST | `/issues/:id/upvote` | One vote per user; triggers deadline compression check at 500 |
| GET | `/issues/nearby?lat=&lng=&radius=200` | Returns unresolved issues within radius (for alerts) |
| GET | `/issues/heatmap?category=` | Returns spatially aggregated density grid |
| GET | `/issues/:id/receipt.pdf` | Generates and streams the PDF receipt with embedded QR |

## Resolution & Verification
| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues/:id/resolution-evidence` | Body: `{before_photo_url, after_photo_url, description}` |
| POST | `/issues/:id/verify` | Citizen response: `{decision: "confirmed"|"rejected", comment}` |

## AI Microservice (FastAPI, separate service)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/detect` | Accepts image file → YOLOv8 + OpenCV pipeline → returns `{detected_class, confidence, is_civic_issue}` |
| POST | `/ai/generate-escalation-image` | Accepts `{photo_url, zone_name, days_elapsed, complaint_number}` → returns composited PNG URL |

## Dashboard / Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/overview` | City-wide counts + avg resolution days |
| GET | `/dashboard/leaderboard/accountability` | Zone-wise open/overdue/avg-days, worst-first |
| GET | `/dashboard/leaderboard/performance` | Zone-wise resolved%/avg-time, best-first |
| GET | `/dashboard/budget/:zone_id` | Public budget data if available, else `{available: false}` |

## Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | User's notifications |
| PATCH | `/notifications/:id/read` | Mark read |

## Internal / Cron (not user-facing)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/internal/escalation-check` | Triggered daily — finds overdue tickets, calls AI image gen, publishes/simulates post, sets `escalated=true` |

## Response Convention
All responses: `{ success: boolean, data?: any, error?: string }`. Errors always include a human-readable `error` message — no raw stack traces returned to the client.
