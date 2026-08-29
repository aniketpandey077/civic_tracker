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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-base font-bold text-slate-900">Citizen Verification Guardrail</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Only citizens can confirm whether this defect was physically repaired on-site.
          </p>
        </div>

        {/* Contractor Credit & Evidence Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center space-x-2 text-xs text-slate-800 font-bold border-b border-slate-200 pb-2">
            <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Repair Contractor: <span className="text-emerald-800">{contractorName}</span></span>
          </div>

          {evidence?.after_photo_url && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Uploaded Resolution Photo
              </span>
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-300">
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
            <span className="text-slate-500">Ticket Number:</span>
            <span className="font-mono font-bold text-slate-800">{issue.complaint_number}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Zone / Dept:</span>
            <span className="font-medium text-slate-800">{issue.zone_name}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Citizen Inspection Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Inspected site today, asphalt was smoothly patched by contractor."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('rejected')}
            className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>No, Still Broken</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('confirmed')}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Yes, Verified Fixed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
