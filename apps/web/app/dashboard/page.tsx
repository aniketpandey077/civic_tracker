'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Flame,
  Trophy,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  FileText,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { fetchAccountabilityLeaderboard, fetchPerformanceLeaderboard, fetchDashboardMetrics } from '@/lib/db';
import { ZoneLeaderboardAccountability, ZoneLeaderboardPerformance, DashboardMetrics, ZoneBudgetData } from '@/lib/types';
import LeaderboardTable from '@/components/LeaderboardTable';
import BudgetCard from '@/components/BudgetCard';
import { ZONE_BUDGETS } from '@/lib/budgetData';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [accountabilityData, setAccountabilityData] = useState<ZoneLeaderboardAccountability[]>([]);
  const [performanceData, setPerformanceData] = useState<ZoneLeaderboardPerformance[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch real data from Firebase Firestore
    fetchAccountabilityLeaderboard().then(setAccountabilityData);
    fetchPerformanceLeaderboard().then(setPerformanceData);
    fetchDashboardMetrics().then(setMetrics);
  }, []);

  const formatRate = (rate: number) => {
    const val = rate <= 1 ? rate * 100 : rate;
    return val.toFixed(1);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1A56A4] dark:hover:text-blue-400 bg-white dark:bg-[#151C2C] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A56A4]" />
          <span>← Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/civic-score"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-xs transition-all hover:scale-105"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Civic Score & Honours</span>
          </Link>
          <Link
            href="/my-complaints"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#151C2C] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Reports</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Municipal Accountability & SLA Leaderboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time objective performance rankings across municipal wards, evaluated purely by resolution times and citizen verification proof.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Live Municipal Telemetry Active</span>
        </div>
      </div>

      {/* 4 Rich Interactive Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Tickets */}
          <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Total Logged Tickets
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                {metrics.total_issues}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Across municipal ward network</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span>● 100% Ward Geo-Routed</span>
            </div>
          </div>

          {/* Card 2: Verification Rate */}
          <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Citizen Verification Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatRate(metrics.citizen_verification_rate)}%
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Confirmed via Before/After proof</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>● Tamper-Proof Citizen Guardrail</span>
            </div>
          </div>

          {/* Card 3: Resolution Time */}
          <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-amber-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Avg Resolution Speed
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {metrics.avg_resolution_days} <span className="text-base font-bold">Days</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Against 15-day target SLA</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span>● 68% Faster than statutory SLA</span>
            </div>
          </div>

          {/* Card 4: Overdue Violations */}
          <div className="bg-white dark:bg-[#151C2C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-rose-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Overdue SLA Escalations
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {metrics.overdue_issues}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Exceeded standard 15d window</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>● Automated Secretary Escalation</span>
            </div>
          </div>

        </div>
      )}

      {/* Dual Leaderboards: Accountability vs Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Accountability Table (Worst-First) */}
        <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Public Accountability Ranking</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sorted by overdue SLA count (Highest backlogs first)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 px-3 py-1 rounded-full">
              Attention Required
            </span>
          </div>

          <LeaderboardTable
            type="accountability"
            accountabilityData={accountabilityData}
          />
        </div>

        {/* Performance Table (Best-First) */}
        <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Performance Honor Roll</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sorted by verified resolution rate (% resolved)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-full">
              Top Performers
            </span>
          </div>

          <LeaderboardTable
            type="performance"
            performanceData={performanceData}
          />
        </div>
      </div>

      {/* Budget Transparency Section */}
      <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <BudgetCard budgets={ZONE_BUDGETS} />
      </div>

    </div>
  );
}
