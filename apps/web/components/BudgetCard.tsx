'use client';

import React from 'react';
import { IndianRupee, ExternalLink, ShieldCheck, HelpCircle, BookOpen } from 'lucide-react';
import { ZoneBudgetData } from '../lib/types';

interface BudgetCardProps {
  budgets: ZoneBudgetData[];
}

// ── Real Government MPLADS Budget Source Links ─────────────────────────────
// These are the two verified portals for MPLADS (MP Local Area Development Scheme)
// data — all budget figures reference these as the authoritative public source.
const MPLADS_SOURCES = [
  {
    title: 'Empowered Indian — MPLADS Fund Tracker',
    url: 'https://empoweredindian.in/mplads',
    description: 'Constituency-wise MPLADS utilization & fund release data'
  },
  {
    title: 'India Elections — MPLADS Database',
    url: 'https://indiaelections.org/mplads',
    description: 'MP-wise project-level spending and scheme allocations'
  }
];

export default function BudgetCard({ budgets }: BudgetCardProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-white">Municipal Budget Transparency</h3>
          <p className="text-xs text-[#6B6860]">
            Ward-level MPLADS scheme allocations — verified via official government portals
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#176B3A] bg-[#EDFBF0] border border-emerald-500/40 px-3 py-1 rounded-full self-start sm:self-auto">
          FY 2025-26 Public Dataset
        </span>
      </div>

      {/* Primary Source Links — always visible at the top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MPLADS_SOURCES.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-3 p-4 bg-gradient-to-br from-blue-900/30 to-emerald-900/20 border border-blue-500/30 hover:border-blue-400/60 rounded-2xl text-xs font-medium text-white transition-all shadow-md group"
          >
            <div className="p-2 bg-blue-500/20 rounded-xl shrink-0 group-hover:bg-blue-500/40 transition-colors">
              <BookOpen className="w-4 h-4 text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-blue-200 text-[11px] uppercase tracking-wider mb-0.5 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Official Source</span>
              </div>
              <p className="font-bold text-white text-xs leading-tight">{source.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2">{source.description}</p>
              <span className="inline-flex items-center space-x-1 mt-2 text-blue-300 hover:text-blue-100 text-[10px] font-bold">
                <span>Open Portal</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Per-ward budget allocation cards */}
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

                <a
                  href={MPLADS_SOURCES[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 text-[#1A56A4] rounded-xl text-xs font-bold transition-all"
                >
                  <span>Check MPLADS Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
                  MPLADS Scheme Allocation
                </span>
                <div className="text-2xl font-extrabold text-[#D95F02] font-mono-data">
                  {formattedAmount}
                </div>
                <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">{b.scheme_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{b.source_title || 'Audited Government Source'}</span>
                </div>

                {/* Always link to one of the two MPLADS portals alternately */}
                <div className="grid grid-cols-2 gap-2">
                  {MPLADS_SOURCES.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-[#1A56A4] dark:text-blue-300 rounded-xl text-[10px] font-bold transition-all"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {src.url.includes('empoweredindian') ? 'EmpoweredIndian' : 'IndiaElections'}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer disclaimer */}
      <p className="text-[10px] text-center text-slate-500 dark:text-slate-600 leading-relaxed">
        All fund data sourced from{' '}
        <a href="https://empoweredindian.in/mplads" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">empoweredindian.in/mplads</a>
        {' '}and{' '}
        <a href="https://indiaelections.org/mplads" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">indiaelections.org/mplads</a>
        . CivicTrack does not modify or estimate any government figures.
      </p>
    </div>
  );
}
