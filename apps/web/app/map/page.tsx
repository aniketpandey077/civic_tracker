'use client';

import React, { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import { getStoredIssues } from '@/lib/store';
import { CivicIssue } from '@/lib/types';
import { Map, Flame, ShieldAlert, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function MapPage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);

  useEffect(() => {
    setIssues(getStoredIssues());
  }, []);

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const overdueCount = issues.filter(i => i.status !== 'resolved' && new Date(i.deadline_at).getTime() < Date.now()).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Map className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              City-Wide Civic Issue Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial tracking with density heatmap overlay and municipal ward boundaries
          </p>
        </div>

        <Link
          href="/report"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report at Current Location</span>
        </Link>
      </div>

      {/* Mini Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#6366F1]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending</span>
            <p className="text-base font-bold text-slate-900">{pendingCount} tickets</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#EAB308]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">In Progress</span>
            <p className="text-base font-bold text-slate-900">{inProgressCount} tickets</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#059669]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Resolved</span>
            <p className="text-base font-bold text-emerald-700">{resolvedCount} tickets</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#E11D48]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Overdue SLA</span>
            <p className="text-base font-bold text-rose-700">{overdueCount} escalated</p>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <MapView issues={issues} showHeatmapDefault={false} />
      </div>
    </div>
  );
}
