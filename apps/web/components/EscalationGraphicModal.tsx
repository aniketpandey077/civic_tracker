'use client';

import React from 'react';
import { X, AlertTriangle, Share2, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { CivicIssue } from '../lib/types';

interface EscalationGraphicModalProps {
  issue: CivicIssue;
  isOpen: boolean;
  onClose: () => void;
}

export default function EscalationGraphicModal({
  issue,
  isOpen,
  onClose,
}: EscalationGraphicModalProps) {
  if (!isOpen) return null;

  const daysElapsed = Math.max(
    15,
    Math.round((Date.now() - new Date(issue.reported_at).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E8E5DF]/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B6860] hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-red-100 text-critical">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Automated Public Escalation Graphic</h3>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Auto-composited upon SLA deadline breach and published to public accountability channels
          </p>
        </div>

        {/* Composited Social Poster Card */}
        <div className="rounded-2xl overflow-hidden border-2 border-critical bg-[#F0EEE9] text-[#1E2328] relative shadow-xl">
          {/* Header Banner */}
          <div className="bg-critical px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#1E2328] animate-bounce" />
              <span className="font-extrabold text-xs tracking-wider uppercase">
                CIVICTRACK ESCALATION NOTICE
              </span>
            </div>
            <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded font-bold">
              {issue.complaint_number}
            </span>
          </div>

          {/* Photo with Overlay Overdue Badge */}
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={issue.photo_url}
              alt="Escalated Issue"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

            {/* Overdue Badge */}
            <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur border border-red-400 px-3 py-1.5 rounded-xl shadow-lg">
              <span className="text-xs font-black uppercase tracking-wider block">
                ðŸš¨ {daysElapsed} DAYS UNRESOLVED
              </span>
              <span className="text-[10px] text-red-100 font-semibold">Exceeded 15-Day Public Target</span>
            </div>

            {/* Zone Tag & Details */}
            <div className="absolute bottom-3 left-3 right-3 space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-white backdrop-blur px-2.5 py-1 rounded-lg text-xs border border-[#C9C4BA]">
                <Building2 className="w-3.5 h-3.5 text-[#D95F02]" />
                <span className="font-bold text-[#1E2328]">{issue.zone_name}</span>
                <span className="text-[#6B6860]">â€¢</span>
                <span className="text-[#176B3A] font-semibold">{issue.department}</span>
              </div>
              <p className="text-xs font-bold text-[#1E2328] line-clamp-1">{issue.title}</p>
            </div>
          </div>

          {/* Footer of graphic */}
          <div className="p-3 bg-[#E8E5DF] border-t border-[#C9C4BA] flex items-center justify-between text-[11px]">
            <div className="text-[#4B5563]">
              Responsible Tag: <strong className="text-[#D95F02]">@Jaipur_PWD_Official</strong>
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-mono">
              Track: civictrack.org/track/{issue.complaint_number}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
          <Share2 className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" />
          <span>
            <strong>Simulated Social Channel Dispatch:</strong> In production, this image is queued for public ward feeds. CivicTrack guardrails ensure only department handles are tagged.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#E8E5DF] hover:bg-[#C9C4BA] text-[#1E2328] font-semibold text-xs rounded-xl transition-colors"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
}
