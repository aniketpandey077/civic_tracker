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
            <tr className="border-b border-[#C9C4BA] text-[#6B6860] uppercase font-bold text-[10px]">
              <th className="pb-2 pl-2">Rank</th>
              <th className="pb-2">Zone / Department</th>
              <th className="pb-2 text-center">Open Tickets</th>
              <th className="pb-2 text-center text-[#D95F02]">Overdue SLA</th>
              <th className="pb-2 text-right pr-2">Avg Days Unresolved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {accountabilityData.map((row, idx) => {
              const hasCritical = row.overdue_count > 0;
              return (
                <tr
                  key={row.zone_id}
                  className={`hover:bg-[#E8E5DF]/60 transition-colors ${
                    hasCritical ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-3 pl-2 font-mono-data font-bold text-[#6B6860]">
                    #{idx + 1}
                  </td>
                  <td className="py-3">
                    <div className="font-extrabold text-white">{row.zone_name}</div>
                    <div className="text-[11px] text-[#1A56A4]">{row.department}</div>
                  </td>
                  <td className="py-3 text-center font-mono-data font-semibold text-[#4B5563]">
                    {row.open_issues}
                  </td>
                  <td className="py-3 text-center">
                    {row.overdue_count > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                        {row.overdue_count} Overdue
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] font-mono-data">0</span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-2 font-mono-data font-bold text-[#D95F02]">
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
          <tr className="border-b border-[#C9C4BA] text-[#6B6860] uppercase font-bold text-[10px]">
            <th className="pb-2 pl-2">Rank</th>
            <th className="pb-2">Zone / Department</th>
            <th className="pb-2 text-center">Resolved / Total</th>
            <th className="pb-2 text-center text-[#176B3A]">Resolution Rate</th>
            <th className="pb-2 text-right pr-2">Avg Fix Speed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {performanceData.map((row, idx) => {
            const isTop = idx === 0;
            return (
              <tr
                key={row.zone_id}
                className={`hover:bg-[#E8E5DF]/60 transition-colors ${
                  isTop ? 'bg-[#EDFBF0]/20' : ''
                }`}
              >
                <td className="py-3 pl-2 font-mono-data font-bold">
                  {isTop ? (
                    <span className="flex items-center text-[#176B3A] font-extrabold">
                      🥇 #1
                    </span>
                  ) : (
                    <span className="text-[#6B6860]">#{idx + 1}</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="font-extrabold text-white">{row.zone_name}</div>
                  <div className="text-[11px] text-[#1A56A4]">{row.department}</div>
                </td>
                <td className="py-3 text-center font-mono-data font-semibold text-[#4B5563]">
                  {row.resolved_count} / {row.total_count}
                </td>
                <td className="py-3 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-16 h-2 bg-[#F0EEE9] rounded-full overflow-hidden border border-[#C9C4BA]">
                      <div
                        className="h-full bg-[#176B3A] rounded-full"
                        style={{ width: `${row.resolution_rate_percent}%` }}
                      />
                    </div>
                    <span className="font-mono-data font-bold text-[#176B3A]">
                      {row.resolution_rate_percent}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right pr-2 font-mono-data font-bold text-[#176B3A]">
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
