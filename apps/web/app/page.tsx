'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileCheck,
  Clock,
  Shield,
  ThumbsUp,
  Search,
  ExternalLink,
  Flame,
  LocateFixed,
  Plus,
  Navigation,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { getStoredIssues, getDashboardMetrics, upvoteIssue } from '@/lib/store';
import { CivicIssue, DashboardMetrics } from '@/lib/types';
import MapView from '@/components/MapView';
import { useUserLocation } from '@/lib/useUserLocation';
import { sortIssuesByNearest, SortedCivicIssue } from '@/lib/geoDistance';
import EvidenceModal from '@/components/EvidenceModal';

export default function HomePage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [searchComplaint, setSearchComplaint] = useState('');
  const [selectedIssueForEvidence, setSelectedIssueForEvidence] = useState<CivicIssue | null>(null);

  const userLocation = useUserLocation();

  const loadData = () => {
    setIssues(getStoredIssues());
    setMetrics(getDashboardMetrics());
  };

  useEffect(() => {
    loadData();

    const handleStoreUpdate = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('civictrack_store_updated', handleStoreUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('civictrack_store_updated', handleStoreUpdate);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchComplaint.trim()) {
      window.location.href = `/track/${searchComplaint.trim()}`;
    }
  };

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    upvoteIssue(id);
    loadData();
  };

  // Nearest to farthest sorted issues relative to user's live GPS location
  const sortedIssues: SortedCivicIssue[] = sortIssuesByNearest(
    userLocation.latitude,
    userLocation.longitude,
    issues
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/40 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>
              {userLocation.isLoaded ? `${userLocation.city} • Local Municipal Grievance Redressal` : 'AI-Powered Municipal Accountability Platform'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Report civic defects in {userLocation.isLoaded && userLocation.city !== 'Detecting location...' ? userLocation.city : 'your city'}. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Hold municipal zones accountable.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Live camera detection via YOLOv8, spatial routing by {userLocation.isLoaded && userLocation.city !== 'Detecting location...' ? userLocation.city : 'municipal'} ward boundaries, 15-day transparent SLAs, and verified before/after evidence confirmed by citizens.
          </p>

          {/* EXTRA-LARGE, HIGH-IMPACT COMMANDING REPORT CTA BUTTON */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/report"
              className="px-8 sm:px-10 py-5 sm:py-5.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-3xl shadow-2xl shadow-emerald-900/70 hover:shadow-emerald-500/50 hover:scale-[1.04] active:scale-[0.98] transition-all flex items-center space-x-4 ring-4 ring-emerald-400/30 group border border-emerald-300/40"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-lg sm:text-2xl leading-none font-black tracking-tight drop-shadow-xs">
                  Report Civic Issue
                </span>
                <span className="block text-xs sm:text-sm font-semibold text-emerald-100/90 leading-tight mt-1">
                  Live Camera Capture & YOLOv8 AI Scanner
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform shrink-0">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </Link>

            <Link
              href="/map"
              className="px-6 py-5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base rounded-3xl transition-all flex items-center space-x-2.5 shadow-md hover:text-white"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Explore Live Map</span>
            </Link>
          </div>

          {/* Quick Ticket Lookup */}
          <form onSubmit={handleSearchSubmit} className="pt-3 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchComplaint}
                onChange={(e) => setSearchComplaint(e.target.value)}
                placeholder="Track existing ticket e.g. CTR-2026-..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* KPI Metrics Strip */}
      {metrics && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Logged</span>
              <FileCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.total_issues}</div>
            <p className="text-[11px] text-slate-400">Validated by YOLOv8 model</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
              <span>Resolved & Verified</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{metrics.resolved_issues}</div>
            <p className="text-[11px] text-slate-400">With Before/After photo proof</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
              <span>In Progress</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-500">{metrics.active_issues}</div>
            <p className="text-[11px] text-slate-400">Within 15-day resolution target</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
              <span>Overdue SLA</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600">{metrics.overdue_issues}</div>
            <p className="text-[11px] text-slate-400">On Public Accountability board</p>
          </div>
        </section>
      )}

      {/* Shared Interactive Map */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              City-Wide Civic Heatmap & Issue Map
            </h2>
            <p className="text-xs text-slate-500">
              Live geospatial tickets mapped to {userLocation.isLoaded ? `${userLocation.city}` : 'local'} municipal ward boundaries
            </p>
          </div>
          <Link
            href="/map"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View Full Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <MapView issues={issues} />
        </div>
      </section>

      {/* Public Nearest-to-Farthest Live Feed & Fix Defect Actions */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                📍 Nearest First
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Civic Reports Ordered by Distance ({sortedIssues.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live complaints sorted from <strong>nearest to farthest</strong> relative to your GPS coordinates ({userLocation.city}).
            </p>
          </div>

          <Link
            href="/my-complaints"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All ({issues.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.slice(0, 6).map((issue) => {
            const isResolved = issue.status === 'resolved';
            const deadlineDate = new Date(issue.deadline_at);
            const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = !isResolved && diffDays <= 0;

            return (
              <div
                key={issue.id}
                className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Badge Row */}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {issue.complaint_number}
                    </span>

                    <div className="flex items-center space-x-1">
                      {/* Distance Badge */}
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{issue.distanceFormatted}</span>
                      </span>

                      {/* 45-Day Escalated Badge */}
                      {issue.escalation_email_sent_at && (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>45d Escalated</span>
                        </span>
                      )}

                      {isResolved ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      ) : isOverdue ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                          {issue.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail + Details */}
                  <div className="flex space-x-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link href={`/track/${issue.complaint_number}`}>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-emerald-700 transition-colors">
                          {issue.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{issue.description}</p>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{issue.zone_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons: Fix Defect & Upvote & Track */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedIssueForEvidence(issue)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>🛠️ Fix Defect</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(issue.id, e)}
                      className="flex items-center space-x-1 text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="font-bold text-[11px]">{issue.upvote_count}</span>
                    </button>

                    <Link
                      href={`/track/${issue.complaint_number}`}
                      className="text-emerald-600 font-bold text-xs flex items-center hover:underline"
                    >
                      Track <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal for Fix Defect / Upload Repair Photo */}
      {selectedIssueForEvidence && (
        <EvidenceModal
          issue={selectedIssueForEvidence}
          isOpen={!!selectedIssueForEvidence}
          onClose={() => setSelectedIssueForEvidence(null)}
          onSubmitted={loadData}
        />
      )}

      {/* 4 Core Features / Accountability Principles */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Accountability Architecture</span>
          <h3 className="text-2xl font-bold text-slate-900">How CivicTrack Closes the Loop</h3>
          <p className="text-xs text-slate-500">
            A transparent four-step process guaranteeing that reported defects cannot be quietly archived or ignored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">1</div>
            <h4 className="font-bold text-slate-900 text-sm">Computer Vision Validation</h4>
            <p className="text-slate-600 leading-relaxed">
              Camera snaps live evidence. YOLOv8 model calculates confidence and labels defects (potholes, garbage, streetlights) on-site.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">2</div>
            <h4 className="font-bold text-slate-900 text-sm">PostGIS Spatial Boundary</h4>
            <p className="text-slate-600 leading-relaxed">
              Point-in-polygon math assigns tickets to the exact municipal ward and department (PWD, SWM, JVVNL, PHED).
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">3</div>
            <h4 className="font-bold text-slate-900 text-sm">500-Upvote Urgency Rule</h4>
            <p className="text-slate-600 leading-relaxed">
              15-day target SLA. If 500 community members upvote an urgent hazard, the resolution window compresses to 5 days.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">4</div>
            <h4 className="font-bold text-slate-900 text-sm">Citizen Confirmation</h4>
            <p className="text-slate-600 leading-relaxed">
              Staff upload Before/After evidence. Citizens vote Yes/No to verify the repair is physically completed before closing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
