'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Navigation, LocateFixed } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { DetectionResult, AnalyzeApiResponse } from '../lib/aiDetector';
import { matchZoneByCoordinates, reverseGeocodeReal, RealGeoAddress } from '../lib/zoneMatcher';
import { generateComplaintNumber } from '../lib/complaintNumber';
import { addIssue } from '../lib/store';
import { IssueCategory, CivicIssue } from '../lib/types';

const CATEGORIES: { id: IssueCategory; label: string; icon: string; defaultDesc: string }[] = [
  { id: 'pothole', label: 'Pothole & Cavity', icon: '🕳️', defaultDesc: 'Hazardous asphalt pothole causing traffic slowdown and safety risk.' },
  { id: 'fallen_tree', label: 'Fallen Tree / Branch', icon: '🌳', defaultDesc: 'Uprooted tree or heavy branches blocking vehicle traffic and road lane.' },
  { id: 'exposed_wires', label: 'Dangling Electric Wire', icon: '⚡', defaultDesc: 'Low-hanging or snapped 440V live power wire creating severe shock & fire risk.' },
  { id: 'garbage', label: 'Garbage Dump Overflow', icon: '🗑️', defaultDesc: 'Overflowing municipal garbage bin blocking pedestrian pathway.' },
  { id: 'water_logging', label: 'Stagnant Water / Flood', icon: '🦟', defaultDesc: 'Dark stagnant rainwater pool due to blocked drainage, breeding mosquitoes.' },
  { id: 'broken_footpath', label: 'Broken Paver Footpath', icon: '🧱', defaultDesc: 'Cracked and displaced walking slabs hazardous for pedestrians and senior citizens.' },
  { id: 'streetlight', label: 'Broken Streetlight', icon: '💡', defaultDesc: 'Non-functioning streetlight pole causing complete nighttime blackout.' },
  { id: 'manhole', label: 'Open / Broken Drain', icon: '⚠️', defaultDesc: 'Missing or broken sewer cover creating urgent fall hazard.' },
  { id: 'water_leakage', label: 'Drinking Water Burst', icon: '💧', defaultDesc: 'Underground drinking water pipeline fracture gushing onto the road.' },
  { id: 'dead_animal', label: 'Dead Animal Removal', icon: '🐾', defaultDesc: 'Urgent municipal sanitation request for stray animal carcass removal.' },
  { id: 'road_damage', label: 'Road Caving / Sinking', icon: '🚧', defaultDesc: 'Significant road caving and structural bitumen deformation.' },
];

export default function ReportForm() {
  const router = useRouter();

  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<DetectionResult | null>(null);
  const [liveApiData, setLiveApiData] = useState<AnalyzeApiResponse | null>(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  // GPS Coordinates state
  const [latitude, setLatitude] = useState<number>(26.9068);
  const [longitude, setLongitude] = useState<number>(75.7873);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<RealGeoAddress | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied' | 'fallback'>('prompt');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically request real GPS location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Update reverse geocoding & matched ward whenever coordinates change
  useEffect(() => {
    let isCurrent = true;

    async function lookupGeo() {
      const geo = await reverseGeocodeReal(latitude, longitude);
      if (isCurrent) {
        setResolvedAddress(geo);

        // Autofill title with real location if user hasn't typed a custom one
        if (!title || title.includes('on Main') || title.includes('in Ward')) {
          const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'Civic Defect';
          const areaLabel = geo.road ? `${geo.road}, ${geo.city || ''}` : geo.suburb ? `${geo.suburb}, ${geo.city || ''}` : geo.ward_name;
          setTitle(`${catLabel} near ${areaLabel}`);
        }
      }
    }

    lookupGeo();

    return () => {
      isCurrent = false;
    };
  }, [latitude, longitude, category]);

  const fetchCurrentLocation = () => {
    if (typeof window === 'undefined') return;
    setIsLocating(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = Number(position.coords.latitude.toFixed(6));
          const userLng = Number(position.coords.longitude.toFixed(6));
          const userAccuracy = Math.round(position.coords.accuracy);

          setLatitude(userLat);
          setLongitude(userLng);
          setAccuracy(userAccuracy);
          setGpsStatus('granted');
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation access note:', error.message);
          setGpsStatus('fallback');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setGpsStatus('fallback');
      setIsLocating(false);
    }
  };

  const handlePhotoCaptured = (
    url: string,
    result: DetectionResult,
    apiResponse?: AnalyzeApiResponse
  ) => {
    setPhotoUrl(url);
    setAiResult(result);
    if (apiResponse) {
      setLiveApiData(apiResponse);
    }

    if (result.category && result.category !== category) {
      setCategory(result.category);
    }

    if (!description) {
      const found = CATEGORIES.find(c => c.id === (result.category || category));
      if (found) setDescription(found.defaultDesc);
    }

    const areaName = resolvedAddress?.road || resolvedAddress?.suburb || resolvedAddress?.city || 'Local Area';
    const issueLabel = apiResponse?.issue_type ? apiResponse.issue_type.toUpperCase() : result.detected_class;
    setTitle(`${issueLabel} near ${areaName}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg('Please capture or select a photo of the defect before submitting.');
      return;
    }

    if (liveApiData && !liveApiData.detected) {
      setErrorMsg('AI model detected no civic issues in this photo. Please select or capture a photo showing a civic defect.');
      return;
    }

    if (!aiResult || !aiResult.is_civic_issue) {
      setErrorMsg('AI validation could not detect a civic issue. Please select a clearer photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const geo = resolvedAddress || await reverseGeocodeReal(latitude, longitude);
      const zoneFallback = matchZoneByCoordinates(latitude, longitude);

      const zoneName = geo.ward_name || zoneFallback.zone_name;
      const deptName = geo.department || zoneFallback.department;
      const cityCode = geo.city_code || zoneFallback.city_code;

      const complaintNumber = generateComplaintNumber(cityCode, 2026);
      const now = new Date();
      const deadline = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15-day SLA

      const newIssue: CivicIssue = {
        id: `issue-${Date.now()}`,
        complaint_number: complaintNumber,
        reporter_name: 'Citizen Reporter',
        zone_id: `zone-${Date.now()}`,
        zone_name: zoneName,
        department: deptName,
        category,
        title: title || `${category.toUpperCase()} at ${zoneName}`,
        description: description || `Civic issue reported via live camera at ${zoneName}.`,
        photo_url: photoUrl,
        ai_confidence: aiResult.confidence,
        ai_detected_class: aiResult.detected_class,
        latitude,
        longitude,
        status: 'pending',
        upvote_count: 1,
        reported_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
        escalated: false,
        has_upvoted: true,
      };

      addIssue(newIssue);
      router.push(`/track/${complaintNumber}?justCreated=true`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const wardDisplay = resolvedAddress?.ward_name || 'Resolving local ward...';
  const deptDisplay = resolvedAddress?.department || 'Municipal Public Works (Roads / Sanitation)';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Category Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          1. Select Defect Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (!description || description === CATEGORIES.find(c => c.id === category)?.defaultDesc) {
                    setDescription(cat.defaultDesc);
                  }
                }}
                className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all text-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Camera & AI Detector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Live Camera Capture & YOLOv8 Verification
          </label>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            AI Model Active
          </span>
        </div>
        <CameraCapture
          onPhotoCaptured={handlePhotoCaptured}
          selectedCategory={category}
        />
      </div>

      {/* 3. Real-Time GPS & Real-World Address Resolver */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <LocateFixed className="w-4 h-4 text-emerald-600" />
            <span>3. Current Physical Location & Ward Routing</span>
          </span>
          <button
            type="button"
            onClick={fetchCurrentLocation}
            disabled={isLocating}
            className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center space-x-1.5 px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Refresh GPS Location'}</span>
          </button>
        </div>

        {gpsStatus === 'granted' && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Live GPS Location Confirmed</span>
            </span>
            {accuracy && <span className="font-mono text-[10px] bg-emerald-200/70 px-2 py-0.5 rounded text-emerald-950 font-bold">±{accuracy}m Accuracy</span>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Ward / Jurisdiction</span>
            <p className="font-bold text-slate-900 mt-0.5 text-sm">{wardDisplay}</p>
            <p className="text-[11px] text-emerald-700 font-semibold">{deptDisplay}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Exact GPS Coordinates</span>
            <p className="font-mono text-slate-900 font-bold mt-0.5 text-xs">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              {resolvedAddress?.display_name ? resolvedAddress.display_name.slice(0, 45) + '...' : 'Reverse geocoding matched'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Issue Title & Landmark */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Summary / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hazardous asphalt pothole near GT Road"
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description & Specific Landmark
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add landmark or specific hazard details for the repair crew..."
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-900"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !photoUrl}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <span>Submitting Work Order...</span>
        ) : (
          <>
            <span>Submit Complaint & Generate Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
