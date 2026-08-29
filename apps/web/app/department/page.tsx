'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Wrench,
  Upload,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Camera,
  Navigation,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { getStoredIssues, updateIssueStatus } from '@/lib/store';
import { CivicIssue } from '@/lib/types';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';

export default function DepartmentResolverPage() {
  const [mounted, setMounted] = useState(false);
  const [rawIssues, setRawIssues] = useState<CivicIssue[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [search, setSearch] = useState<string>('');
  const [selectedIssueForResolution, setSelectedIssueForResolution] = useState<CivicIssue | null>(null);

  const userLocation = useUserLocation();

  const loadIssues = () => {
    setRawIssues(getStoredIssues());
  };

  useEffect(() => {
    setMounted(true);
    loadIssues();

    const handleStoreUpdate = () => {
      loadIssues();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleStoreUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleStoreUpdate);
      }
    };
  }, []);

  if (!mounted) return null;

  // Sort issues nearest to farthest relative to user's live GPS coordinates
  const sortedIssues: SortedCivicIssue[] = sortIssuesByNearest(
    userLocation.latitude,
    userLocation.longitude,
    rawIssues
  );

  const filtered = sortedIssues.filter((issue) => {
    // Status filter
    if (statusFilter === 'active' && issue.status === 'resolved') return false;
    if (statusFilter !== 'all' && statusFilter !== 'active' && issue.status !== statusFilter) return false;

    // Dept filter
    if (selectedDept !== 'all') {
      if (!issue.department.toLowerCase().includes(selectedDept.toLowerCase())) {
        return false;
      }
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        issue.complaint_number.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.zone_name.toLowerCase().includes(q) ||
        issue.department.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'in_progress':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'verified':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Resolver Header Banner */}
      <div className="bg-white dark:bg-[#151C2C] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Department Field Resolver
            </h1>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
              Proximity Dispatched
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Defects automatically sorted by GPS distance from your current location ({userLocation.city.toUpperCase()}). Resolve defects on-site with live camera proof.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            GPS: {userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nearby defects by docket #, ward, category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full py-2.5 px-3 bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Roads">Roads & Public Works</option>
            <option value="Sanitation">Solid Waste & Sanitation</option>
            <option value="Drainage">Storm Water & Drainage</option>
            <option value="Electricity">Electricity & Streetlights</option>
            <option value="Water">Water Supply & Sewerage</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
          >
            <option value="active">Active Queries Only ({rawIssues.filter(i => i.status !== 'resolved').length})</option>
            <option value="all">All (Including Resolved)</option>
            <option value="pending">Pending Field Inspection</option>
            <option value="in_progress">Work in Progress</option>
            <option value="resolved">Resolved Dockets</option>
          </select>
        </div>
      </div>

      {/* Defect Cards Grid Sorted by Distance */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#151C2C] rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Nearby Defects in this Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All municipal issues nearby have either been resolved or no tickets match the current search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((issue) => {
            const isResolved = issue.status === 'resolved';

            return (
              <div
                key={issue.id}
                className="bg-white dark:bg-[#151C2C] rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Docket & Distance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-[#1A56A4] dark:text-blue-400">
                        {issue.complaint_number}
                      </span>
                      {/* Distance Badge */}
                      <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{issue.distanceText}</span>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-md border ${getStatusBadge(
                        issue.status
                      )}`}
                    >
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Photo & Defect Details */}
                  <div className="flex space-x-3.5">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        DEFECT
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold line-clamp-1">
                        🏢 {issue.department}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{issue.zone_name || 'Ward Area'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Logged: {new Date(issue.reported_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Resolve with Photo Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/track/${issue.complaint_number}`}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#1A56A4] dark:hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>View Docket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isResolved ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Repair Verified</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedIssueForResolution(issue)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Resolve & Upload After Photo</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESOLUTION EVIDENCE MODAL */}
      {selectedIssueForResolution && (
        <EvidenceModal
          issue={selectedIssueForResolution}
          isOpen={!!selectedIssueForResolution}
          onClose={() => setSelectedIssueForResolution(null)}
          onSubmitted={() => {
            loadIssues();
            setSelectedIssueForResolution(null);
          }}
        />
      )}
    </div>
  );
}
