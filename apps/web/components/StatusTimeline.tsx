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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Resolution Progress Timeline</h3>
          <p className="text-xs text-slate-500">Live immutable work order lifecycle</p>
        </div>
        {isOverdue && (
          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue Escalation
          </span>
        )}
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex || currentStatus === 'resolved';
          const isCurrent = idx === currentIndex && currentStatus !== 'resolved';
          const isPending = idx > currentIndex && currentStatus !== 'resolved';

          const matchingHistory = history.find((h) => h.new_status === step.status);

          return (
            <div key={step.status} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white border-amber-500 text-amber-500 ring-4 ring-amber-100 animate-pulse'
                    : 'bg-white border-slate-300 text-slate-300'
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
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {matchingHistory?.created_at && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(matchingHistory.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {new Date(matchingHistory.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>

                {matchingHistory?.department_note && (
                  <div className="mt-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
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
