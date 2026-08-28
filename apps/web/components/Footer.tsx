'use client';

import React from 'react';
import { Shield, ExternalLink, Info, HeartHandshake, ArrowRight, Camera, Search, CheckCircle2, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useUserLocation } from '@/lib/useUserLocation';

export default function Footer() {
  const userLocation = useUserLocation();
  const cityDisplay = userLocation.isLoaded && userLocation.city !== 'Detecting location...' ? userLocation.city : 'Local';

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col with Interactive 4-Step Action Flow */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-base group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight">CivicTrack</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              Turning citizen civic complaints into traceable digital tickets with computer vision validation, geofenced neighborhood alerts, and transparent resolution evidence.
            </p>

            {/* Interactive Working Action Buttons for "Report. Track. Verify. Resolve." */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                Quick Platform Actions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href="/report"
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-400 font-bold text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                >
                  <Camera className="w-3 h-3" />
                  <span>Report</span>
                </Link>

                <Link
                  href="/my-complaints"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                >
                  <Search className="w-3 h-3" />
                  <span>Track</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verify</span>
                </Link>

                <Link
                  href="/department"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Resolve</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-sm">Navigation</h4>
            <ul className="space-y-2.5">
              <li><Link href="/report" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-emerald-500" /><span>Report Issue (Camera + AI)</span></Link></li>
              <li><Link href="/map" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-emerald-500" /><span>Shared Civic Map & Heatmap</span></Link></li>
              <li><Link href="/my-complaints" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-emerald-500" /><span>Track Complaint Status</span></Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-emerald-500" /><span>Public Accountability Board</span></Link></li>
              <li><Link href="/department" className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"><ArrowRight className="w-3 h-3 text-emerald-500" /><span>Department Resolution Portal</span></Link></li>
            </ul>
          </div>

          {/* Transparency & Rules */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <Info className="w-4 h-4" />
              <span>CivicTrack Non-Negotiable Guardrails</span>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-4 space-y-2 text-[11px] text-slate-300 border border-slate-700/60 leading-relaxed">
              <p>
                <strong className="text-white">Zone-Level Accountability:</strong> CivicTrack measures performance at the municipal zone and department level. We never display personal information or individual employee names.
              </p>
              <p>
                <strong className="text-white">Resolution Evidence:</strong> Before/After submissions represent field resolution evidence subject to citizen confirmation, not an official government certificate.
              </p>
              <p>
                <strong className="text-white">15-Day / 500-Upvote SLA:</strong> The 15-day target and 500-upvote timeline compression are CivicTrack&apos;s independent public accountability mechanisms, not official statutory SLAs.
              </p>
              <p>
                <strong className="text-white">Verified Budget Sources:</strong> All municipal budget figures are linked directly to official municipal audit PDFs with full source citations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CivicTrack Platform • Built for transparent, accountable civic infrastructure.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{cityDisplay} Municipal Grievance Ward Network</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
