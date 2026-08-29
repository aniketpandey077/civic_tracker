'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Navigation, LocateFixed, Mic, MicOff } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { DetectionResult, AnalyzeApiResponse, analyzeImageWithLiveApi } from '../lib/aiDetector';
import { matchZoneByCoordinates, reverseGeocodeReal, RealGeoAddress } from '../lib/zoneMatcher';
import { generateComplaintNumber } from '../lib/complaintNumber';
import { addIssue, getStoredIssues, attachEvidenceAndUpvote, updateIssueAiResults } from '../lib/store';
import { IssueCategory, CivicIssue } from '../lib/types';
import { findNearbyExistingIssue, NearbyIssueMatch } from '../lib/geoDistance';

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

  // 50m Spatial Deduplication State
  const [nearbyDuplicate, setNearbyDuplicate] = useState<NearbyIssueMatch | null>(null);

  // Voice Dictation state
  const [isListening, setIsListening] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically request real GPS location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Update reverse geocoding & matched ward whenever coordinates change, + 50m deduplication check
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

    // Check 50m deduplication against existing issues
    const issues = getStoredIssues();
    const match = findNearbyExistingIssue(latitude, longitude, issues, 50);
    setNearbyDuplicate(match);

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

  const startVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported on this browser. Try Chrome or Edge!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
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

  const handleMergeDuplicate = (targetIssueId: string) => {
    if (!photoUrl) {
      setErrorMsg('Please capture or select a photo before upvoting.');
      return;
    }
    const updated = attachEvidenceAndUpvote(targetIssueId, photoUrl, 'Citizen Reporter');
    if (updated) {
      router.push(`/track/${updated.complaint_number || updated.id}?justUpvoted=true`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg('Please capture or select a photo of the defect before submitting.');
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
        additional_photos: [photoUrl],
        ai_confidence: liveApiData?.detections?.[0]?.confidence ?? aiResult?.confidence ?? 0.95,
        ai_detected_class: liveApiData?.issue_type ? liveApiData.issue_type.toUpperCase() : (aiResult?.detected_class || 'Pothole'),
        ai_analysis_status: liveApiData ? 'completed' : 'analyzing',
        ai_severity: liveApiData?.severity,
        ai_count: liveApiData?.count,
        ai_detections: liveApiData?.detections,
        ai_description: liveApiData?.description,
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

      // Launch background AI analysis if not finished yet
      if (!liveApiData && photoUrl) {
        analyzeImageWithLiveApi(photoUrl, category)
          .then((apiData) => {
            updateIssueAiResults(newIssue.id, apiData);
          })
          .catch((err) => {
            console.warn('Background AI analysis error note:', err);
          });
      }

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
      {/* 50m Spatial Deduplication Warning Banner */}
      {nearbyDuplicate && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs text-amber-950 shadow-sm animate-pulse-subtle">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Duplicate Report Detected within 50 Meters ({nearbyDuplicate.distanceMeters}m away)
              </h4>
              <p className="text-amber-800 mt-1 leading-relaxed">
                Ticket <span className="font-mono font-bold text-amber-950">{nearbyDuplicate.issue.complaint_number}</span> (
                <em>"{nearbyDuplicate.issue.title}"</em>) was already registered at this location. To prevent ticket spamming, you can attach your photo as supporting evidence & upvote the existing ticket!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleMergeDuplicate(nearbyDuplicate.issue.id)}
              disabled={!photoUrl}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white font-bold rounded-xl shadow transition-all flex items-center space-x-1.5"
            >
              <span>🗳️ Upvote & Attach My Photo to #{nearbyDuplicate.issue.complaint_number}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/track/${nearbyDuplicate.issue.complaint_number}`)}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-xl transition-all"
            >
              View Existing Ticket
            </button>
          </div>
        </div>
      )}

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
            Auto-Compression & Background AI Active
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

      {/* 4. Issue Title & Landmark (with Voice Dictation) */}
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Description & Specific Landmark
            </label>
            <button
              type="button"
              onClick={startVoiceDictation}
              className={`text-[11px] font-bold flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3 h-3" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>Dictate Description (Voice)</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add landmark or specific hazard details (or click Voice Dictation above)..."
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
        className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2"
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
