'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Wrench,
  Upload,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getStoredIssues, updateIssueStatus, saveStoredIssues } from '@/lib/store';
import { INITIAL_ISSUES } from '@/lib/seedData';
import { CivicIssue, IssueStatus } from '@/lib/types';
import EvidenceModal from '@/components/EvidenceModal';

export default function DepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusNote, setStatusNote] = useState('');
  const [escalationResult, setEscalationResult] = useState<string | null>(null);


  const loadIssues = () => {
    // If any issue in storage has the old dummy photos, refresh from clean seed
    const stored = getStoredIssues();
    const hasCorruptedPhotos = stored.some(i => i.photo_url.includes('09198397868') || i.photo_url.includes('578328819058'));
    if (hasCorruptedPhotos) {
      saveStoredIssues(INITIAL_ISSUES);
      setIssues(INITIAL_ISSUES);
    } else {
      setIssues(stored);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadIssues();
  }, []);

  const resetToFreshData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civictrack_issues');
      localStorage.removeItem('civictrack_evidence');
    }
    saveStoredIssues(INITIAL_ISSUES);
    setIssues(INITIAL_ISSUES);
  };

  const filteredIssues = issues.filter(i => {
    if (selectedDept !== 'all') {
      if (selectedDept === 'DISCOM' && (i.department.toLowerCase().includes('vidyut') || i.department.toLowerCase().includes('discom') || i.department.toLowerCase().includes('electricity'))) {
        return true;
      }
      if (!i.department.toLowerCase().includes(selectedDept.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const handleAdvanceStatus = (issueId: string, nextStatus: IssueStatus) => {
    updateIssueStatus(
      issueId,
      nextStatus,
      statusNote || `Department maintenance unit progressed status to ${nextStatus}.`,
      'Municipal Field Engineer'
    );
    setStatusNote('');
    loadIssues();
  };

  const handleRunEscalationCheck = async () => {
    try {
      const res = await fetch('/api/v1/internal/escalation-check', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEscalationResult(`Escalation scheduler ran: ${data.escalated_count} overdue tickets escalated to public leaderboard.`);
        loadIssues();
      }
    } catch {
      setEscalationResult('Escalation check completed.');
      loadIssues();
    }
  };

  if (!mounted) return null;

    return (
    <div className="space-y-6 pb-12">
      {/* Header with Simulated Banner */}
      <div className="glass-card border border-[#D95F02]/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-xl bg-[#D95F02] text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                Department Field Staff Portal
              </h1>
              <span className="text-[10px] font-extrabold uppercase bg-amber-950/80 text-amber-300 border border-[#D95F02]/40 px-2 py-0.5 rounded-full">
                Simulated Demo
              </span>
            </div>
            <p className="text-xs text-[#6B6860] mt-0.5">
              Interactive interface for judges to simulate department work orders and upload Resolution Evidence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={resetToFreshData}
            className="px-3.5 py-2 bg-[#E8E5DF] hover:bg-[#C9C4BA] text-[#4B5563] text-xs font-semibold rounded-xl border border-[#C9C4BA] transition-colors flex items-center space-x-1.5"
            title="Reset to fresh realistic seed photos"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D95F02]" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleRunEscalationCheck}
            className="px-4 py-2 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 text-slate-950" />
            <span>Simulate Daily Escalation Cron</span>
          </button>
        </div>
      </div>

      {escalationResult && (
        <div className="p-3.5 bg-[#FEF2F2]/80 border border-[#B91C1C] rounded-xl text-xs font-semibold text-[#B91C1C] flex items-center justify-between shadow-lg">
          <span>{escalationResult}</span>
          <button onClick={() => setEscalationResult(null)} className="text-rose-400 hover:text-white">âœ•</button>
        </div>
      )}

      {/* Department Filter */}
      <div className="glass-card p-4 rounded-2xl border border-[#C9C4BA] shadow-lg flex items-center space-x-3">
        <span className="text-xs font-bold text-[#4B5563]">Filter by Department:</span>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs bg-[#F0EEE9] border border-[#C9C4BA] rounded-xl px-3.5 py-2 font-semibold outline-none focus:border-[#D95F02] text-[#2D3340]"
        >
          <option value="all">All Municipal Departments</option>
          <option value="PWD">Public Works Department (PWD)</option>
          <option value="SWM">Solid Waste Management (SWM)</option>
          <option value="DISCOM">Electricity Board (Discom / Power Dept)</option>
          <option value="PHED">Public Health Engineering (PHED)</option>
          <option value="Drainage">Municipal Drainage & Sewerage</option>
        </select>
      </div>

      {/* Ticket Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-[#C9C4BA] flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono-data text-xs font-bold text-[#2D3340] bg-[#F0EEE9] px-2.5 py-0.5 rounded-lg border border-[#C9C4BA]">
                    {issue.complaint_number}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1E2328] mt-2 leading-snug">{issue.title}</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#1A56A4] border border-cyan-800 capitalize">
                  {issue.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-[#6B6860] font-medium">
                <span className="text-[#D95F02]">ðŸ“ {issue.zone_name}</span>
                <span>â€¢</span>
                <span className="text-[#1A56A4] font-semibold">{issue.department}</span>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden border border-[#C9C4BA] bg-[#F0EEE9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.photo_url}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Department Actions */}
            <div className="pt-3 border-t border-[#C9C4BA] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {issue.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'assigned')}
                    className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-extrabold rounded-xl transition-all"
                  >
                    Assign Field Crew
                  </button>
                )}

                {(issue.status === 'pending' || issue.status === 'assigned') && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'in_progress')}
                    className="py-2 px-3 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-xl transition-all"
                  >
                    Mark In Progress
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssue(issue);
                    setIsEvidenceModalOpen(true);
                  }}
                  className="py-2 px-3 bg-[#176B3A] hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-950" />
                  <span>Upload Evidence</span>
                </button>

                {issue.status === 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'in_progress')}
                    className="py-2 px-3 bg-[#C9C4BA] hover:bg-slate-700 text-[#2D3340] text-xs font-semibold rounded-xl border border-[#C9C4BA] transition-all flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#D95F02]" />
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedIssue && (
        <EvidenceModal
          issue={selectedIssue}
          isOpen={isEvidenceModalOpen}
          onClose={() => {
            setIsEvidenceModalOpen(false);
            setSelectedIssue(null);
          }}
          onSubmitted={loadIssues}
        />
      )}
    </div>
  );
}
