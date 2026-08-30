import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
let y = 15;

function checkPageBreak(neededSpace = 20) {
  if (y + neededSpace >= pageHeight - 15) {
    doc.addPage();
    y = 15;
  }
}

// ── HEADER ──
doc.setFillColor(37, 99, 235); // #2563EB Blue
doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.text('CIVICTRACKER — Complete Backend & Technical Architecture', 20, y + 10);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.text('API Lifecycles • Vision AI Pipeline • Spatial GIS Geometry • Database Models • Security', 20, y + 17);

y += 32;

// ── SECTION 1: SYSTEM OVERVIEW ──
doc.setTextColor(37, 99, 235);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('1. BACKEND OVERVIEW & TECH STACK', 14, y);
y += 6;

const stack = [
  ['API Runtime', 'Next.js 15 Serverless Edge API Routes (/api/v1/ai/...)', 'Stateless autoscaling 10 - 1M requests'],
  ['Database', 'Firebase Firestore (Realtime DB) + PostgreSQL DDL', 'Sub-second real-time sync & audit trails'],
  ['AI Vision', 'Google Gemini 2.0 / 1.5 Flash Vision API + YOLOv8', 'Dual-stage intake validation & repair audit'],
  ['Spatial GIS', 'Ray-Casting Point-in-Polygon + OSM Nominatim', 'Automated ward polygon routing & distance'],
  ['Auth & RBAC', 'Firebase Auth with Role-Based Access Control', 'Verified Citizen vs. Municipal Admin permissions'],
];

doc.setFontSize(8);
for (const [layer, tech, role] of stack) {
  checkPageBreak(11);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 8.5, 1, 1, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(layer + ':', 17, y + 5.5);
  
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'normal');
  doc.text(tech, 45, y + 5.5);
  
  doc.setTextColor(100, 116, 139);
  doc.text('— ' + role, 118, y + 5.5);
  y += 10;
}

y += 4;

// ── SECTION 2: API ENDPOINTS ──
checkPageBreak(40);
doc.setTextColor(37, 99, 235);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('2. CORE API ROUTES & REQUEST LIFECYCLES', 14, y);
y += 6;

const apis = [
  [
    'POST /api/v1/ai/gemini-analyze (Stage-1 Intake Vision)',
    '1. Client sends { image: base64, category_hint?: string }.\n2. Gemini Flash Vision evaluates image as a certified municipal civil engineer.\n3. Validates defect type (POTHOLE, GARBAGE, WATER_LEAK, OPEN_MANHOLE), computes severity (1-5), and confidence score.\n4. Rejects memes, selfies, and non-defect photos before docket creation.'
  ],
  [
    'POST /api/v1/ai/gemini-verify-resolution (Stage-2 Repair Auditor)',
    '1. Receives { before_image, after_image, defect_type }.\n2. Sends multi-part payload to Gemini Vision to compare Before vs. After structural integrity.\n3. Checks if pothole is leveled, garbage cleared, or leak welded.\n4. Returns binary YES (Resolved -> status flip) or NO (Rework Required -> blocks closure).'
  ],
];

for (const [title, flow] of apis) {
  checkPageBreak(25);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, pageWidth - 28, 22, 1.5, 1.5, 'F');
  
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(title, 17, y + 4.5);
  
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const splitFlow = doc.splitTextToSize(flow, pageWidth - 36);
  doc.text(splitFlow, 17, y + 8.5);
  y += 24.5;
}

y += 2;

// ── SECTION 3: DATABASE SCHEMA ──
checkPageBreak(40);
doc.setTextColor(37, 99, 235);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('3. DATABASE ARCHITECTURE (Firestore & SQL)', 14, y);
y += 6;

const models = [
  ['civic_issues', 'id, complaint_number (CTR-2026-...), category, title, description, status, severity (1-5), lat/lng, zone_id, zone_name, department, reported_at, deadline_at (+15d), resolved_at, image_url, resolution_image_url, upvotes'],
  ['civic_users', 'uid, email, displayName, photoURL, role (citizen | admin), permanentCivicScore (100-1000), quarterlyPoints (Q1-Q4), tier (Platinum/Gold/Silver/Bronze)'],
  ['issue_status_history', 'id, issue_id, previous_status, new_status, changed_by, change_note, timestamp (Immutable audit trail)'],
];

for (const [col, fields] of models) {
  checkPageBreak(14);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 11, 1, 1, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Collection [${col}]:`, 17, y + 4);
  
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const splitFields = doc.splitTextToSize(fields, pageWidth - 36);
  doc.text(splitFields, 17, y + 7.5);
  y += 13;
}

y += 3;

// ── SECTION 4: SPATIAL GIS & SLA ENGINE ──
checkPageBreak(45);
doc.setTextColor(37, 99, 235);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('4. SPATIAL GIS ALGORITHM & SLA ENGINE', 14, y);
y += 6;

const algos = [
  ['Point-in-Polygon (Ray-Casting GIS)', 'Mathematical algorithm in zoneMatcher.ts that casts a horizontal ray from citizen GPS coordinates across municipal ward polygon vertices. Dispatches dockets directly to PWD, Sanitation, or Water Board with 0ms manual routing latency.'],
  ['15-Day Statutory SLA & Escalation', 'Calculates deadline_at = reported_at + 15 days. Real-time cron and query auditors flag overdue tickets publicly on the Accountability Leaderboard, notifying the Municipal Commissioner. 500 upvotes compresses SLA to 48h emergency priority.'],
  ['Civic Sense Scoring & Quarterly Reset', '+50 pts reporting, +100 pts resolution, +30 pts validation, +10 pts upvote. Permanent score (100-1000) preserved indefinitely; competition points reset every 3 months (Q1-Q4) to award official Government Merit Certificates.'],
];

for (const [title, text] of algos) {
  checkPageBreak(18);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 15, 1.5, 1.5, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(title, 17, y + 4.5);
  
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const splitText = doc.splitTextToSize(text, pageWidth - 36);
  doc.text(splitText, 17, y + 8.5);
  y += 17.5;
}

// ── SECTION 5: SECURITY & PERFORMANCE ──
checkPageBreak(30);
doc.setTextColor(37, 99, 235);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('5. SECURITY & PERFORMANCE ARCHITECTURE', 14, y);
y += 6;

const sec = [
  '• Client-Side Compression: HTML5 Canvas compresses high-res camera photos to ~150KB, enabling instant uploads over 2G/3G.',
  '• Tamper-Proof Audit Trail: All status changes are logged immutably in issue_status_history with timestamp and author.',
  '• Role-Based Access (RBAC): Department workers require authenticated role tokens; citizens can only modify their own dockets.',
  '• Real-Time Scalability: Firestore reactive snapshots deliver instant live leaderboard updates to thousands of connected clients.',
];

doc.setFontSize(8);
doc.setTextColor(51, 65, 85);
for (const s of sec) {
  checkPageBreak(7);
  doc.text(s, 14, y);
  y += 5.5;
}

// Save PDF
const out1 = path.resolve('..', 'CivicTracker_Backend_Architecture_Guide.pdf');
const out2 = path.resolve('public', 'CivicTracker_Backend_Architecture_Guide.pdf');
const bytes = doc.output('arraybuffer');

fs.writeFileSync(out1, Buffer.from(bytes));
fs.writeFileSync(out2, Buffer.from(bytes));
fs.writeFileSync(path.resolve('c:/Users/aniket pandey/Downloads/civicpulse-ai/CivicTrack/CivicTracker_Backend_Architecture_Guide.pdf'), Buffer.from(bytes));

console.log('Backend Architecture PDF generated successfully!');
