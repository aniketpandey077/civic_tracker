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
  Wrench,
  Sparkles
} from 'lucide-react';
import { getStoredIssues, upvoteIssue } from '@/lib/store';
import { CivicIssue } from '@/lib/types';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';

export default function MyComplaintsPage() {
  const [mounted, setMounted] = useState(false);
  const [rawIssues, setRawIssues] = useState<CivicIssue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssueForEvidence, setSelectedIssueForEvidence] = useState<CivicIssue | null>(null);

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
            <span className="p-2 rounded-xl bg-[#D95F02]/10 text-[#D95F02] border border-[#D95F02]/30">
              <FileText className="w-5 h-5 text-[#D95F02]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2328] tracking-tight">
              Municipal Defect Docket Ledger
            </h1>
          </div>
          <p className="text-xs text-[#6B6860] font-medium mt-1">
            Official civic grievances ordered from <strong className="text-[#D95F02] font-semibold">nearest to farthest</strong> relative to GPS fix ({userLocation.city}).
          </p>
        </div>

        {/* New Complaint Action Button */}
        <Link
          href="/report"
          className="px-5 py-2.5 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          <span>+ File Defect Docket</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6B6860] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket # (CTR-2026...), title, category, or ward..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#C9C4BA] rounded-xl outline-none focus:border-[#D95F02] font-medium text-[#1E2328] placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B6860] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white border border-[#C9C4BA] rounded-xl outline-none focus:border-[#D95F02] font-semibold text-[#2D3340] w-full sm:w-auto"
          >
            <option value="all">All Statuses ({rawIssues.length})</option>
            <option value="pending">Pending Inspection</option>
            <option value="verified">Verified Field</option>
            <option value="assigned">Assigned Contractor</option>
            <option value="in_progress">Awaiting Citizen Vote</option>
            <option value="resolved">Resolved & Confirmed</option>
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

          const statusDisplayLabel = 
            issue.status === 'resolved' ? 'Resolved & Verified' :
            issue.status === 'in_progress' ? 'Awaiting Citizen Vote' :
            issue.status === 'assigned' ? 'Assigned Contractor' :
            issue.status === 'verified' ? 'Verified Field' : 'Pending Inspection';

          if (!mounted) return null;

    return (
            <div
              key={issue.id}
              className="glass-card glass-card-hover rounded-2xl p-5 border border-[#C9C4BA] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs font-mono-data font-bold text-[#2D3340] bg-[#E8E5DF] border border-[#C9C4BA] px-2 py-0.5 rounded-lg">
                    {issue.complaint_number}
                  </span>

                  <div className="flex items-center space-x-1">
                    {/* Proximity Distance Badge */}
                    <span className="bg-[#E8E5DF] text-[#D95F02] border border-[#D95F02]/40 text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Navigation className="w-3 h-3 text-[#D95F02] shrink-0" />
                      <span>{issue.distanceFormatted}</span>
                    </span>

                    {/* AI Severity Badge */}
                    {issue.ai_severity !== undefined && (
                      <span
                        className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
                          issue.ai_severity < 30
                            ? 'bg-[#EDFBF0] text-[#176B3A] border-[#176B3A]'
                            : issue.ai_severity <= 60
                            ? 'bg-[#EEF4FF] text-[#1A56A4] border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        Sev: {issue.ai_severity}/100
                      </span>
                    )}

                    {/* 45-Day Escalated Badge */}
                    {issue.escalation_email_sent_at && (
                      <span className="bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        45d Escalated
                      </span>
                    )}

                    {isResolved ? (
                      <span className="bg-[#EDFBF0] text-[#176B3A] border border-[#176B3A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    ) : isOverdue ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#D95F02]" /> Overdue
                      </span>
                    ) : (
                      <span className="bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {statusDisplayLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Photo Thumbnail + Info */}
                <div className="flex space-x-3">
                  <div className="w-20 h-20 bg-[#E8E5DF] shrink-0 border border-[#C9C4BA] rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/track/${issue.complaint_number}`}>
                      <h3 className="text-xs font-extrabold text-[#1E2328] line-clamp-2 leading-snug hover:text-[#D95F02] transition-colors">
                        {issue.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-[#6B6860] line-clamp-1">{issue.description}</p>
                    <div className="text-[10px] text-[#6B6860] font-medium flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#D95F02] shrink-0" />
                      <span className="truncate">{issue.zone_name}</span>
                    </div>
                  </div>
                </div>

                {/* SLA Countdown Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6B6860] font-medium">
                    <span>SLA Countdown: <strong className="font-mono-data text-[#D95F02]">{diffDays > 0 ? `${diffDays} days left` : 'Expired'}</strong></span>
                    <span>{issue.upvote_count >= 500 ? '5-Day Emergency' : '15-Day Target'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E5DF] rounded-full overflow-hidden border border-[#C9C4BA]">
                    <div
                      className={`h-full ${isOverdue ? 'bg-[#D95F02]' : isResolved ? 'bg-[#176B3A]' : 'bg-cyan-500'}`}
                      style={{ width: `${Math.max(0, Math.min(100, (diffDays / 15) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: SLA, Fix Defect & Upvote */}
              <div className="pt-3 border-t border-[#C9C4BA] flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForEvidence(issue)}
                  className="px-3 py-1.5 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-950" />
                  <span>Resolve Defect</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleUpvote(issue.id, e)}
                    className="flex items-center space-x-1 text-[#4B5563] hover:text-[#D95F02] bg-[#E8E5DF] hover:bg-[#C9C4BA] px-2 py-1 rounded-lg border border-[#C9C4BA] transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3 text-[#D95F02]" />
                    <span className="font-mono-data font-bold text-[11px]">{issue.upvote_count}</span>
                  </button>

                  <Link
                    href={`/track/${issue.complaint_number}`}
                    className="text-[#1A56A4] hover:text-[#1A56A4] font-bold text-xs flex items-center"
                  >
                    Docket <ArrowRight className="w-3 h-3 ml-0.5" />
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
