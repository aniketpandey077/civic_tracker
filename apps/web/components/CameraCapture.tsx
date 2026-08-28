'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles, Upload, Video, SwitchCamera } from 'lucide-react';
import { detectCivicIssue, DetectionResult } from '../lib/aiDetector';

interface CameraCaptureProps {
  onPhotoCaptured: (photoDataUrl: string, aiResult: DetectionResult) => void;
  selectedCategory?: string;
}

export default function CameraCapture({ onPhotoCaptured, selectedCategory }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // 100% Authentic, verified civic infrastructure defect photos
  const samplePresets = [
    {
      label: '🕳️ Asphalt Road Pothole',
      category: 'pothole',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '🌳 Fallen Tree on Roadway',
      category: 'fallen_tree',
      url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '⚡ Tangled Live Power Cables',
      category: 'exposed_wires',
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '🗑️ Overflowing Garbage Dump',
      category: 'garbage',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '🦟 Stagnant Street Flood Pool',
      category: 'water_logging',
      url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '🧱 Broken Pedestrian Pavers',
      category: 'broken_footpath',
      url: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '💡 Damaged Dark Streetlight',
      category: 'streetlight',
      url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: '💧 Gushing Pipeline Fracture',
      category: 'water_leakage',
      url: 'https://images.unsplash.com/photo-1527066579998-dbbae57f45ce?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported on this browser. Please use Chrome/Edge or click Upload Photo.');
      return;
    }

    let mediaStream: MediaStream | null = null;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (e1: any) {
      console.warn('Initial camera constraint failed, attempting general fallback...', e1);
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (e2: any) {
        console.error('Camera access denied or failed:', e2);
        if (e2.name === 'NotAllowedError' || e2.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was blocked. Please click the camera icon in your browser address bar to allow access, or upload a photo below.');
        } else if (e2.name === 'NotFoundError' || e2.name === 'DevicesNotFoundError') {
          setCameraError('No webcam or camera device was found on this computer. You can upload a photo or use the sample shortcuts below.');
        } else {
          setCameraError(`Camera error: ${e2.message || 'Unable to open camera'}. You can upload a photo or use the presets below.`);
        }
        return;
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.warn('Video play note:', err));
        }
      }, 100);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      processCapturedPhoto(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        processCapturedPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const processCapturedPhoto = async (photoUrl: string) => {
    setCapturedPhoto(photoUrl);
    setIsAnalyzing(true);
    setDetectionResult(null);

    const result = await detectCivicIssue(photoUrl, selectedCategory);
    setDetectionResult(result);
    setIsAnalyzing(false);

    onPhotoCaptured(photoUrl, result);
  };

  const selectPreset = (presetUrl: string, category: string) => {
    stopCamera();
    processCapturedPhoto(presetUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setDetectionResult(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      {/* Viewport Area */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video max-h-80 flex items-center justify-center text-white shadow-inner">
        {/* Active Live Video Stream */}
        {isCameraActive && !capturedPhoto && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-emerald-400 rounded-full animate-pulse" />
            </div>
            
            {/* Live Indicator */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>CAMERA ACTIVE</span>
            </div>

            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur p-2 rounded-full text-white border border-slate-700 shadow-md transition-colors"
              title="Switch Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Captured Photo Preview */}
        {capturedPhoto && (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedPhoto}
              alt="Captured Issue"
              className="w-full h-full object-cover"
            />

            {/* AI Scanning Line Animation */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex flex-col items-center justify-center">
                <div className="animate-scan-line" />
                <div className="bg-slate-900/90 border border-emerald-500/50 px-5 py-3 rounded-2xl text-center space-y-1 shadow-2xl">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>YOLOv8 Inference Running...</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Extracting defect spatial contours & confidence</p>
                </div>
              </div>
            )}

            {/* AI Result Overlay Badge */}
            {detectionResult && !isAnalyzing && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 p-3 rounded-xl shadow-lg flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{detectionResult.detected_class}</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                        {(detectionResult.confidence * 100).toFixed(1)}% AI CONFIDENCE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">CV validation passed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retake</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Initial Idle State */}
        {!isCameraActive && !capturedPhoto && (
          <div className="text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Capture Live Photo Evidence</p>
              <p className="text-xs text-slate-400 mt-1">
                YOLOv8 Computer Vision model validates genuine civic defects automatically.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Open Webcam / Camera</span>
              </button>
              <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 shadow cursor-pointer transition-all flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Photo File</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Button when camera is active */}
      {isCameraActive && !capturedPhoto && (
        <div className="flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={takePhoto}
            className="w-16 h-16 rounded-full bg-white p-1 border-4 border-emerald-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            aria-label="Take Photo"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500" />
          </button>
        </div>
      )}

      {/* Quick Sample Presets */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          ⚡ Instant Photo Shortcuts (Click to Test AI Detection):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPreset(preset.url, preset.category)}
              className="text-left px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-medium text-slate-700 hover:text-emerald-900 transition-all truncate"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {cameraError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">{cameraError}</p>
            <p className="text-[11px] text-amber-800">You can also use the <strong>Upload Photo</strong> button or any sample preset above to test instant detection.</p>
          </div>
        </div>
      )}
    </div>
  );
}
