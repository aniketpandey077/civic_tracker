'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { getStoredNotifications, saveStoredNotifications } from '../lib/store';
import { NotificationItem } from '../lib/types';
import Link from 'next/link';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setNotifications(getStoredNotifications());

    const handleStorage = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'nearby_issue':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'resolution':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'deadline_warning':
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-critical" />;
      default:
        return <Clock className="w-4 h-4 text-pending" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        title="Civic Notifications"
        aria-label="Civic Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="font-semibold text-sm text-slate-800">Civic Alerts & Updates</span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No alerts right now. You are all caught up!
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50/40'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {notif.complaint_number && (
                            <Link
                              href={`/track/${notif.complaint_number}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[10px] font-mono font-medium text-blue-600 hover:underline inline-flex items-center"
                            >
                              {notif.complaint_number}
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Geofence: Auto-monitoring 200m radius around your location
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
