# 🏛️ CivicTrack — AI Municipal Accountability Platform

CivicTrack is an **AI-powered civic grievance and municipal accountability platform** built for hackathons, municipal competitions, and real-world citizen redressal.

---

## ⚡ Quick Start (How to Run in VS Code)

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File ➔ Open Folder...**
3. Select the folder: `c:\Users\lenovo\Downloads\project`

### Step 2: Open VS Code Integrated Terminal
Press **`Ctrl + \``** (or click **Terminal ➔ New Terminal** in the top menu).

### Step 3: Install Dependencies (Only Once)
```powershell
cd apps/web
npm install
```

### Step 4: Start the Development Server
```powershell
npm run dev
```

### Step 5: Open in Browser
Open Google Chrome and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Lightweight & Clean Tech Stack

We used modern, beginner-friendly, standard industry libraries without unnecessary bloat:

| Technology | Purpose | Why It's Great for Hackathons |
|:---|:---|:---|
| **Next.js 14 (App Router)** | Full-Stack React Framework | Fast SSR, clean API routes, zero server configuration |
| **Tailwind CSS** | Utility-first styling | Clean responsive UI with zero custom CSS files |
| **Lucide-React** | Modern vector icons | Lightweight, consistent, tree-shakeable icons |
| **Leaflet & OpenStreetMap** | Interactive Geospatial Mapping | 100% Free, open-source maps without paid Google Maps API keys |
| **HTML5 MediaDevices API** | Live camera capture | Directly streams device webcam & phone cameras |
| **Browser Geolocation API** | Real-time GPS & Reverse Geocoding | Captures exact latitude/longitude and matches ward polygons |
| **QRCode & jsPDF / html2canvas** | Digital PDF Receipt Generator | Generates official printable receipts with live tracking QR codes |

---

## 📁 Key File Structure

```
project/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx                     # Landing Page (Hero, KPIs, Map preview)
│       │   ├── layout.tsx                   # Main Layout (Navbar + Footer)
│       │   ├── globals.css                  # Tailwind styles & scanning animations
│       │   ├── report/page.tsx              # Camera capture & issue submission
│       │   ├── map/page.tsx                 # Fullscreen interactive ward map
│       │   ├── my-complaints/page.tsx       # Searchable ticket status repository
│       │   ├── dashboard/page.tsx           # Public accountability & leaderboards
│       │   ├── department/page.tsx          # Staff resolution & evidence portal
│       │   └── track/[complaintNumber]/     # Live ticket timeline & PDF receipt
│       │
│       ├── components/
│       │   ├── Navbar.tsx                   # Top navigation with live city badge & Report CTA
│       │   ├── Footer.tsx                   # Interactive action footer
│       │   ├── CameraCapture.tsx            # Webcam stream, AI scanner, preset shortcuts
│       │   ├── ReportForm.tsx               # Issue category picker & GPS ward routing
│       │   ├── MapView.tsx                  # Leaflet map with custom status pins & locate me
│       │   ├── StatusTimeline.tsx           # Ticket resolution stepper lifecycle
│       │   ├── ReceiptCard.tsx              # Printable QR-code embedded ticket receipt
│       │   ├── LeaderboardTable.tsx         # Dual performance & overdue SLA tables
│       │   └── BudgetCard.tsx               # Ward budget transparency cards
│       │
│       ├── lib/
│       │   ├── types.ts                     # TypeScript data interfaces
│       │   ├── store.ts                     # Local storage state & 500-upvote rule logic
│       │   ├── zoneMatcher.ts               # PostGIS Point-in-Polygon & reverse geocoding
│       │   ├── aiDetector.ts                # YOLOv8 CV inference engine
│       │   ├── complaintNumber.ts           # Unique ticket number generator
│       │   └── useUserLocation.ts           # Auto GPS user city detection hook
│       │
│       ├── package.json                     # Clean dependencies
│       └── tailwind.config.ts               # Custom tokens & color system
```

---

## 🎯 4-Step Hackathon Demo Flow (Pitch Guide)

1. **Step 1: Real-Time Auto Location & Camera Report (`/report`)**
   - Click the big **"Report Civic Issue"** button on the home page.
   - Show how the browser automatically grabs the user's **live GPS location & local ward**.
   - Open the live webcam or click an instant sample preset (e.g. *Fallen Tree* or *Road Pothole*).
   - Show the **YOLOv8 AI scanning animation** and confidence readout.
   - Click **"Submit Complaint & Generate Receipt"**.

2. **Step 2: Digital Ticket & Printable PDF Receipt (`/track/CTR-...`)**
   - Shows the live **Ticket Stepper Timeline** and **15-Day Target SLA**.
   - Show the **Printable Official PDF Receipt** with live QR code that judges can scan on their phones!

3. **Step 3: 500-Upvote Milestone Demonstration**
   - Upvote the ticket past 500 to demonstrate how CivicTrack **compresses the resolution deadline from 15 days down to 5 days**!

4. **Step 4: Department Resolution & Evidence (`/department`)**
   - Switch to the Department Portal, click **"Upload Evidence"**, and attach a Before/After repair proof.
   - Return to the citizen tracking page and click **"Yes, Verified Fixed"** to close the loop!

5. **Step 5: Public Accountability Leaderboard (`/dashboard`)**
   - Highlight the **Accountability Ranking (worst backlogs first)** to show how public transparency drives department performance.
