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
          <h3 className="text-lg font-bold text-slate-900">Municipal Budget Transparency</h3>
          <p className="text-xs text-slate-500">
            Ward-level public scheme allocations with audited government source citations
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
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
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{b.zone_name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">
                      Unpublished
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{b.department}</p>
                </div>

                <div className="py-6 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-1">
                  <HelpCircle className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Public budget data unavailable</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-tight">
                    Per CivicTrack rules, unverified figures are never estimated.
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
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
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{b.zone_name}</span>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    {b.fiscal_year}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{b.department}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Public Scheme Allocation
                </span>
                <div className="text-2xl font-extrabold text-slate-900">
                  {formattedAmount}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{b.scheme_name}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center text-[11px] text-emerald-700 font-semibold space-x-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Audited Source</span>
                </span>

                <a
                  href={b.source_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 hover:underline"
                >
                  <span>Verify PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
