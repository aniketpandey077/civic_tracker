'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Map,
  FileText,
  BarChart3,
  Building2,
  Menu,
  X,
  Camera,
  Radio,
  AlertTriangle
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useUserLocation } from '@/lib/useUserLocation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userLocation = useUserLocation();

  const navLinks = [
    { href: '/map', label: 'GIS Map', icon: Map },
    { href: '/my-complaints', label: 'Docket Registry', icon: FileText },
    { href: '/dashboard', label: 'SLA Board', icon: BarChart3 },
    { href: '/department', label: 'Dept Dispatch', icon: Building2, tag: 'Demo' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-[#C9C4BA] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#D95F02] flex items-center justify-center text-white shadow-sm group-hover:bg-[#C04F00] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#1E2328]">CivicTrack</span>
                <span className="text-[10px] font-mono-data font-bold bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span suppressHydrationWarning>
                    {userLocation.isLoaded ? userLocation.city.toUpperCase() : 'CONNECTING'}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-[#6B6860] font-medium hidden sm:block" suppressHydrationWarning>
                {userLocation.wardName
                  ? `${userLocation.wardName} Jurisdiction`
                  : 'Municipal Grievance & SLA Command'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/30'
                      : 'text-[#6B6860] hover:text-[#1E2328] hover:bg-[#E8E5DF]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.tag && (
                    <span className="text-[9px] font-mono-data bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/30 px-1.5 py-0.5 rounded">
                      {link.tag}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* RED ALERT CTA — pure Link, no wrapper div, CSS-only pulse via animate-pulse */}
            <Link
              href="/report"
              className="ml-4 flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-extrabold text-sm tracking-wide shadow-lg animate-pulse hover:animate-none transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>REPORT ISSUE</span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Mobile compact button — plain Link, no wrapper */}
            <Link
              href="/report"
              className="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-extrabold rounded-xl shadow-md animate-pulse hover:animate-none transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>

            <NotificationBell />

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#6B6860] hover:text-[#1E2328] hover:bg-[#E8E5DF] rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#C9C4BA] px-4 pt-3 pb-4 space-y-2">
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-3 w-full py-3.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-extrabold text-sm tracking-wide shadow-md transition-all"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>REPORT CIVIC ISSUE</span>
          </Link>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-[#EEF4FF] text-[#1A56A4] font-bold'
                    : 'text-[#6B6860] hover:bg-[#E8E5DF] hover:text-[#1E2328]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.tag && (
                  <span className="text-[9px] font-mono-data bg-[#EEF4FF] text-[#1A56A4] border border-[#1A56A4]/30 px-1.5 py-0.5 rounded">
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
