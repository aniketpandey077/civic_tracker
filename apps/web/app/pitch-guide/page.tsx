'use client';

import React from 'react';
import { Printer, Shield, Sparkles, Award, ArrowLeft, CheckCircle2, Clock, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PitchGuidePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 max-w-4xl mx-auto space-y-8 print:p-0 print:m-0">
      
      {/* TOP NAVIGATION / ACTION BAR */}
      <div className="flex items-center justify-between bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CivicTracker Home</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Save as PDF / Print</span>
        </button>
      </div>

      {/* PRINTABLE GUIDE CONTAINER */}
      <div className="bg-white dark:bg-[#111827] p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-10 text-slate-900 dark:text-slate-100 print:shadow-none print:border-none print:p-0">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="CivicTracker" className="w-14 h-14 rounded-2xl shadow-md object-cover" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                CivicTracker Hackathon Defense & Pitch Guide
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Municipal Infrastructure Grievance & Accountability System
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: ELEVATOR PITCH */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
            <Zap className="w-4 h-4" />
            <span>1. The 30-Second Winning Pitch</span>
          </div>
          <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border-l-4 border-[#EA580C] text-sm sm:text-base font-semibold text-orange-950 dark:text-orange-200 leading-relaxed">
            &ldquo;Current municipal grievance systems fail because of zero accountability, fake closures by contractors, and no citizen engagement. <strong>CivicTracker</strong> transforms civic redressal with: (1) <strong>Dual-Stage Vision AI</strong> that validates defects on camera and audits repairs with binary YES/NO proof, (2) <strong>Automated 15-Day SLA with Ray-Casting Spatial Ward Routing</strong>, and (3) <strong>Civic Sense Gamification</strong> that awards official Government Certificates to the Top 3 citizens every quarter.&rdquo;
          </div>
        </section>

        {/* SECTION 2: ARCHITECTURE TABLE */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
            <Shield className="w-4 h-4" />
            <span>2. Technical Architecture & Tech Stack</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Layer</th>
                  <th className="p-3">Technologies</th>
                  <th className="p-3">Core Responsibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Frontend</td>
                  <td className="p-3 font-mono text-[11px]">Next.js 15, React 19, Tailwind CSS</td>
                  <td className="p-3">Responsive UI, Body-Portaled Modals, Interactive GIS Map Layer</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">AI Engine</td>
                  <td className="p-3 font-mono text-[11px]">Google Gemini Vision + YOLOv8 Edge</td>
                  <td className="p-3">Defect Detection, Severity (1-5), Before/After Repair Verification</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Database & Auth</td>
                  <td className="p-3 font-mono text-[11px]">Firebase Firestore & Google Auth</td>
                  <td className="p-3">Real-time Ticket Sync, Role-Based Access (Citizen vs. Dept Admin)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">GIS & Location</td>
                  <td className="p-3 font-mono text-[11px]">OSM Nominatim + Ray-Casting Polygon</td>
                  <td className="p-3">GPS Reverse Geocoding, Municipal Ward Boundary Matching</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: 4 KEY INNOVATIONS */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
            <Sparkles className="w-4 h-4" />
            <span>3. Key Innovations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Dual-Stage Vision AI</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Validates defects at report time and prevents workers from closing tickets with fake/blank photos via Gemini Before/After structural audit.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. 15-Day Statutory SLA</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated statutory countdowns with public overdue escalation and 500-upvote emergency compression.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. Point-in-Polygon Ward Routing</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Ray-casting geometry routes dockets directly to the specific ward department without manual bureaucratic delays.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">4. 3-Month Civic Honours Cycle</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Permanent Civic Sense Rating (100–1000) with quarterly competition resets awarding verifiable Government Certificates of Merit.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: JUDGE QUESTIONS & ANSWERS */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Anticipated Judge Q&A</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="font-bold text-xs text-slate-900 dark:text-white">Q: How do you prevent spam or fake reports?</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                &ldquo;Our client-side canvas compressor optimizes images, and Gemini Vision immediately evaluates the photo. Non-defect images (e.g. memes, selfies) are rejected on-the-fly before a docket is registered.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="font-bold text-xs text-slate-900 dark:text-white">Q: What stops contractors from uploading fake resolution photos?</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                &ldquo;Our Stage-2 AI Resolution Auditor performs Before vs. After comparison. If the defect is still present, Gemini outputs a binary NO and rejects premature closure.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="font-bold text-xs text-slate-900 dark:text-white">Q: Why reset points every 3 months?</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                &ldquo;Quarterly resets give new citizens an equal chance to compete and win official government honours, while their lifetime Civic Sense Rating is permanently preserved.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: DEMO FLOW */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
            <Award className="w-4 h-4" />
            <span>5. The 3-Minute Live Demo Flow</span>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <span><strong>Homepage:</strong> Show live location detection (`PHAGWARA`), real-time metric counters, and CT branding.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <span><strong>Report Issue:</strong> Upload defect photo $\rightarrow$ show instant AI defect classification and severity score.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <span><strong>Department Resolver:</strong> Show proximity-sorted tickets $\rightarrow$ trigger Stage-2 Gemini resolution audit (YES / NO).</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
              <span><strong>SLA Leaderboard:</strong> Show the 10 official municipal wards ranked by speed and resolution rate.</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0">5</span>
              <span><strong>Civic Certificate:</strong> Open User Profile $\rightarrow$ Civic Score $\rightarrow$ open official printable Government Certificate!</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
