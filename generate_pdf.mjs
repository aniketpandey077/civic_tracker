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
doc.setFillColor(234, 88, 12); // #EA580C Orange
doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.text('CIVICTRACKER — Hackathon Defense & Pitch Guide', 20, y + 10);

doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.text('Municipal Infrastructure Grievance & Accountability System • Judge Cheat-Sheet', 20, y + 17);

y += 32;

// ── SECTION 1: 30-SECOND PITCH ──
doc.setTextColor(234, 88, 12);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('1. THE 30-SECOND WINNING PITCH', 14, y);
y += 6;

doc.setFillColor(255, 247, 237); // Light orange box
doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F');
doc.setDrawColor(234, 88, 12);
doc.setLineWidth(0.8);
doc.line(14, y, 14, y + 28);

doc.setTextColor(51, 65, 85);
doc.setFont('helvetica', 'italic');
doc.setFontSize(9);
const pitchText = '"Current municipal complaint portals fail due to zero accountability, fake closures by contractors, and lack of citizen incentives. CivicTracker transforms civic grievance redressal with three pillars: (1) Dual-Stage Vision AI (Gemini) that validates defects on intake and audits Before/After repair photos with a strict binary YES/NO, (2) 15-Day Automated Statutory SLA with Point-in-Polygon Ward Routing, and (3) Civic Sense Gamification rewarding the Top 3 citizens every quarter with official Government Certificates."';
const splitPitch = doc.splitTextToSize(pitchText, pageWidth - 36);
doc.text(splitPitch, 18, y + 6);

y += 36;

// ── SECTION 2: ARCHITECTURE & TECH STACK ──
checkPageBreak(35);
doc.setTextColor(234, 88, 12);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('2. SYSTEM ARCHITECTURE & TECH STACK', 14, y);
y += 6;

const stack = [
  ['Frontend', 'Next.js 15 App Router, React 19, Tailwind CSS', 'Responsive UI, Portaled Modals, GIS Heatmap'],
  ['AI Engine', 'Google Gemini 2.0/1.5 Flash Vision + YOLOv8', 'Defect validation, Severity 1-5, Before/After closure verification'],
  ['Database & Auth', 'Firebase Firestore & Google OAuth', 'Realtime ticket sync, RBAC (Citizen vs. Dept Admin)'],
  ['GIS & Spatial', 'OSM Nominatim + Ray-Casting Polygon', 'GPS reverse geocoding, instant ward polygon routing'],
  ['SLA Engine', 'Automated statutory timers & escalation', '15-day countdown, 500-upvote emergency priority compression'],
];

doc.setFontSize(8.5);
for (const [layer, tech, role] of stack) {
  checkPageBreak(12);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 9, 1, 1, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(layer + ':', 17, y + 6);
  
  doc.setTextColor(234, 88, 12);
  doc.setFont('helvetica', 'normal');
  doc.text(tech, 48, y + 6);
  
  doc.setTextColor(100, 116, 139);
  doc.text('— ' + role, 115, y + 6);
  y += 11;
}

y += 5;

// ── SECTION 3: KEY INNOVATIONS ──
checkPageBreak(40);
doc.setTextColor(234, 88, 12);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('3. CORE INNOVATION PILLARS', 14, y);
y += 6;

const innovations = [
  ['1. Dual-Stage Vision AI', 'Intake AI rejects non-defect photos/memes. Stage-2 Gemini audits Before vs After repair photos with binary YES/NO, preventing fake contractor closures.'],
  ['2. 15-Day Statutory SLA', 'Strict statutory SLA countdown with automatic public overdue escalations to the Municipal Commissioner and emergency compression on 500 upvotes.'],
  ['3. Point-in-Polygon Ward Routing', 'Mathematical ray-casting algorithm matches citizen coordinates directly against municipal ward polygons (PWD, Sanitation, Water Works) without human delays.'],
  ['4. 3-Month Civic Honours Cycle', 'Permanent Civic Sense Rating (100-1000) preserved indefinitely, while competition points reset every quarter to award printable official Government Certificates of Merit.'],
];

for (const [title, desc] of innovations) {
  checkPageBreak(16);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 13, 1.5, 1.5, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, 17, y + 4.5);
  
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const splitDesc = doc.splitTextToSize(desc, pageWidth - 36);
  doc.text(splitDesc, 17, y + 8.5);
  y += 15.5;
}

y += 4;

// ── SECTION 4: JUDGE QUESTIONS & ANSWERS ──
checkPageBreak(50);
doc.setTextColor(234, 88, 12);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('4. TOP JUDGE QUESTIONS & BULLETPROOF ANSWERS', 14, y);
y += 6;

const qas = [
  ['Q: How do you prevent spam or fake complaints?', 'A: Client HTML5 Canvas compresses images, and Gemini Vision evaluates the photo in ~800ms. If a non-defect image (like a meme or selfie) is uploaded, the API rejects it before any database entry is created.'],
  ['Q: What stops contractors from uploading fake "fixed" photos?', 'A: Our Stage-2 AI Resolution Auditor sends both Before and After photos to Gemini Vision. If the pothole/garbage is still present or fix is incomplete, Gemini outputs a binary NO, blocking ticket closure.'],
  ['Q: How does spatial routing work without manual forwarding?', 'A: We use a Ray-Casting point-in-polygon algorithm in zoneMatcher.ts that matches GPS coordinates against municipal polygon coordinates (ADMIN_ZONES) and dispatches directly to the assigned department.'],
  ['Q: Why reset points every 3 months?', 'A: Resetting competition points quarterly allows new citizens an equal opportunity to compete and win government certificates, while permanent Civic Sense ratings (100-1000) are maintained for life.'],
];

for (const [q, a] of qas) {
  checkPageBreak(22);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(q, 14, y);
  y += 4.5;
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 14, 1.5, 1.5, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const splitA = doc.splitTextToSize(a, pageWidth - 36);
  doc.text(splitA, 17, y + 4.5);
  y += 17.5;
}

// ── SECTION 5: 3-MINUTE DEMO SCRIPT ──
checkPageBreak(40);
doc.setTextColor(234, 88, 12);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('5. 3-MINUTE LIVE DEMO SCRIPT FOR JUDGES', 14, y);
y += 6;

const demoSteps = [
  'Step 1 (Homepage /): Highlight live location detection (PHAGWARA), real-time ticket counters, and CT brand identity.',
  'Step 2 (Report /report): Upload a defect photo -> Show instant Gemini Vision defect classification and severity scoring.',
  'Step 3 (Resolver /department): Show proximity-sorted field tickets -> Upload resolution photo -> Trigger Gemini YES/NO audit.',
  'Step 4 (SLA Board /dashboard): Show the 10 official municipal wards ranked by speed and resolution rate (62% to 100%).',
  'Step 5 (Govt Honours /civic-score): Open Profile Modal -> Click Civic Score -> Open printable official Government Certificate!',
];

doc.setFontSize(8);
for (let i = 0; i < demoSteps.length; i++) {
  checkPageBreak(9);
  doc.setTextColor(234, 88, 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`[${i + 1}]`, 14, y);
  
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  const splitStep = doc.splitTextToSize(demoSteps[i], pageWidth - 32);
  doc.text(splitStep, 22, y);
  y += 7.5;
}

// Output PDF to file
const outputPath = path.resolve('c:/Users/aniket pandey/Downloads/civicpulse-ai/CivicTrack/CivicTracker_Pitch_and_Defense_Guide.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('PDF successfully generated at:', outputPath);
