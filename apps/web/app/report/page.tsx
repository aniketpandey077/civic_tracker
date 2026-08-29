'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReportForm from '@/components/ReportForm';
import { Camera, ShieldCheck, Sparkles, LogIn, Lock, CheckCircle2, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import LoginModal from '@/components/LoginModal';

export default function ReportPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // If user is not logged in, prompt authentication
  if (!loading && !user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C9C4BA] shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1A56A4] to-[#176B3A] text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/30 text-xs font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Citizen Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to File a Grievance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Official municipal dockets require verified citizen authentication to prevent fraudulent spam and ensure traceable SMS / WhatsApp tracking receipts.
            </p>
          </div>

          {/* Key verification benefits */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
            <div className="flex items-center space-x-2 font-bold text-[#176B3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant tamper-evident QR Tracking Receipt</span>
            </div>
            <div className="flex items-center space-x-2 font-bold text-[#176B3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official 15-day SLA deadline enforcement</span>
            </div>
            <div className="flex items-center space-x-2 font-bold text-[#176B3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cryptographic citizen verification consensus</span>
            </div>
          </div>

          {/* 1-Click Google Sign In Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-5 bg-[#1A56A4] hover:bg-[#134688] text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

        </div>

        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1A56A4] dark:hover:text-blue-400 bg-white dark:bg-[#151C2C] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A56A4]" />
          <span>← Back to Home</span>
        </Link>

        <Link
          href="/my-complaints"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1A56A4] bg-white dark:bg-[#151C2C] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Reports</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/40 text-xs font-semibold px-4 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-4 h-4 text-[#1A56A4]" />
          <span>YOLOv8 Edge Computer Vision Enabled</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2328] tracking-tight">
          Register a Civic Defect Docket
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6860] max-w-xl mx-auto leading-relaxed">
          Capture live photo evidence. Our AI model inspects the defect, resolves your municipal ward, and creates an official traceable ticket.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#C9C4BA] shadow-2xl space-y-8">
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
