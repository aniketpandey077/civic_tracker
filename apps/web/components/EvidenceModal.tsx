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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Resolution Evidence</h3>
            <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Field Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ticket <span className="font-mono font-semibold text-slate-700">{issue.complaint_number}</span> • {issue.zone_name}
          </p>
        </div>

        {/* Before / After Photo Comparator */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
              ● Before (Reported)
            </span>
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issue.photo_url}
                alt="Before Resolution"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              ● After (Completed Fix)
            </span>
            <div className="aspect-video rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-100">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contractor / Repair Lead Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              placeholder="e.g. Sharma Paving Contractors (Lead: Ayush Sharma)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Photo URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={afterPhotoUrl}
              onChange={(e) => setAfterPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Work Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Per CivicTrack rules, this is labeled as <strong>Resolution Evidence</strong> and sent to citizens for confirmation before full closure.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Resolution Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
