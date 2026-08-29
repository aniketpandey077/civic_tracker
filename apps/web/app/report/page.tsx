'use client';

import React from 'react';
import ReportForm from '@/components/ReportForm';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/40 text-xs font-semibold px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-[#1A56A4]" />
          <span>YOLOv8 Edge Computer Vision Enabled</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E2328] tracking-tight">
          Register a Civic Defect Docket
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6860] max-w-md mx-auto">
          Capture live photo evidence. Our AI model inspects the defect, resolves your municipal ward, and creates an official traceable ticket.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C9C4BA] shadow-2xl">
        <ReportForm />
      </div>

      {/* Disclosures */}
      <div className="p-4 bg-[#E8E5DF] border border-[#C9C4BA] rounded-2xl space-y-1 text-xs text-[#6B6860]">
        <div className="flex items-center space-x-1.5 font-bold text-[#D95F02]">
          <ShieldCheck className="w-4 h-4 text-[#D95F02]" />
          <span>CivicTrack Privacy & Accountability Principles:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B6860] pl-1">
          <li>Reporter personal details are strictly private and never publicly exposed.</li>
          <li>Every report generates an official tamper-evident receipt with QR tracking.</li>
          <li>Point-in-polygon spatial routing assigns the ticket directly to ward authorities.</li>
        </ul>
      </div>
    </div>
  );
}
