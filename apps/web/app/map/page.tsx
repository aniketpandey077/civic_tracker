'use client';

import React, { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import { getStoredIssues } from '@/lib/store';
import { CivicIssue } from '@/lib/types';
import { Map, Flame, ShieldAlert, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<CivicIssue[]>([]);

  useEffect(() => {
    setMounted(true);
    setIssues(getStoredIssues());
  }, []);

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const overdueCount = issues.filter(i => i.status !== 'resolved' && new Date(i.deadline_at).getTime() < Date.now()).length;

  if (!mounted) return null;

    return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/40">
              <Map className="w-5 h-5 text-[#1A56A4]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2328] tracking-tight">
              Geospatial Municipal Infrastructure Map
            </h1>
          </div>
          <p className="text-xs text-[#6B6860] mt-1">
            Real-time geospatial tracking with density heatmap overlay and municipal ward boundaries
          </p>
        </div>

        <Link
          href="/report"
          className="px-5 py-2.5 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Report at Current Location</span>
        </Link>
      </div>

      {/* Mini Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860]">Pending</span>
            <p className="text-base font-extrabold text-[#1E2328] font-mono-data">{pendingCount} tickets</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#D95F02]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860]">In Progress</span>
            <p className="text-base font-extrabold text-[#1E2328] font-mono-data">{inProgressCount} tickets</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860]">Resolved</span>
            <p className="text-base font-extrabold text-[#176B3A] font-mono-data">{resolvedCount} tickets</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860]">Overdue SLA</span>
            <p className="text-base font-extrabold text-rose-400 font-mono-data">{overdueCount} escalated</p>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="glass-card p-4 rounded-3xl border border-[#C9C4BA] shadow-2xl">
        <MapView issues={issues} showHeatmapDefault={false} />
      </div>
    </div>
  );
}
