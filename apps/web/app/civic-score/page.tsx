'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Sparkles,
  Trophy,
  Medal,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck,
  ThumbsUp,
  ArrowRight,
  Info,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  getCurrentQuarterInfo,
  getCitizenCivicProfile,
  getQuarterlyTop3Leaderboard,
  CitizenCivicProfile,
  QuarterlyCycleInfo,
  GovtCertificateRecord
} from '@/lib/civicScore';
import GovtCertificateModal from '@/components/GovtCertificateModal';

export default function CivicScorePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<CitizenCivicProfile | null>(null);
  const [quarterInfo, setQuarterInfo] = useState<QuarterlyCycleInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<CitizenCivicProfile[]>([]);
  const [selectedCert, setSelectedCert] = useState<GovtCertificateRecord | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const loadData = () => {
    const q = getCurrentQuarterInfo();
    setQuarterInfo(q);
    const p = getCitizenCivicProfile(user);
    setProfile(p);
    const top3 = getQuarterlyTop3Leaderboard(p);
    setLeaderboard(top3);
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, [user]);

  if (!mounted || !profile || !quarterInfo) return null;

  const openCertificate = (cert: GovtCertificateRecord) => {
    setSelectedCert(cert);
    setIsCertModalOpen(true);
  };

  const generateInstantCertForUser = () => {
    const cert: GovtCertificateRecord = {
      certificateId: `MC-CIVIC-${quarterInfo.quarterCode}-0001`,
      quarterCode: quarterInfo.quarterCode,
      quarterLabel: quarterInfo.quarterLabel,
      rank: (profile.quarterRank as any) || 1,
      rankTitle: 'Municipal Medal of Civic Excellence',
      recipientName: profile.displayName,
      recipientEmail: profile.email,
      pointsEarned: profile.lifetimePoints,
      issuesResolved: profile.reportsResolvedCount,
      issueCity: 'Municipal Corporation Ward Area',
      issuedAt: new Date().toISOString(),
      authoritySignature: 'Commissioner of Municipal Governance',
      authorityTitle: 'Director General of Public Infrastructure & Grievances',
    };
    openCertificate(cert);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1A56A4] dark:hover:text-blue-400 bg-white dark:bg-[#151C2C] px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A56A4] dark:text-blue-400" />
          <span>← Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/my-complaints"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#151C2C] px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Reports</span>
          </Link>

          <Link
            href="/report"
            className="inline-flex items-center space-x-1.5 text-xs font-black text-white bg-[#B91C1C] hover:bg-[#991B1B] px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95"
          >
            <span>+ File Grievance</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A56A4] via-[#134688] to-[#176B3A] text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-4 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Civic Sense Scoring & Quarterly Government Honours</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Citizen Civic Score & Honours
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              Every verified grievance you report and solve earns Civic Points. Every 3 months, the <strong className="text-amber-300 font-bold">Top 3 citizens with the highest points</strong> are officially awarded the prestigious <strong className="text-white">Government Certificate of Civic Honour</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center space-y-2 shrink-0 md:w-64">
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">
              Active Quarterly Cycle
            </span>
            <div className="text-xl font-black text-white">
              {quarterInfo.quarterLabel}
            </div>
            <div className="text-xs font-mono text-amber-300 font-bold bg-amber-400/20 py-1 px-2.5 rounded-lg inline-block">
              ⏳ Ends in {quarterInfo.daysRemaining} Days
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${quarterInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3-MONTH RESET & CIVIC SCORE RULES NOTICE */}
      <div className="bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 p-4 sm:p-5 rounded-2xl flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-amber-800 dark:text-amber-300">
            Official Quarterly Reset & Permanent Civic Score Rule
          </h4>
          <p className="leading-relaxed">
            Competition points reset to 0 every 3 months for a fair quarterly race. However, your <strong className="text-amber-900 dark:text-white font-bold">Civic Sense Score (Lifetime Rating)</strong>, earned Badges, and past Government Certificates are <strong className="text-amber-900 dark:text-white font-bold">permanently preserved</strong> for your permanent public service record.
          </p>
        </div>
      </div>

      {/* CITIZEN PROFILE SCORECARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Score Card */}
        <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Permanent Civic Sense Rating
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-[#1A56A4] dark:text-blue-400">
                {profile.civicScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 1000</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1A56A4] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile.civicTier}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>Citizen Account:</span>
              <strong className="text-slate-900 dark:text-white">{profile.displayName}</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>Quarter Rank:</span>
              <strong className="text-amber-600 dark:text-amber-400">#{profile.quarterRank || 1} in Municipal Ward</strong>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Points Ledger (This Quarter vs Lifetime)
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Quarter</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {profile.quarterlyPoints}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Reset in {quarterInfo.daysRemaining}d</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Total</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {profile.lifetimePoints}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Permanent Record</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center justify-between">
              <span>• Verified Reports Filed:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{profile.reportsFiledCount} (+50 pts ea)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>• Problems Successfully Resolved:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{profile.reportsResolvedCount} (+100 pts ea)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>• Community Upvotes Given:</span>
              <strong className="text-blue-600 dark:text-blue-400 font-mono">{profile.upvotesGivenCount} (+10 pts ea)</strong>
            </div>
          </div>
        </div>

        {/* Govt Certificate Action Card */}
        <div className="bg-gradient-to-tr from-amber-500/10 to-amber-500/5 dark:bg-amber-950/20 p-6 rounded-3xl border-2 border-amber-400/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Govt Certificate Status</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Official Civic Honour Certificate
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Conferred by the Municipal Grievance & Urban Works Cell to the top civic leaders of the quarter.
            </p>
          </div>

          <button
            onClick={generateInstantCertForUser}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>View Official Govt Certificate</span>
          </button>
        </div>

      </div>

      {/* TOP 3 QUARTERLY LEADERBOARD PODIUM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Top 3 Citizens in {quarterInfo.quarterLabel}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leading the 3-month municipal race for the Government Civic Honour Award
            </p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1A56A4] dark:text-blue-400 hover:underline"
          >
            <span>Report Defect to Earn Points</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((citizen, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={citizen.userId}
                className={`bg-white dark:bg-[#151C2C] p-6 rounded-3xl border-2 transition-all space-y-4 relative overflow-hidden ${
                  isFirst
                    ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                    : isSecond
                    ? 'border-slate-300 dark:border-slate-600'
                    : 'border-amber-700/50'
                }`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                      isFirst
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                        : isSecond
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300'
                        : 'bg-amber-950/50 text-amber-400 border-amber-800'
                    }`}
                  >
                    {isFirst ? '🥇 Rank #1 (Gold)' : isSecond ? '🥈 Rank #2 (Silver)' : '🥉 Rank #3 (Bronze)'}
                  </span>

                  <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                    {citizen.quarterlyPoints} Pts (Qtr)
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {citizen.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Civic Score: <strong className="text-[#1A56A4] dark:text-blue-400">{citizen.civicScore}</strong> • {citizen.civicTier}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Reports Filed</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{citizen.reportsFiledCount}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolved</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{citizen.reportsResolvedCount}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const c: GovtCertificateRecord = {
                      certificateId: `MC-CIVIC-${quarterInfo.quarterCode}-000${idx + 1}`,
                      quarterCode: quarterInfo.quarterCode,
                      quarterLabel: quarterInfo.quarterLabel,
                      rank: (idx + 1) as any,
                      rankTitle: isFirst ? 'Gold Medal of Civic Excellence' : isSecond ? 'Silver Medal of Civic Honour' : 'Bronze Civic Merit Medal',
                      recipientName: citizen.displayName,
                      recipientEmail: citizen.email,
                      pointsEarned: citizen.lifetimePoints,
                      issuesResolved: citizen.reportsResolvedCount,
                      issueCity: 'Municipal Corporation Jurisdiction',
                      issuedAt: new Date().toISOString(),
                      authoritySignature: 'Commissioner of Municipal Governance',
                      authorityTitle: 'Director General of Public Infrastructure & Grievances',
                    };
                    openCertificate(c);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-300 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Preview Govt Certificate</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Govt Certificate Modal */}
      <GovtCertificateModal
        certificate={selectedCert}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

    </div>
  );
}
