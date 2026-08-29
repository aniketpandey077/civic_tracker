'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle, X, Shield, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setGoogleLoading(false);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Google 1-Click Sign-In
  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err, user } = await signInWithGoogle();
    setGoogleLoading(false);

    if (err) {
      setError(err);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Glow Bar */}
        <div className="h-2 bg-gradient-to-r from-[#1A56A4] via-[#176B3A] to-amber-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10 space-y-6">

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Signed In Successfully</h3>
                <p className="text-xs text-slate-500">
                  Welcome to CivicTrack Municipal Portal
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* BRAND HEADER */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#1A56A4] to-[#176B3A] rounded-2xl flex items-center justify-center mx-auto shadow-lg text-white">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Sign in to CivicTrack
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Punjab Municipal Infrastructure Grievance & Accountability System
                  </p>
                </div>
              </div>

              {/* ERROR NOTICE */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
                  <Lock className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* GOOGLE SIGN IN BUTTON (ONLY OPTION) */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A56A4]" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="text-slate-800 font-extrabold">
                    {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                  </span>
                </button>
              </div>

              {/* SECURITY BADGE */}
              <div className="pt-2 text-center">
                <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Secure 256-bit encrypted authentication</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
