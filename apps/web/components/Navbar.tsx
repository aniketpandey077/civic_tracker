'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  PlusCircle,
  Map,
  FileText,
  BarChart3,
  Building2,
  Menu,
  X,
  MapPin,
  Camera,
  Sparkles
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useUserLocation } from '@/lib/useUserLocation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userLocation = useUserLocation();

  const navLinks = [
    { href: '/map', label: 'Civic Map', icon: Map },
    { href: '/my-complaints', label: 'My Complaints', icon: FileText },
    { href: '/dashboard', label: 'Public Leaderboard', icon: BarChart3 },
    { href: '/department', label: 'Dept Demo', icon: Building2, tag: 'Simulated' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Dynamic Real City Tag */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight">CivicTrack</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{userLocation.isLoaded ? userLocation.city : 'Locating...'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {userLocation.wardName ? `${userLocation.wardName} Portal` : 'Report. Track. Verify. Resolve.'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                  {link.tag && (
                    <span className="text-[9px] bg-amber-900/60 text-amber-300 border border-amber-700/50 px-1.5 py-0.2 rounded font-mono">
                      {link.tag}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* BIG PROMINENT HERO REPORT BUTTON IN NAVBAR */}
            <Link
              href="/report"
              className="ml-3 flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all ring-2 ring-emerald-400/30"
            >
              <Camera className="w-4 h-4" />
              <span>+ Report Issue</span>
            </Link>
          </nav>

          {/* Right Action Icons (Notifications & Mobile Menu) */}
          <div className="flex items-center space-x-3">
            <Link
              href="/report"
              className="md:hidden flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>

            <NotificationBell />

            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-sm shadow-md"
          >
            <Camera className="w-5 h-5" />
            <span>+ Report Civic Issue (Live Camera)</span>
          </Link>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </div>
                {link.tag && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
                    {link.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
