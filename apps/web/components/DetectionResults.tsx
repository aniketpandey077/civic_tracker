'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Loader2, Sparkles, ShieldAlert, Target } from 'lucide-react';
import { AnalyzeApiResponse } from '../lib/aiDetector';

interface DetectionResultsProps {
  isLoading: boolean;
  error: string | null;
  result: AnalyzeApiResponse | null;
  onRetry?: () => void;
}

export default function DetectionResults({
  isLoading,
  error,
  result,
  onRetry,
}: DetectionResultsProps) {
  // 1. Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 text-white shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-300 flex items-center space-x-1.5">
              <span>Analyzing Image with Live AI Service...</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Running computer vision inference at <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded text-[11px]">civicpulse-ai-95na.onrender.com</code>
            </p>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 text-rose-100 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-300">Detection Request Failed</h4>
            <p className="text-xs text-rose-200 mt-1">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no result yet, render nothing
  if (!result) return null;

  // 3. If detected is false -> Clear "No issues found" message
  if (!result.detected) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 text-slate-200 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>No Issues Found</span>
              <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                Clean Image
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              The AI model scanned the photo for <span className="font-semibold text-slate-300">{result.issue_type}</span> defects, but no hazards were detected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Overall severity badge color calculations:
  // - Green under 30
  // - Yellow 30 to 60
  // - Red above 60
  const getSeverityBadgeClass = (severity: number) => {
    if (severity < 30) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
    if (severity <= 60) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    }
    return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity < 30) return 'Low Risk';
    if (severity <= 60) return 'Moderate Risk';
    return 'Severe Hazard';
  };

  return (
    <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 text-white shadow-xl space-y-4">
      {/* Header Summary */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h4 className="text-sm font-bold text-white capitalize">
                {result.issue_type.replace('_', ' ')} Detected
              </h4>
              <span className="text-[10px] font-bold font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-md">
                Count: {result.count}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live AI inference confirmed active civic defect
            </p>
          </div>
        </div>

        {/* Overall Severity Badge */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Overall Severity
          </span>
          <div
            className={`px-3 py-1 rounded-lg border font-bold text-xs flex items-center space-x-1.5 ${getSeverityBadgeClass(
              result.severity
            )}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {result.severity} / 100 ({getSeverityLabel(result.severity)})
            </span>
          </div>
        </div>
      </div>

      {/* Description if present */}
      {result.description && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-300">
          <span className="font-bold text-slate-200">Analysis Note: </span>
          {result.description}
        </div>
      )}

      {/* List of Individual Detections */}
      {result.detections && result.detections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Individual Detections ({result.detections.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.detections.map((item, idx) => {
              const confidencePct = (item.confidence * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                      Target #{idx + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 font-bold">
                        {confidencePct}%
                      </span>
                      <span className="text-[10px] text-slate-400">Confidence</span>
                    </div>
                    {item.box && item.box.length === 4 && (
                      <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[160px]">
                        Box: [{item.box.map((n) => n.toFixed(0)).join(', ')}]
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-bold font-mono ${getSeverityBadgeClass(
                      item.severity
                    )}`}
                  >
                    Sev: {item.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
