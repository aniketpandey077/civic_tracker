'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Building2,
  ThumbsUp,
  PlusCircle,
  Camera,
  Navigation,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import { getStoredIssues, upvoteIssue } from '@/lib/store';
import { CivicIssue } from '@/lib/types';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';

export default function MyComplaintsPage() {
  const [rawIssues, setRawIssues] = useState<CivicIssue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssueForEvidence, setSelectedIssueForEvidence] = useState<CivicIssue | null>(null);

  const userLocation = useUserLocation();

  const loadIssues = () => {
    setRawIssues(getStoredIssues());
  };

  useEffect(() => {
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

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    upvoteIssue(id);
    loadIssues();
  };

  // Sort issues nearest to farthest relative to user's live GPS coordinates
  const sortedIssues: SortedCivicIssue[] = sortIssuesByNearest(
    userLocation.latitude,
    userLocation.longitude,
    rawIssues
  );

  const filtered = sortedIssues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        issue.complaint_number.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.zone_name.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Location Sorting Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Civic Complaints Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ordered from <strong className="text-emerald-700">nearest to farthest</strong> relative to your GPS coordinates ({userLocation.city}).
          </p>
        </div>

        {/* Large Prominent New Complaint Button */}
        <Link
          href="/report"
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 self-start sm:self-auto ring-2 ring-emerald-400/20"
        >
          <Camera className="w-4 h-4" />
          <span>+ File New Complaint</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket # (CTR-2026...), title, category, or ward..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Statuses ({rawIssues.length})</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Grid (Sorted Nearest to Farthest) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(issue => {
          const isResolved = issue.status === 'resolved';
          const deadlineDate = new Date(issue.deadline_at);
          const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isOverdue = !isResolved && diffDays <= 0;

          return (
            <div
              key={issue.id}
              className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {issue.complaint_number}
                  </span>

                  <div className="flex items-center space-x-1">
                    {/* Proximity Distance Badge */}
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{issue.distanceFormatted}</span>
                    </span>

                    {/* 45-Day Escalated Badge */}
                    {issue.escalation_email_sent_at && (
                      <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>45d Escalated</span>
                      </span>
                    )}

                    {isResolved ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    ) : isOverdue ? (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                        {issue.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Photo Thumbnail + Info */}
                <div className="flex space-x-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/track/${issue.complaint_number}`}>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-emerald-700 transition-colors">
                        {issue.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{issue.description}</p>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{issue.zone_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: SLA, Fix Defect & Upvote */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForEvidence(issue)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>🛠️ Fix Defect</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleUpvote(issue.id, e)}
                    className="flex items-center space-x-1 text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2 py-1 rounded border border-slate-200 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-bold text-[11px]">{issue.upvote_count}</span>
                  </button>

                  <Link
                    href={`/track/${issue.complaint_number}`}
                    className="text-emerald-600 font-bold text-xs flex items-center hover:underline"
                  >
                    Track <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Fix Defect / Upload Repair Photo */}
      {selectedIssueForEvidence && (
        <EvidenceModal
          issue={selectedIssueForEvidence}
          isOpen={!!selectedIssueForEvidence}
          onClose={() => setSelectedIssueForEvidence(null)}
          onSubmitted={loadIssues}
        />
      )}
    </div>
  );
}
