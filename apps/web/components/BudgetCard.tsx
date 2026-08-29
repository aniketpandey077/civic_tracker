'use client';

import React from 'react';
import { IndianRupee, ExternalLink, ShieldCheck, HelpCircle, BookOpen, Building2 } from 'lucide-react';
import { ZoneBudgetData } from '../lib/types';

interface BudgetCardProps {
  budgets: ZoneBudgetData[];
}

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Municipal Budget Transparency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ward-level MPLADS scheme allocations — verified via official government transparency portals
          </p>
        </div>
        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-full self-start sm:self-auto uppercase tracking-wider">
          FY 2025-26 Public Dataset
        </span>
      </div>

      {/* Primary Source Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {MPLADS_SOURCES.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500/60 rounded-2xl text-xs font-medium transition-all shadow-xs hover:shadow-md group cursor-pointer"
          >
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="font-extrabold text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Official Source</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug">{source.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">{source.description}</p>
              <span className="inline-flex items-center space-x-1 pt-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-bold">
                <span>Open Public Portal</span>
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
                className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{b.zone_name}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold">
                      Unpublished
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">{b.department}</p>
                </div>

                <div className="py-5 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <HelpCircle className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Public budget data awaiting audit</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-tight">
                    Per CivicTrack rules, unverified figures are never estimated.
                  </p>
                </div>

                <a
                  href={MPLADS_SOURCES[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all"
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
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-400/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{b.zone_name}</span>
                  <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    {b.fiscal_year}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">{b.department}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                  MPLADS Scheme Allocation
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {formattedAmount}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{b.scheme_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{b.source_title || 'Audited Government Source'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {MPLADS_SOURCES.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-all"
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
      <p className="text-[10px] text-center text-slate-400 leading-relaxed">
        All fund data sourced from official public records at{' '}
        <a href="https://empoweredindian.in/mplads" target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-400">empoweredindian.in/mplads</a>
        {' '}and{' '}
        <a href="https://indiaelections.org/mplads" target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-400">indiaelections.org/mplads</a>
        . CivicTrack does not modify or estimate any government figures.
      </p>
    </div>
  );
}
