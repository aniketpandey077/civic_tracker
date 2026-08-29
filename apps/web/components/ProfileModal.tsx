'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Shield,
  ShieldAlert,
  Mail,
  FileText,
  ThumbsUp,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { getStoredIssues } from '../lib/store';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, isAdmin, role, signOut } = useAuth();

  if (!isOpen || !user) return null;

  const issues = getStoredIssues();
  const myReports = issues.filter(
    (i) => i.reporter_name?.toLowerCase().includes(user.displayName?.toLowerCase() || '') ||
           i.has_upvoted
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 font-sans">
        
        {/* Header Ribbon */}
        <div className="h-2.5 bg-gradient-to-r from-[#1A56A4] via-emerald-600 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">

          {/* USER AVATAR & IDENTITY */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-2xl border-2 border-[#1A56A4] object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1A56A4] to-[#176B3A] text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {user.displayName?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white">
                <CheckCircle className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {user.displayName || 'Verified Citizen'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Mail className="w-3 h-3 text-slate-400" />
                {user.email}
              </p>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>ROLE: {role.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* USER ACTIVITY METRICS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Dockets Reported / Tracked</span>
              <span className="text-2xl font-black text-slate-900 font-mono-data">{myReports.length}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Verified Status</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1.5">
                <CheckCircle className="w-4 h-4" /> Active Voter
              </span>
            </div>
          </div>

          {/* QUICK ACCESS LINKS */}
          <div className="space-y-2 text-xs font-bold">
            <Link
              href="/my-complaints"
              onClick={onClose}
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-[#1A56A4]" />
                <span>My Registered Grievances</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-200 text-purple-900 transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Open Executive Admin Console</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-700" />
              </Link>
            )}
          </div>

          {/* SIGN OUT BUTTON */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of CivicTrack</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
