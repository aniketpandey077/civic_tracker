# Folder_structure.md — CivicTrack

```
civictrack/
├── apps/
│   ├── web/                          # Member 1 (primary) + Member 4 (dashboard pages)
│   │   ├── app/
│   │   │   ├── report/page.tsx
│   │   │   ├── map/page.tsx
│   │   │   ├── my-complaints/page.tsx
│   │   │   ├── track/[complaintNumber]/page.tsx
│   │   │   ├── dashboard/page.tsx           # public leaderboard + heatmap + budget
│   │   │   ├── api/v1/
│   │   │   │   ├── issues/route.ts
│   │   │   │   ├── issues/[id]/route.ts
│   │   │   │   ├── issues/[id]/upvote/route.ts
│   │   │   │   ├── issues/[id]/status/route.ts
│   │   │   │   ├── issues/[id]/resolution-evidence/route.ts
│   │   │   │   ├── issues/[id]/verify/route.ts
│   │   │   │   ├── issues/[id]/receipt/route.ts
│   │   │   │   ├── issues/nearby/route.ts
│   │   │   │   ├── issues/heatmap/route.ts
│   │   │   │   ├── dashboard/overview/route.ts
│   │   │   │   ├── dashboard/leaderboard/route.ts
│   │   │   │   └── internal/escalation-check/route.ts
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ReportForm.tsx
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── HeatmapLayer.tsx
│   │   │   ├── StatusTimeline.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── BudgetCard.tsx
│   │   │   └── ReceiptQR.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── zoneMatcher.ts
│   │   │   ├── complaintNumber.ts
│   │   │   └── pdfReceipt.ts
│   │   └── package.json
│   │
│   └── ai-service/                   # Member 3 — Python FastAPI microservice
│       ├── main.py
│       ├── detection/
│       │   ├── yolo_model.py         # loads YOLOv8, runs inference
│       │   └── preprocess.py         # OpenCV resize/contrast
│       ├── escalation/
│       │   ├── image_composer.py     # Pillow overlay engine
│       │   └── cron_job.py
│       ├── requirements.txt
│       └── models/                   # trained/pretrained .pt weights
│
├── data/                              # Member 4
│   ├── zones/                        # ward boundary GeoJSON files
│   └── budget/                       # public budget dataset CSVs + source URLs
│
├── db/                                # Member 2
│   ├── migrations/
│   │   └── 001_init_schema.sql
│   └── seed.sql
│
├── docs/                              # this set of files
│   ├── PRD.md
│   ├── application_flow.md
│   ├── Tech_stack.md
│   ├── database_schema.md
│   ├── API_SPEC.md
│   ├── Folder_structure.md
│   ├── Design_system.md
│   ├── task.md
│   ├── project_RULES.md
│   ├── Implementation_status.md
│   └── Next_task.md
│
└── README.md
```

## Ownership map
- `apps/web/app/report`, `map`, `components/CameraCapture.tsx`, `MapView.tsx` → **Member 1**
- `apps/web/app/api/v1/issues/*`, `db/` → **Member 2**
- `apps/ai-service/*` → **Member 3**
- `apps/web/app/dashboard`, `data/`, `components/LeaderboardTable.tsx`, `BudgetCard.tsx` → **Member 4**
