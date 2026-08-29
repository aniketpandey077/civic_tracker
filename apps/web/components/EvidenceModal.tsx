'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import { CivicIssue, ResolutionEvidence } from '../lib/types';
import { submitResolutionEvidence } from '../lib/store';

interface EvidenceModalProps {
  issue: CivicIssue;
  existingEvidence?: ResolutionEvidence;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function EvidenceModal({
  issue,
  existingEvidence,
  isOpen,
  onClose,
  onSubmitted,
}: EvidenceModalProps) {
  const [contractorName, setContractorName] = useState(
    existingEvidence?.contractor_name || 'Sharma Infra Contractors (Ayush Sharma)'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    existingEvidence?.after_photo_url ||
      'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80'
  );
  const [description, setDescription] = useState(
    existingEvidence?.description || 'Physical repairs completed on-site. Asphalt patched and rolled.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    submitResolutionEvidence({
      issue_id: issue.id,
      submitted_by: contractorName,
      contractor_name: contractorName,
      before_photo_url: issue.photo_url,
      after_photo_url: afterPhotoUrl,
      description,
      latitude: issue.latitude,
      longitude: issue.longitude,
    });

    setIsSubmitting(false);
    if (onSubmitted) onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0EEE9]/80 font-mono">
      <div className="bg-[#E8E5DF] text-[#1E2328] max-w-lg w-full p-6 border-2 border-[#C9C4BA] shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B6860] hover:text-[#1E2328] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-[#1E2328] uppercase">RESOLUTION DOCKET EVIDENCE</h3>
            <span className="text-[10px] uppercase font-bold bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5">
              FIELD WORK LOG
            </span>
          </div>
          <p className="text-xs text-[#6B6860] mt-0.5">
            DOCKET <span className="font-bold text-orange-400">{issue.complaint_number}</span> â€¢ {issue.zone_name.toUpperCase()}
          </p>
        </div>

        {/* Before / After Photo Comparator */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
              BEFORE (DEFECT EVIDENCE)
            </span>
            <div className="aspect-video border border-[#C9C4BA] bg-[#F0EEE9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issue.photo_url}
                alt="Before Resolution"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#176B3A] uppercase tracking-wider block">
              AFTER (FIELD REPAIR FIX)
            </span>
            <div className="aspect-video border-2 border-emerald-500 bg-[#F0EEE9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={afterPhotoUrl}
                alt="After Resolution"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Form to submit / edit evidence */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase mb-1">
              CONTRACTOR / REPAIR LEAD NAME <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              placeholder="e.g. Sharma Infra Contractors (Ayush Sharma)"
              className="w-full px-3 py-2 text-xs bg-[#F0EEE9] border border-[#C9C4BA] text-[#1E2328] outline-none focus:border-orange-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase mb-1">
              RESOLUTION PHOTO EVIDENCE URL <span className="text-orange-500">*</span>
            </label>
            <input
              type="url"
              value={afterPhotoUrl}
              onChange={(e) => setAfterPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F0EEE9] border border-[#C9C4BA] text-[#1E2328] outline-none focus:border-orange-500 font-mono text-[11px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5563] uppercase mb-1">
              FIELD REPAIR LOG DESCRIPTION
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F0EEE9] border border-[#C9C4BA] text-[#1E2328] outline-none focus:border-orange-500 font-sans"
              required
            />
          </div>

          <div className="bg-[#F0EEE9] p-2.5 border border-[#C9C4BA] text-[10px] text-[#4B5563] flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>
              Subject to mandatory <strong>CITIZEN CONFIRMATION VOTE</strong> before ticket status advances to Resolved.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#C9C4BA] hover:bg-slate-700 text-[#2D3340] font-bold text-xs uppercase border border-slate-600 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-[#1E2328] font-bold text-xs uppercase border border-orange-400 shadow transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SUBMIT RESOLUTION DOCKET</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
