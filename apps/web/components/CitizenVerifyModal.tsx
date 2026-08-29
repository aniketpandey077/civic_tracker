'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ShieldCheck, UserCheck, HardHat } from 'lucide-react';
import { CivicIssue } from '../lib/types';
import { verifyResolution, getStoredEvidence } from '../lib/store';

interface CitizenVerifyModalProps {
  issue: CivicIssue;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function CitizenVerifyModal({
  issue,
  isOpen,
  onClose,
  onVerified,
}: CitizenVerifyModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const evidence = getStoredEvidence().find((e) => e.issue_id === issue.id);
  const contractorName =
    evidence?.contractor_name || evidence?.submitted_by || 'Assigned Field Contractor';

  const handleDecision = (decision: 'confirmed' | 'rejected') => {
    setIsSubmitting(true);
    verifyResolution(issue.id, decision, comment);
    setIsSubmitting(false);
    onVerified();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0EEE9]/80 font-mono">
      <div className="bg-[#E8E5DF] text-[#1E2328] max-w-md w-full p-6 border-2 border-[#C9C4BA] shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B6860] hover:text-[#1E2328] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-base font-extrabold text-[#1E2328] uppercase tracking-wider">
            CITIZEN AUDIT GUARDRAIL PROTOCOL
          </h3>
          <p className="text-xs text-[#6B6860] mt-0.5 font-sans">
            Only citizen votes can officially transition field work orders into Resolved status.
          </p>
        </div>

        {/* Contractor Credit & Evidence Summary */}
        <div className="bg-[#F0EEE9] p-3.5 border border-[#C9C4BA] space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold border-b border-[#C9C4BA] pb-2">
            <HardHat className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-[#4B5563]">FIELD CONTRACTOR: <span className="text-orange-400">{contractorName.toUpperCase()}</span></span>
          </div>

          {evidence?.after_photo_url && (
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#6B6860] uppercase tracking-wider block">
                CONTRACTOR RESOLUTION PHOTO
              </span>
              <div className="aspect-video border border-[#C9C4BA] overflow-hidden bg-[#E8E5DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidence.after_photo_url}
                  alt="Contractor Resolution Evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#6B6860]">DOCKET ID:</span>
            <span className="font-bold text-orange-400">{issue.complaint_number}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B6860]">JURISDICTION:</span>
            <span className="font-bold text-[#2D3340]">{issue.zone_name.toUpperCase()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4B5563] uppercase mb-1">
            CITIZEN FIELD AUDIT NOTES (OPTIONAL)
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Inspected site, asphalt patched smoothly."
            className="w-full px-3 py-2 text-xs bg-[#F0EEE9] border border-[#C9C4BA] text-[#1E2328] outline-none focus:border-orange-500 font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('rejected')}
            className="py-2.5 px-3 bg-[#FEF2F2] hover:bg-rose-900 text-rose-200 border border-rose-700 text-xs font-bold uppercase transition-colors flex items-center justify-center space-x-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>REJECT UNRESOLVED</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('confirmed')}
            className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-[#1E2328] text-xs font-bold uppercase border border-emerald-400 transition-colors flex items-center justify-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>CONFIRM FIXED</span>
          </button>
        </div>
      </div>
    </div>
  );
}
