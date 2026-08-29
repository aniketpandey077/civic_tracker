'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { IssueStatus, IssueStatusHistory } from '../lib/types';

interface StatusTimelineProps {
  currentStatus: IssueStatus;
  history: IssueStatusHistory[];
  reportedAt: string;
  deadlineAt: string;
}

const STEPS: { status: IssueStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Reported & Scanned', desc: 'Validated via YOLOv8 model on device camera' },
  { status: 'verified', label: 'Ward Assigned', desc: 'Matched via PostGIS polygon to department dispatch' },
  { status: 'assigned', label: 'Work Order Dispatched', desc: 'Field crew assigned to target location' },
  { status: 'in_progress', label: 'In Progress', desc: 'On-site repair team deployed' },
  { status: 'resolved', label: 'Resolved & Verified', desc: 'Before/After evidence confirmed by citizen' },
];

export default function StatusTimeline({
  currentStatus,
  history,
  reportedAt,
  deadlineAt,
}: StatusTimelineProps) {
  const getStepIndex = (status: IssueStatus) => {
    const order: IssueStatus[] = ['pending', 'verified', 'assigned', 'in_progress', 'resolved'];
    return order.indexOf(status);
  };

  const currentIndex = getStepIndex(currentStatus);
  const deadlineDate = new Date(deadlineAt);
  const isOverdue = currentStatus !== 'resolved' && deadlineDate.getTime() < Date.now();

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#C9C4BA] shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#C9C4BA] pb-4">
        <div>
          <h3 className="font-extrabold text-base text-white">Resolution Progress Timeline</h3>
          <p className="text-xs text-[#6B6860]">Live immutable work order lifecycle</p>
        </div>
        {isOverdue && (
          <span className="text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D95F02]" /> Overdue Escalation
          </span>
        )}
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C9C4BA]">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex || currentStatus === 'resolved';
          const isCurrent = idx === currentIndex && currentStatus !== 'resolved';

          const matchingHistory = history.find((h) => h.new_status === step.status);

          return (
            <div key={step.status} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-[#176B3A] border-emerald-400 text-slate-950 font-bold'
                    : isCurrent
                    ? 'bg-[#D95F02] border-[#D95F02] text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                    : 'bg-[#E8E5DF] border-[#C9C4BA] text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <Circle className="w-2 h-2 fill-current" />
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isDone
                        ? 'text-white'
                        : isCurrent
                        ? 'text-[#D95F02]'
                        : 'text-[#9CA3AF]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {matchingHistory?.created_at && (
                    <span className="text-[10px] text-[#6B6860] font-mono-data">
                      {new Date(matchingHistory.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      â€¢ {new Date(matchingHistory.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#6B6860] leading-relaxed">{step.desc}</p>

                {matchingHistory?.department_note && (
                  <div className="mt-2 text-[11px] bg-[#F0EEE9]/80 border border-[#C9C4BA] rounded-xl p-2.5 text-[#4B5563] space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#6B6860] block tracking-wider">
                      Note by {matchingHistory.changed_by || 'Department'}
                    </span>
                    <p>{matchingHistory.department_note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
