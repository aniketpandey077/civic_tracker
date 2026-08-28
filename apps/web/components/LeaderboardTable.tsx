'use client';

import React from 'react';
import { Trophy, AlertOctagon, ArrowUpRight, ShieldCheck, Flame } from 'lucide-react';
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
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
              <th className="pb-2 pl-2">Rank</th>
              <th className="pb-2">Zone / Department</th>
              <th className="pb-2 text-center">Open Tickets</th>
              <th className="pb-2 text-center text-rose-600">Overdue SLA</th>
              <th className="pb-2 text-right pr-2">Avg Days Unresolved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accountabilityData.map((row, idx) => {
              const hasCritical = row.overdue_count > 0;
              return (
                <tr
                  key={row.zone_id}
                  className={`hover:bg-slate-50 transition-colors ${
                    hasCritical ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <td className="py-3 pl-2 font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{row.zone_name}</div>
                    <div className="text-[11px] text-slate-400">{row.department}</div>
                  </td>
                  <td className="py-3 text-center font-mono font-semibold text-slate-700">
                    {row.open_issues}
                  </td>
                  <td className="py-3 text-center">
                    {row.overdue_count > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {row.overdue_count} Overdue
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-2 font-mono font-bold text-slate-800">
                    {row.avg_days_unresolved}d
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
            <th className="pb-2 pl-2">Rank</th>
            <th className="pb-2">Zone / Department</th>
            <th className="pb-2 text-center">Resolved / Total</th>
            <th className="pb-2 text-center text-emerald-600">Resolution Rate</th>
            <th className="pb-2 text-right pr-2">Avg Fix Speed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {performanceData.map((row, idx) => {
            const isTop = idx === 0;
            return (
              <tr
                key={row.zone_id}
                className={`hover:bg-slate-50 transition-colors ${
                  isTop ? 'bg-emerald-50/40' : ''
                }`}
              >
                <td className="py-3 pl-2 font-mono font-bold">
                  {isTop ? (
                    <span className="flex items-center text-emerald-700 font-extrabold">
                      🥇 #1
                    </span>
                  ) : (
                    <span className="text-slate-500">#{idx + 1}</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="font-bold text-slate-900">{row.zone_name}</div>
                  <div className="text-[11px] text-slate-400">{row.department}</div>
                </td>
                <td className="py-3 text-center font-mono font-semibold text-slate-700">
                  {row.resolved_count} / {row.total_count}
                </td>
                <td className="py-3 text-center">
                  <div className="inline-flex items-center space-x-1.5">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${row.resolution_rate_percent}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      {row.resolution_rate_percent}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right pr-2 font-mono font-bold text-emerald-800">
                  {row.avg_resolution_days}d
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
