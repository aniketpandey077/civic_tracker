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

  return (
    <div className="space-y-6">
      {/* Header with Simulated Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900">
                Department Field Staff Portal
              </h1>
              <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                Simulated Demo
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Interactive interface for judges to simulate department work orders and upload Resolution Evidence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={resetToFreshData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center space-x-1"
            title="Reset to fresh realistic seed photos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleRunEscalationCheck}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Daily Escalation Cron</span>
          </button>
        </div>
      </div>

      {escalationResult && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center justify-between">
          <span>{escalationResult}</span>
          <button onClick={() => setEscalationResult(null)} className="text-red-600 hover:underline">✕</button>
        </div>
      )}

      {/* Department Filter - Clean generic municipal departments */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
        <span className="text-xs font-bold text-slate-700">Filter by Department:</span>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {issue.complaint_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{issue.title}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                  {issue.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>📍 {issue.zone_name}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{issue.department}</span>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.photo_url}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Department Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {issue.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'assigned')}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Assign Field Crew
                  </button>
                )}

                {(issue.status === 'pending' || issue.status === 'assigned') && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'in_progress')}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
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
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Evidence</span>
                </button>

                {issue.status === 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(issue.id, 'in_progress')}
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
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
