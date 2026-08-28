'use client';

import React from 'react';
import ReportForm from '@/components/ReportForm';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>YOLOv8 Edge Computer Vision Enabled</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Capture live photo evidence. Our AI model inspects the defect, resolves your municipal ward, and creates an official traceable ticket.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <ReportForm />
      </div>

      {/* Non-negotiable Disclosures */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl space-y-1 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CivicTrack Privacy & Accountability Principles:</span>
        </div>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
          <li>Reporter personal details are strictly private and never publicly exposed.</li>
          <li>Every report generates an official tamper-evident PDF receipt with QR tracking.</li>
          <li>Point-in-polygon spatial routing assigns the ticket directly to ward authorities.</li>
        </ul>
      </div>
    </div>
  );
}
