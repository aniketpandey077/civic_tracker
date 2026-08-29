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
      <div className="bg-[#E8E5DF]/95 border border-emerald-500/40 rounded-2xl p-5 text-[#1E2328] shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 text-[#176B3A] animate-spin shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-[#176B3A] flex items-center space-x-1.5">
              <span>Analyzing Image with Live AI Service...</span>
              <Sparkles className="w-4 h-4 text-[#176B3A] animate-pulse" />
            </h4>
            <p className="text-xs text-[#4B5563] mt-0.5">
              Running computer vision inference at <code className="text-[#176B3A] bg-[#C9C4BA] px-1 py-0.5 rounded text-[11px]">civicpulse-ai-95na.onrender.com</code>
            </p>
          </div>
        </div>
        <div className="mt-3 w-full bg-[#C9C4BA] h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#176B3A] h-full animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <div className="bg-[#FEF2F2]/40 border border-rose-500/50 rounded-2xl p-5 text-rose-100 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#B91C1C]">Detection Request Failed</h4>
            <p className="text-xs text-rose-200 mt-1">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-[#1E2328] text-xs font-semibold rounded-lg transition-colors shadow-sm"
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
      <div className="bg-white border border-[#C9C4BA] rounded-2xl p-5 text-[#2D3340] shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#C9C4BA] border border-[#C9C4BA] flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-[#6B6860]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E2328] flex items-center space-x-2">
              <span>No Issues Found</span>
              <span className="text-[10px] uppercase font-bold bg-[#C9C4BA] text-[#6B6860] border border-[#C9C4BA] px-2 py-0.5 rounded-full">
                Clean Image
              </span>
            </h4>
            <p className="text-xs text-[#6B6860] mt-0.5">
              The AI model scanned the photo for <span className="font-semibold text-[#4B5563]">{result.issue_type}</span> defects, but no hazards were detected.
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
      return 'bg-[#176B3A]/20 text-[#176B3A] border-emerald-500/50';
    }
    if (severity <= 60) {
      return 'bg-[#D95F02]/20 text-amber-300 border-[#D95F02]/50';
    }
    return 'bg-rose-500/20 text-[#B91C1C] border-rose-500/50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity < 30) return 'Low Risk';
    if (severity <= 60) return 'Moderate Risk';
    return 'Severe Hazard';
  };

  return (
    <div className="bg-[#E8E5DF]/95 border border-emerald-500/40 rounded-2xl p-5 text-[#1E2328] shadow-xl space-y-4">
      {/* Header Summary */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#C9C4BA] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#176B3A]/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-[#176B3A]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#1E2328] capitalize">
                {result.issue_type.replace('_', ' ')} Detected
              </h4>
              <span className="text-[10px] font-bold font-mono bg-[#176B3A]/20 border border-emerald-500/40 text-[#176B3A] px-2 py-0.5 rounded-md">
                Count: {result.count}
              </span>
            </div>
            <p className="text-xs text-[#6B6860] mt-0.5">
              Live AI inference confirmed active civic defect
            </p>
          </div>
        </div>

        {/* Overall Severity Badge */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-[#6B6860] tracking-wider mb-1">
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
        <div className="bg-[#C9C4BA] border border-[#C9C4BA]/80 rounded-xl p-3 text-xs text-[#4B5563]">
          <span className="font-bold text-[#2D3340]">Analysis Note: </span>
          {result.description}
        </div>
      )}

      {/* List of Individual Detections */}
      {result.detections && result.detections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-[#176B3A]" />
              <span>Individual Detections ({result.detections.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.detections.map((item, idx) => {
              const confidencePct = (item.confidence * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="bg-[#C9C4BA]/90 border border-[#C9C4BA]/80 rounded-xl p-3 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-[#6B6860] block font-semibold">
                      Target #{idx + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[#176B3A] font-bold">
                        {confidencePct}%
                      </span>
                      <span className="text-[10px] text-[#6B6860]">Confidence</span>
                    </div>
                    {item.box && item.box.length === 4 && (
                      <span className="text-[10px] font-mono text-[#9CA3AF] block truncate max-w-[160px]">
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
