'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ThumbsUp,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  Share2,
  Building2,
  Sparkles,
  ArrowLeft,
  Eye,
  CheckSquare,
  Users,
  ShieldAlert,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { getIssueByIdOrNumber, getStoredHistory, getStoredEvidence, upvoteIssue } from '@/lib/store';
import { CivicIssue, IssueStatusHistory, ResolutionEvidence } from '@/lib/types';
import StatusTimeline from '@/components/StatusTimeline';
import ReceiptCard from '@/components/ReceiptCard';
import CitizenVerifyModal from '@/components/CitizenVerifyModal';
import EvidenceModal from '@/components/EvidenceModal';
import EscalationGraphicModal from '@/components/EscalationGraphicModal';

export default function TrackComplaintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const complaintNumber = params.complaintNumber as string;
  const justCreated = searchParams.get('justCreated') === 'true';
  const justUpvoted = searchParams.get('justUpvoted') === 'true';

  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [evidence, setEvidence] = useState<ResolutionEvidence | null>(null);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [upvoteBanner, setUpvoteBanner] = useState<string | null>(
    justUpvoted ? '🗳️ Photo evidence attached & complaint upvoted successfully!' : null
  );

  const loadTicketData = () => {
    if (!complaintNumber) return;
    const found = getIssueByIdOrNumber(complaintNumber);
    if (found) {
      setIssue(found);
      const allHistory = getStoredHistory().filter(h => h.issue_id === found.id);
      setHistory(allHistory);
      const allEvidence = getStoredEvidence().find(e => e.issue_id === found.id);
      setEvidence(allEvidence || null);
    }
  };

  useEffect(() => {
    loadTicketData();

    // Reactive store update listener
    const handleStoreUpdate = () => {
      loadTicketData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleStoreUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleStoreUpdate);
      }
    };
  }, [complaintNumber]);

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Ticket Not Found</h2>
        <p className="text-xs text-slate-500">
          No civic record was found matching <span className="font-mono font-semibold">{complaintNumber}</span>.
        </p>
        <Link
          href="/map"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Civic Map</span>
        </Link>
      </div>
    );
  }

  const handleUpvoteClick = () => {
    const result = upvoteIssue(issue.id);
    if (result.success && result.issue) {
      setIssue(result.issue);
      if (result.compressed) {
        setUpvoteBanner('⚡ 500 UPVOTES REACHED! Resolution target compressed to 5 days under CivicTrack Accountability Rule.');
      }
    }
  };

  const deadlineDate = new Date(issue.deadline_at);
  const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isResolved = issue.status === 'resolved';
  const isOverdue = !isResolved && diffDays <= 0;

  const getSeverityBadgeClass = (severity: number) => {
    if (severity < 30) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (severity <= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Back Nav & Just Created Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-complaints"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        {justCreated && (
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Ticket Successfully Created & Logged!</span>
          </span>
        )}
      </div>

      {upvoteBanner && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs font-bold text-purple-900 flex items-center justify-between shadow-sm">
          <span>{upvoteBanner}</span>
          <button onClick={() => setUpvoteBanner(null)} className="text-purple-600 hover:text-purple-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Ticket Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                {issue.complaint_number}
              </span>

              {isResolved ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolved & Verified
                </span>
              ) : isOverdue ? (
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> SLA Overdue (Escalated)
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {issue.status.replace('_', ' ')}
                </span>
              )}

              {/* AI Analysis Status / Severity Badge */}
              {issue.ai_severity !== undefined ? (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center space-x-1 ${getSeverityBadgeClass(issue.ai_severity)}`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Severity: {issue.ai_severity}/100</span>
                </span>
              ) : issue.ai_analysis_status === 'analyzing' ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>AI Inference Running in Background...</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {(issue.ai_confidence * 100).toFixed(1)}% AI Confirmed
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{issue.title}</h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">{issue.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center space-x-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{issue.zone_name}</span>
              </span>
              <span className="flex items-center space-x-1 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{issue.department}</span>
              </span>
              <span>•</span>
              <span>Reported: {new Date(issue.reported_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* SLA Countdown Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:w-56 shrink-0 space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Resolution Target
            </span>
            <div className="text-2xl font-extrabold text-slate-900">
              {isResolved ? (
                <span className="text-emerald-600">Closed Fixed</span>
              ) : isOverdue ? (
                <span className="text-rose-600">{Math.abs(diffDays)} Days Overdue</span>
              ) : (
                <span>{diffDays} Days Left</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Deadline: {deadlineDate.toLocaleDateString()}
            </p>
            {issue.upvote_count >= 500 && (
              <span className="text-[10px] font-bold text-purple-700 block">
                ⚡ Compressed 5-day SLA active
              </span>
            )}
          </div>
        </div>

        {/* Community Evidence Gallery if additional photos exist */}
        {issue.additional_photos && issue.additional_photos.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Community Photo Evidence ({issue.additional_photos.length} Photo{issue.additional_photos.length > 1 ? 's' : ''})</span>
            </span>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {issue.additional_photos.map((photo, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-2xs group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Evidence #${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white font-mono text-[9px] px-1 rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar (Upvote, Verify, Evidence, Escalation) */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleUpvoteClick}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              issue.has_upvoted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${issue.has_upvoted ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500'}`} />
            <span>Upvote Urgent ({issue.upvote_count})</span>
          </button>

          {/* Citizen Verification Trigger */}
          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-2xs"
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Citizen Verify (Yes/No)</span>
          </button>

          {/* Resolution Evidence Viewer */}
          <button
            type="button"
            onClick={() => setIsEvidenceModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-teal-600" />
            <span>Resolution Evidence</span>
          </button>

          {/* Overdue Escalation Graphic Mockup */}
          {issue.escalated && (
            <button
              type="button"
              onClick={() => setIsEscalationModalOpen(true)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>View Escalation Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Timeline & Official PDF Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusTimeline
          currentStatus={issue.status}
          history={history}
          reportedAt={issue.reported_at}
          deadlineAt={issue.deadline_at}
        />

        <ReceiptCard issue={issue} />
      </div>

      {/* Modals */}
      <CitizenVerifyModal
        issue={issue}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={loadTicketData}
      />

      <EvidenceModal
        issue={issue}
        existingEvidence={evidence || undefined}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onSubmitted={loadTicketData}
      />

      <EscalationGraphicModal
        issue={issue}
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
      />
    </div>
  );
}
