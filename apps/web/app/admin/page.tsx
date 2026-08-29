'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  UploadCloud,
  Send,
  Download,
  Flame,
  Radio,
  MapPin,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  Bell,
  Sparkles
} from 'lucide-react';
import {
  fetchIssues,
  adminUpdateIssueStatus,
  adminUpdateIssueDetails,
  adminDeleteIssue,
  adminSubmitEvidence,
  adminBroadcastNotification,
  fetchDashboardMetrics
} from '@/lib/db';
import { CivicIssue, IssueStatus, DashboardMetrics, AdminZone } from '@/lib/types';
import { ADMIN_ZONES } from '@/lib/zoneMatcher';
import { getStoredIssues, updateIssueStatus as storeUpdateStatus } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import EvidenceModal from '@/components/EvidenceModal';

export default function AdminDashboardPage() {
  const { user, isAdmin, role, refreshRole } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleRefreshing, setRoleRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'issues' | 'zones' | 'broadcast' | 'analytics'>('issues');

  // Action Modals & Forms
  const [editingIssue, setEditingIssue] = useState<CivicIssue | null>(null);
  const [statusModalIssue, setStatusModalIssue] = useState<CivicIssue | null>(null);
  const [evidenceModalIssue, setEvidenceModalIssue] = useState<CivicIssue | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>('in_progress');
  const [statusNote, setStatusNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Evidence Form
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [contractorName, setContractorName] = useState('Municipal PWD Rapid Action Crew');

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('deadline_warning');

  const loadData = async () => {
    setLoading(true);
    try {
      const dbIssues = await fetchIssues();
      if (dbIssues && dbIssues.length > 0) {
        saveStoredIssues(dbIssues);
        setIssues(dbIssues);
      } else {
        // Fallback to local store if Supabase table is empty
        const local = getStoredIssues();
        setIssues(local);
      }
      const m = await fetchDashboardMetrics();
      setMetrics(m);
    } catch (err) {
      console.warn('Error loading admin data:', err);
      setIssues(getStoredIssues());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const showSuccessBanner = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Status Update Handler
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalIssue) return;

    const res = await adminUpdateIssueStatus(
      statusModalIssue.id,
      newStatus,
      statusNote || `Status changed to ${newStatus} by Administrator`
    );

    // Also update local fallback
    storeUpdateStatus(
      statusModalIssue.id,
      newStatus,
      'Municipal Administrator',
      statusNote || `Administrative override to ${newStatus}`
    );

    showSuccessBanner(`Docket ${statusModalIssue.complaint_number} updated to ${newStatus.toUpperCase()}`);
    setStatusModalIssue(null);
    setStatusNote('');
    loadData();
  };

  // SLA Deadline Adjustment Handler
  const handleAdjustSla = async (issue: CivicIssue, days: number) => {
    const newDeadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await adminUpdateIssueDetails(issue.id, { deadline_at: newDeadline });
    showSuccessBanner(`SLA for ${issue.complaint_number} reset to ${days} Days`);
    loadData();
  };

  // Delete Docket Handler
  const handleDeleteDocket = async (issueId: string, complaintNumber: string) => {
    if (!confirm(`Are you sure you want to PURGE ticket ${complaintNumber}? This action is irreversible.`)) return;

    await adminDeleteIssue(issueId);
    showSuccessBanner(`Ticket ${complaintNumber} has been deleted.`);
    loadData();
  };

  // Submit Evidence Handler
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalIssue || !afterPhoto) return;

    await adminSubmitEvidence(
      evidenceModalIssue.id,
      beforePhoto || evidenceModalIssue.photo_url,
      afterPhoto,
      evidenceDesc,
      contractorName
    );

    showSuccessBanner(`Repair evidence logged for ${evidenceModalIssue.complaint_number}. Status moved to VERIFIED.`);
    setEvidenceModalIssue(null);
    setAfterPhoto('');
    setBeforePhoto('');
    setEvidenceDesc('');
    loadData();
  };

  // Broadcast Alert Handler
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    await adminBroadcastNotification(broadcastTitle, broadcastMessage, broadcastType);
    showSuccessBanner(`Broadcast alert dispatched to municipal citizens!`);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (issues.length === 0) return;
    const headers = ['Complaint Number', 'Category', 'Title', 'Zone', 'Department', 'Status', 'Upvotes', 'Reported At', 'Deadline At', 'Latitude', 'Longitude'];
    const rows = issues.map(i => [
      i.complaint_number,
      i.category,
      `"${i.title.replace(/"/g, '""')}"`,
      i.zone_name,
      i.department,
      i.status,
      i.upvote_count,
      i.reported_at,
      i.deadline_at,
      i.latitude,
      i.longitude
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicTrack_Municipal_Dockets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredIssues = issues.filter(issue => {
    if (selectedCity !== 'all') {
      const cityMatch = issue.zone_name.toLowerCase().includes(selectedCity.toLowerCase()) ||
                         issue.department.toLowerCase().includes(selectedCity.toLowerCase());
      if (!cityMatch) return false;
    }
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'overdue') {
        const isOverdue = issue.status !== 'resolved' && new Date(issue.deadline_at).getTime() < Date.now();
        if (!isOverdue) return false;
      } else if (issue.status !== selectedStatus) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = issue.complaint_number.toLowerCase().includes(q) ||
                    issue.title.toLowerCase().includes(q) ||
                    issue.zone_name.toLowerCase().includes(q) ||
                    issue.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (!mounted) return null;

  // Strict Access Guard: Only allow users with admin / superadmin role in Supabase
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrator Access Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            This command center is protected and only accessible to verified municipal administrators with role assigned in the database.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Current User:</span>
            <span className="font-mono font-bold text-slate-800">{user?.email || 'Not Signed In'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Assigned Role:</span>
            <span className="font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              {role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              setRoleRefreshing(true);
              const newRole = await refreshRole();
              setRoleRefreshing(false);
              showSuccessBanner(`Checked Supabase: Role is ${newRole.toUpperCase()}`);
            }}
            disabled={roleRefreshing}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#1A56A4] hover:bg-[#154687] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${roleRefreshing ? 'animate-spin' : ''}`} />
            <span>{roleRefreshing ? 'Checking Supabase...' : 'Refresh Role from Supabase'}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <span>Back to Public Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">

      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1A56A4] to-[#176B3A] p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Executive Governance Console • Municipal Corporation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-white/80">
            Full root privileges: ticket status overrides, SLA modulation, contractor verification, and municipal broadcasts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Live Sync'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Supabase Role & Access Verification Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">
                User: <span className="font-mono text-[#1A56A4]">{user?.email || 'Guest / Not Signed In'}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px] ${
                  isAdmin
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                Role: {role.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin
                ? '✅ Verified Administrator access authorized by Supabase Public Users table.'
                : 'ℹ️ Role assigned as Citizen. To elevate to Admin, change role to "admin" in your Supabase `users` table.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={async () => {
              setRoleRefreshing(true);
              const newRole = await refreshRole();
              setRoleRefreshing(false);
              showSuccessBanner(`Role updated from Supabase: ${newRole.toUpperCase()}`);
            }}
            disabled={roleRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${roleRefreshing ? 'animate-spin' : ''}`} />
            <span>{roleRefreshing ? 'Checking Supabase...' : 'Refresh Role from Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="bg-emerald-500 text-white px-5 py-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{actionSuccess}</span>
        </div>
      )}

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total Dockets</span>
          <div className="text-2xl font-black text-slate-900 font-mono-data">{issues.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">● Real-time Supabase</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-amber-600">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 font-mono-data">
            {issues.filter(i => i.status === 'pending').length}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Needs assignment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-blue-600">In Progress</span>
          <div className="text-2xl font-black text-blue-600 font-mono-data">
            {issues.filter(i => i.status === 'in_progress').length}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Active contractor crews</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-rose-600">SLA Violations</span>
          <div className="text-2xl font-black text-rose-600 font-mono-data">
            {issues.filter(i => i.status !== 'resolved' && new Date(i.deadline_at).getTime() < Date.now()).length}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold">🚨 Escalated dockets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Resolved & Closed</span>
          <div className="text-2xl font-black text-emerald-700 font-mono-data">
            {issues.filter(i => i.status === 'resolved').length}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Citizen verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-purple-600">Active Wards</span>
          <div className="text-2xl font-black text-purple-600 font-mono-data">20</div>
          <span className="text-[10px] text-purple-600 font-semibold">Municipal Governance Network</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'issues' ? 'border-[#1A56A4] text-[#1A56A4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Docket Management ({issues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'zones' ? 'border-[#1A56A4] text-[#1A56A4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Municipal Wards & PostGIS (20)</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'broadcast' ? 'border-[#1A56A4] text-[#1A56A4]' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Emergency Broadcast Dispatcher</span>
        </button>
      </div>

      {/* TAB 1: DOCKET MANAGEMENT */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search docket ID, keyword, ward..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A56A4] text-xs"
                />
              </div>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Municipal Cities & Wards</option>
                <option value="ludhiana">Ludhiana (LDH)</option>
                <option value="amritsar">Amritsar (AMR)</option>
                <option value="chandigarh">Chandigarh (CHD)</option>
                <option value="patiala">Patiala (PTL)</option>
                <option value="jalandhar">Jalandhar (JLD)</option>
                <option value="mohali">Mohali (MOH)</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="verified">Verified Proof</option>
                <option value="resolved">Resolved</option>
                <option value="overdue">🚨 Overdue SLA</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="pothole">🕳️ Potholes</option>
                <option value="fallen_tree">🌳 Fallen Trees</option>
                <option value="exposed_wires">⚡ Dangling Wires</option>
                <option value="garbage">🗑️ Garbage Dumps</option>
                <option value="water_logging">🌊 Water Logging</option>
                <option value="broken_footpath">🧱 Broken Footpath</option>
                <option value="streetlight">💡 Streetlights</option>
                <option value="manhole">⚠️ Open Manholes</option>
                <option value="water_leakage">💧 Pipeline Fractures</option>
              </select>
            </div>

            <div className="text-slate-500 text-xs font-semibold">
              Showing <strong>{filteredIssues.length}</strong> of {issues.length} dockets
            </div>
          </div>

          {/* Dockets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Docket & Photo</th>
                    <th className="py-3 px-4">Category & Title</th>
                    <th className="py-3 px-4">Ward / Department</th>
                    <th className="py-3 px-4">SLA Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((issue) => {
                    const isOverdue = issue.status !== 'resolved' && new Date(issue.deadline_at).getTime() < Date.now();
                    const daysLeft = Math.ceil((new Date(issue.deadline_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                    return (
                      <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                        {/* Docket ID & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img
                                src={issue.photo_url}
                                alt={issue.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-mono-data font-extrabold text-slate-900 block">
                                {issue.complaint_number}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono-data">
                                {new Date(issue.reported_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-4 max-w-[220px]">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {issue.category.replace('_', ' ')}
                            </span>
                            <p className="font-bold text-slate-900 truncate" title={issue.title}>
                              {issue.title}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              👍 {issue.upvote_count} citizen votes
                            </span>
                          </div>
                        </td>

                        {/* Ward & Dept */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#1A56A4]" />
                              {issue.zone_name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                              {issue.department}
                            </span>
                          </div>
                        </td>

                        {/* SLA Deadline */}
                        <td className="py-3 px-4">
                          {issue.status === 'resolved' ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Resolved
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black rounded-lg text-[10px] uppercase flex items-center gap-1 w-max">
                              🚨 Overdue ({Math.abs(daysLeft)}d)
                            </span>
                          ) : (
                            <span className="text-amber-700 font-mono-data font-bold text-xs">
                              {daysLeft} days left
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              issue.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : issue.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : issue.status === 'verified'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Change Status */}
                            <button
                              onClick={() => {
                                setStatusModalIssue(issue);
                                setNewStatus(issue.status);
                              }}
                              className="px-2.5 py-1 bg-[#1A56A4] hover:bg-[#134688] text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                              title="Update Status"
                            >
                              Status
                            </button>

                            {/* Upload Contractor Evidence */}
                            <button
                              onClick={() => {
                                setEvidenceModalIssue(issue);
                                setBeforePhoto(issue.photo_url);
                              }}
                              className="px-2.5 py-1 bg-[#176B3A] hover:bg-[#12582e] text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs flex items-center space-x-1"
                              title="Upload Contractor Repair Proof"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Proof</span>
                            </button>

                            {/* Quick Reset SLA to 5 Days */}
                            <button
                              onClick={() => handleAdjustSla(issue, 5)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors"
                              title="Fast-track to 5-Day SLA"
                            >
                              5d SLA
                            </button>

                            {/* View Live Ticket */}
                            <Link
                              href={`/track/${issue.complaint_number}`}
                              className="p-1.5 text-slate-500 hover:text-[#1A56A4] rounded-lg transition-colors"
                              title="View Public Docket"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteDocket(issue.id, issue.complaint_number)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Purge / Delete Docket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MUNICIPAL WARDS DIRECTORY */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900">
              Municipal Corporation — Jurisdiction Wards & Spatial Zones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mapped with PostGIS polygon spatial boundaries for automated routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMIN_ZONES.map((zone) => (
              <div key={zone.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono-data font-bold bg-blue-50 text-[#1A56A4] border border-blue-200 px-2 py-0.5 rounded">
                      {zone.city_code}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{zone.zone_name}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{zone.city}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>🏢 <strong>Dept:</strong> {zone.department}</div>
                  <div>📡 <strong>Official Handle:</strong> <span className="font-mono text-[#1A56A4]">{zone.official_handle}</span></div>
                  <div>📍 <strong>Center GPS:</strong> <span className="font-mono text-[11px]">{zone.center[0].toFixed(4)}, {zone.center[1].toFixed(4)}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold">● PostGIS Polygon Active</span>
                  <Link
                    href={`/map`}
                    className="text-[#1A56A4] font-bold hover:underline"
                  >
                    View on GIS Map →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY BROADCAST DISPATCHER */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Municipal Citizen Dispatch Engine</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Broadcast Emergency Public Alert
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatches instant alerts across citizen docket trackers and municipal dashboard feeds.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alert Type
              </label>
              <select
                value={broadcastType}
                onChange={e => setBroadcastType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1A56A4]"
              >
                <option value="deadline_warning">🚨 Emergency Infrastructure Advisory</option>
                <option value="status_change">📢 Monsoon & Drainage Preparedness</option>
                <option value="nearby_issue">🚧 Major Traffic & Road Closure</option>
                <option value="resolution">✅ Municipal Resolution Accomplishment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alert Title / Headline
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Emergency Sewer Main Repair in Model Town, Ludhiana"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#1A56A4]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Message
              </label>
              <textarea
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="Explain the alert details, expected restoration time, and safety guidelines for citizens..."
                rows={4}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#1A56A4]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Official Alert Now</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 1: STATUS CHANGE MODAL */}
      {statusModalIssue && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-extrabold text-[#1A56A4]">
                  {statusModalIssue.complaint_number}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Override Status</h3>
              </div>
              <button
                onClick={() => setStatusModalIssue(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Target Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as IssueStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="pending">Pending Review</option>
                  <option value="assigned">Assigned to Crew</option>
                  <option value="in_progress">In Progress (Active Work)</option>
                  <option value="verified">Verified by Contractor</option>
                  <option value="resolved">Resolved & Closed</option>
                  <option value="reopened">Reopened / Citizen Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Official Audit Note</label>
                <textarea
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Reason for status change, assigned team details, or action summary..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalIssue(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1A56A4] hover:bg-[#134688] text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTRACTOR EVIDENCE MODAL */}
      {evidenceModalIssue && (
        <EvidenceModal
          issue={evidenceModalIssue}
          isOpen={!!evidenceModalIssue}
          onClose={() => setEvidenceModalIssue(null)}
          onSubmitted={() => {
            loadData();
            showSuccessBanner(`Resolution proof registered for ${evidenceModalIssue.complaint_number}`);
          }}
        />
      )}

    </div>
  );
}
