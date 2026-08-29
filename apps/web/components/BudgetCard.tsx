'use client';

import React from 'react';
import { IndianRupee, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { ZoneBudgetData } from '../lib/types';

interface BudgetCardProps {
  budgets: ZoneBudgetData[];
}

export default function BudgetCard({ budgets }: BudgetCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-white">Municipal Budget Transparency</h3>
          <p className="text-xs text-[#6B6860]">
            Ward-level public scheme allocations with audited government source citations
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#176B3A] bg-[#EDFBF0] border border-emerald-500/40 px-3 py-1 rounded-full self-start sm:self-auto">
          FY 2025-26 Public Dataset
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const hasSource = Boolean(b.source_url && b.allocated_amount);

          if (!hasSource) {
            return (
              <div
                key={b.id}
                className="glass-card border border-[#C9C4BA] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white">{b.zone_name}</span>
                    <span className="text-[10px] bg-[#F0EEE9] text-[#6B6860] border border-[#C9C4BA] px-2 py-0.5 rounded-md font-bold">
                      Unpublished
                    </span>
                  </div>
                  <p className="text-xs text-[#1A56A4] mt-0.5 font-medium">{b.department}</p>
                </div>

                <div className="py-6 text-center bg-[#F0EEE9]/80 rounded-xl border border-dashed border-[#C9C4BA] space-y-1">
                  <HelpCircle className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                  <p className="text-xs font-bold text-[#4B5563]">Public budget data unavailable</p>
                  <p className="text-[11px] text-[#9CA3AF] max-w-[200px] mx-auto leading-tight">
                    Per CivicTrack rules, unverified figures are never estimated.
                  </p>
                </div>

                <div className="text-[10px] text-[#9CA3AF] font-mono-data">
                  Source: Pending municipal disclosure
                </div>
              </div>
            );
          }

          const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(b.allocated_amount!);

          return (
            <div
              key={b.id}
              className="glass-card border border-[#C9C4BA] rounded-2xl p-5 shadow-xl hover:border-[#D95F02]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white">{b.zone_name}</span>
                  <span className="text-[10px] font-mono-data bg-[#EDFBF0] text-[#176B3A] border border-[#176B3A] px-2 py-0.5 rounded-md font-bold">
                    {b.fiscal_year}
                  </span>
                </div>
                <p className="text-xs text-[#1A56A4] mt-0.5 font-medium">{b.department}</p>
              </div>

              <div className="bg-[#F0EEE9]/80 p-4 rounded-xl border border-[#C9C4BA] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#6B6860] tracking-wider">
                  Public Scheme Allocation
                </span>
                <div className="text-2xl font-extrabold text-[#D95F02] font-mono-data">
                  {formattedAmount}
                </div>
                <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">{b.scheme_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{b.source_title || 'Audited Government Source'}</span>
                  </span>
                </div>

                <a
                  href={b.source_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-[#1A56A4] dark:text-blue-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <span>Open Government Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
