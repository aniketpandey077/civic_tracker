'use client';

import React from 'react';
import { Trophy, AlertOctagon, ArrowUpRight, ShieldCheck, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ZoneLeaderboardAccountability, ZoneLeaderboardPerformance } from '../lib/types';

interface LeaderboardTableProps {
  type: 'accountability' | 'performance';
  accountabilityData?: ZoneLeaderboardAccountability[];
  performanceData?: ZoneLeaderboardPerformance[];
}

export default function LeaderboardTable({
  type,
  accountabilityData = [],
  performanceData = [],
}: LeaderboardTableProps) {
  if (type === 'accountability') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
              <th className="pb-3 pl-3">Rank</th>
              <th className="pb-3">Zone / Department</th>
              <th className="pb-3 text-center">Open Tickets</th>
              <th className="pb-3 text-center text-amber-600 dark:text-amber-400">Overdue SLA</th>
              <th className="pb-3 text-right pr-3">Avg Unresolved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {accountabilityData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                  No active overdue tickets found in municipal network.
                </td>
              </tr>
            ) : (
              accountabilityData.map((row, idx) => {
                const hasCritical = row.overdue_count > 0;
                return (
                  <tr
                    key={row.zone_id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      hasCritical ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{row.zone_name}</div>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{row.department}</div>
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {row.open_issues}
                    </td>
                    <td className="py-3.5 text-center">
                      {row.overdue_count > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{row.overdue_count} Overdue</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">0</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {row.avg_days_unresolved}d
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
            <th className="pb-3 pl-3">Rank</th>
            <th className="pb-3">Zone / Department</th>
            <th className="pb-3 text-center">Resolved / Total</th>
            <th className="pb-3 text-center text-emerald-600 dark:text-emerald-400">Resolution Rate</th>
            <th className="pb-3 text-right pr-3">Avg Fix Speed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {performanceData.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                Performance data will update as work orders complete.
              </td>
            </tr>
          ) : (
            performanceData.map((row, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <tr
                  key={row.zone_id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isFirst ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <td className="py-3.5 pl-3 font-mono font-bold">
                    {isFirst ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                        🥇 #1
                      </span>
                    ) : isSecond ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300">
                        🥈 #2
                      </span>
                    ) : isThird ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-900/30 text-amber-500 border border-amber-800">
                        🥉 #3
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{row.zone_name}</div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{row.department}</div>
                  </td>
                  <td className="py-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {row.resolved_count} / {row.total_count}
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, row.resolution_rate_percent))}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {row.resolution_rate_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right pr-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {row.avg_resolution_days}d
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
