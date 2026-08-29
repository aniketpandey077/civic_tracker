'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ThumbsUp, Eye, Flame, MapPin, Filter, AlertTriangle, CheckCircle, Clock, Navigation, Crosshair } from 'lucide-react';
import { CivicIssue } from '../lib/types';
import { upvoteIssue } from '../lib/store';

interface MapViewProps {
  issues: CivicIssue[];
  onIssueUpvoted?: (issueId: string) => void;
  showHeatmapDefault?: boolean;
}

export default function MapView({
  issues: initialIssues,
  onIssueUpvoted,
  showHeatmapDefault = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const [issues, setIssues] = useState<CivicIssue[]>(initialIssues);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'overdue') {
        const isOverdue = issue.status !== 'resolved' && new Date(issue.deadline_at).getTime() < Date.now();
        if (!isOverdue) return false;
      } else if (issue.status !== selectedStatus) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css-link')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-link';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Check if user location cached
      const cachedLat = localStorage.getItem('civic_user_lat');
      const cachedLng = localStorage.getItem('civic_user_lng');
      const initialLat = cachedLat ? parseFloat(cachedLat) : 26.885;
      const initialLng = cachedLng ? parseFloat(cachedLng) : 75.795;
      const initialZoom = cachedLat ? 14 : 12;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Ward Polygon Overlays
      const wardPolygons = [
        {
          name: 'Ward 12 (Civil Lines)',
          dept: 'PWD',
          color: '#3b82f6',
          coords: [[26.898, 75.775], [26.898, 75.800], [26.915, 75.800], [26.915, 75.775]]
        },
        {
          name: 'Ward 15 (Malviya Nagar)',
          dept: 'SWM',
          color: '#10b981',
          coords: [[26.840, 75.810], [26.840, 75.838], [26.865, 75.838], [26.865, 75.810]]
        },
        {
          name: 'Ward 22 (Mansarovar)',
          dept: 'JVVNL',
          color: '#f59e0b',
          coords: [[26.850, 75.750], [26.850, 75.785], [26.878, 75.785], [26.878, 75.750]]
        },
        {
          name: 'Ward 30 (Sanganer)',
          dept: 'Drainage',
          color: '#8b5cf6',
          coords: [[26.800, 75.760], [26.800, 75.795], [26.835, 75.795], [26.835, 75.760]]
        }
      ];

      wardPolygons.forEach(w => {
        L.polygon(w.coords as any, {
          color: w.color,
          weight: 2,
          opacity: 0.8,
          fillColor: w.color,
          fillOpacity: 0.1,
          dashArray: '5, 5'
        }).bindPopup(`<b>${w.name}</b><br/>Department: ${w.dept}`).addTo(map);
      });

      renderMarkers(L, map);

      // Try auto-locating on map mount
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return;
            const { latitude, longitude } = pos.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            // Fly to real user location
            map.setView([latitude, longitude], 14);

            const userPinHtml = `
              <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
              </div>
            `;

            const userIcon = L.divIcon({
              className: 'user-live-pin',
              html: userPinHtml,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            if (userMarkerRef.current) userMarkerRef.current.remove();
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>ðŸ“ Your Live Location</b>')
              .openPopup();
          },
          () => {},
          { enableHighAccuracy: true, timeout: 6000 }
        );
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      renderMarkers(L, mapInstanceRef.current);
    });
  }, [filteredIssues]);

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'pothole': return 'ðŸ•³ï¸';
      case 'fallen_tree': return 'ðŸŒ³';
      case 'exposed_wires': return 'âš¡';
      case 'garbage': return 'ðŸ—‘ï¸';
      case 'water_logging': return 'ðŸ¦Ÿ';
      case 'broken_footpath': return 'ðŸ§±';
      case 'streetlight': return 'ðŸ’¡';
      case 'manhole': return 'âš ï¸';
      case 'water_leakage': return 'ðŸ’§';
      case 'dead_animal': return 'ðŸ¾';
      default: return 'ðŸš§';
    }
  };

  const renderMarkers = (L: any, map: any) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredIssues.forEach((issue) => {
      let pinColor = '#6366F1';
      if (issue.status === 'resolved') pinColor = '#059669';
      else if (issue.status === 'in_progress') pinColor = '#EAB308';
      else if (new Date(issue.deadline_at).getTime() < Date.now()) pinColor = '#E11D48';

      const emoji = getCategoryEmoji(issue.category);

      const iconHtml = `
        <div style="background-color: ${pinColor}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); cursor: pointer;">
          <div style="transform: rotate(45deg); font-size: 14px; text-align: center;">
            ${emoji}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedIssue(issue);
      });

      markersRef.current.push(marker);
    });
  };

  // Locate User GPS & drop live pulse marker on map
  const handleLocateMe = async () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    setIsLocatingUser(true);

    const L = (await import('leaflet')).default;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userPinHtml = `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
          </div>
        `;

        const userIcon = L.divIcon({
          className: 'user-live-pin',
          html: userPinHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<b>ðŸ“ You Are Here</b><br/>GPS Accuracy: Â±${Math.round(accuracy)}m`)
          .openPopup();

        userMarkerRef.current = marker;
        setIsLocatingUser(false);
      },
      (error) => {
        console.warn('Location lookup error:', error.message);
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleUpvote = (issueId: string) => {
    const result = upvoteIssue(issueId);
    if (result.success && result.issue) {
      const updated = issues.map(i => i.id === issueId ? result.issue! : i);
      setIssues(updated);
      if (selectedIssue?.id === issueId) setSelectedIssue(result.issue);
      if (onIssueUpvoted) onIssueUpvoted(issueId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Locate Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Map:
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All Categories ({issues.length})</option>
            <option value="pothole">ðŸ•³ï¸ Potholes</option>
            <option value="fallen_tree">ðŸŒ³ Fallen Trees</option>
            <option value="exposed_wires">âš¡ Dangling Wires</option>
            <option value="garbage">ðŸ—‘ï¸ Garbage Dumps</option>
            <option value="water_logging">ðŸ¦Ÿ Stagnant Water</option>
            <option value="broken_footpath">ðŸ§± Broken Footpaths</option>
            <option value="streetlight">ðŸ’¡ Streetlights</option>
            <option value="manhole">âš ï¸ Open Manholes</option>
            <option value="water_leakage">ðŸ’§ Water Leaks</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">ðŸš¨ Overdue SLA</option>
          </select>

          {/* Live GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingUser}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-[#1E2328] font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1 ml-1"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span>{isLocatingUser ? 'Locating...' : 'ðŸ“ Center on My Location'}</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-600">
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" /> <span>Overdue</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> <span>In Progress</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> <span>Pending</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> <span>Resolved</span></span>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[480px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Issue Popup Card */}
        {selectedIssue && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-2xl z-[1000] text-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {selectedIssue.complaint_number}
                </span>
                <h4 className="font-bold text-slate-900 mt-1 text-sm">{selectedIssue.title}</h4>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-[#6B6860] hover:text-slate-600 p-1 font-bold text-sm"
              >
                âœ•
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed line-clamp-2">{selectedIssue.description}</p>
            <div className="text-[11px] text-emerald-700 font-semibold">ðŸ“ {selectedIssue.zone_name} â€¢ {selectedIssue.department}</div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleUpvote(selectedIssue.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center space-x-1"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upvote ({selectedIssue.upvote_count})</span>
              </button>

              <Link
                href={`/track/${selectedIssue.complaint_number}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-[#176B3A] text-[#1E2328] text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Track Details</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
