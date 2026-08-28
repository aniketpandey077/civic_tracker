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
import { getAccountabilityLeaderboard, getPerformanceLeaderboard, getDashboardMetrics } from '@/lib/store';
import { ZoneLeaderboardAccountability, ZoneLeaderboardPerformance, DashboardMetrics, ZoneBudgetData } from '@/lib/types';
import LeaderboardTable from '@/components/LeaderboardTable';
import BudgetCard from '@/components/BudgetCard';
import zoneBudgets from '../../../../data/budget/zone_budgets.json';

export default function DashboardPage() {
  const [accountabilityData, setAccountabilityData] = useState<ZoneLeaderboardAccountability[]>([]);
  const [performanceData, setPerformanceData] = useState<ZoneLeaderboardPerformance[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    setAccountabilityData(getAccountabilityLeaderboard());
    setPerformanceData(getPerformanceLeaderboard());
    setMetrics(getDashboardMetrics());
  }, []);

  const formatRate = (rate: number) => {
    // If decimal e.g. 0.964 -> 96.4%, if already 96.4 -> 96.4%
    const val = rate <= 1 ? rate * 100 : rate;
    return val.toFixed(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Accountability & Leaderboards
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Objective performance and accountability rankings across municipal wards, evaluated purely by resolution times and citizen verification rates.
        </p>
      </div>

      {/* Overview Stat Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Total Logged Tickets</span>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.total_issues}</div>
            <p className="text-[11px] text-slate-400">Across municipal ward network</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-emerald-600">Citizen Verification Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600">
              {formatRate(metrics.citizen_verification_rate)}%
            </div>
            <p className="text-[11px] text-slate-400">Confirmed via Before/After proof</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-amber-600">Average Resolution Time</span>
            <div className="text-3xl font-extrabold text-amber-600">{metrics.avg_resolution_days} Days</div>
            <p className="text-[11px] text-slate-400">Against 15-day target SLA</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-rose-600">Overdue SLA Escalations</span>
            <div className="text-3xl font-extrabold text-rose-600">{metrics.overdue_issues}</div>
            <p className="text-[11px] text-slate-400">Exceeded standard 15d window</p>
          </div>
        </div>
      )}

      {/* Dual Leaderboards: Accountability vs Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accountability Table (Worst-First) */}
        <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900">Public Accountability Ranking</h3>
                <p className="text-[11px] text-slate-500">Sorted by overdue SLA count (Highest backlogs first)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Attention Required
            </span>
          </div>

          <LeaderboardTable
            type="accountability"
            accountabilityData={accountabilityData}
          />
        </div>

        {/* Performance Table (Best-First) */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900">Performance Honor Roll</h3>
                <p className="text-[11px] text-slate-500">Sorted by verified resolution rate (% resolved)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <BudgetCard budgets={zoneBudgets as ZoneBudgetData[]} />
      </div>
    </div>
  );
}
