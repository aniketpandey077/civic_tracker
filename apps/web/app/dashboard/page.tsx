'use client';

import React, { useEffect, useState } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { fetchAccountabilityLeaderboard, fetchPerformanceLeaderboard, fetchDashboardMetrics } from '@/lib/db';
import { ZoneLeaderboardAccountability, ZoneLeaderboardPerformance, DashboardMetrics, ZoneBudgetData } from '@/lib/types';
import LeaderboardTable from '@/components/LeaderboardTable';
import BudgetCard from '@/components/BudgetCard';
import zoneBudgets from '../../../../data/budget/zone_budgets.json';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [accountabilityData, setAccountabilityData] = useState<ZoneLeaderboardAccountability[]>([]);
  const [performanceData, setPerformanceData] = useState<ZoneLeaderboardPerformance[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch real data from Supabase
    fetchAccountabilityLeaderboard().then(setAccountabilityData);
    fetchPerformanceLeaderboard().then(setPerformanceData);
    fetchDashboardMetrics().then(setMetrics);
  }, []);


  const formatRate = (rate: number) => {
    // If decimal e.g. 0.964 -> 96.4%, if already 96.4 -> 96.4%
    const val = rate <= 1 ? rate * 100 : rate;
    return val.toFixed(1);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/40">
            <BarChart3 className="w-5 h-5 text-[#1A56A4]" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2328] tracking-tight">
            Municipal Accountability & Leaderboards
          </h1>
        </div>
        <p className="text-xs text-[#6B6860] mt-1">
          Objective performance and accountability rankings across municipal wards, evaluated purely by resolution times and citizen verification rates.
        </p>
      </div>

      {/* Overview Stat Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-[#C9C4BA] space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#6B6860]">Total Logged Tickets</span>
            <div className="text-3xl font-extrabold text-[#1E2328] font-mono-data">{metrics.total_issues}</div>
            <p className="text-[11px] text-[#6B6860]">Across municipal ward network</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#C9C4BA] space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#176B3A]">Citizen Verification Rate</span>
            <div className="text-3xl font-extrabold text-[#176B3A] font-mono-data">
              {formatRate(metrics.citizen_verification_rate)}%
            </div>
            <p className="text-[11px] text-[#6B6860]">Confirmed via Before/After proof</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#C9C4BA] space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#D95F02]">Average Resolution Time</span>
            <div className="text-3xl font-extrabold text-[#D95F02] font-mono-data">{metrics.avg_resolution_days} Days</div>
            <p className="text-[11px] text-[#6B6860]">Against 15-day target SLA</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#C9C4BA] space-y-1">
            <span className="text-[11px] uppercase font-bold text-rose-400">Overdue SLA Escalations</span>
            <div className="text-3xl font-extrabold text-rose-400 font-mono-data">{metrics.overdue_issues}</div>
            <p className="text-[11px] text-[#6B6860]">Exceeded standard 15d window</p>
          </div>
        </div>
      )}

      {/* Dual Leaderboards: Accountability vs Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accountability Table (Worst-First) */}
        <div className="glass-card rounded-3xl p-6 border border-[#C9C4BA] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-950/80 text-[#D95F02] border border-[#D95F02]/40">
                <AlertOctagon className="w-4 h-4 text-[#D95F02]" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-[#1E2328]">Public Accountability Ranking</h3>
                <p className="text-[11px] text-[#6B6860]">Sorted by overdue SLA count (Highest backlogs first)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 border border-[#D95F02]/40 px-2.5 py-0.5 rounded-full">
              Attention Required
            </span>
          </div>

          <LeaderboardTable
            type="accountability"
            accountabilityData={accountabilityData}
          />
        </div>

        {/* Performance Table (Best-First) */}
        <div className="glass-card rounded-3xl p-6 border border-[#C9C4BA] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-[#EDFBF0] text-[#176B3A] border border-emerald-500/40">
                <Trophy className="w-4 h-4 text-[#176B3A]" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-[#1E2328]">Performance Honor Roll</h3>
                <p className="text-[11px] text-[#6B6860]">Sorted by verified resolution rate (% resolved)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#176B3A] bg-[#EDFBF0] border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C9C4BA] shadow-xl space-y-6">
        <BudgetCard budgets={zoneBudgets as ZoneBudgetData[]} />
      </div>
    </div>
  );
}
