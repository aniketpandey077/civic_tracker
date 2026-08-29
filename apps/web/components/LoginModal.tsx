'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle, X, Shield, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const { signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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
      }, 1200);
    }
  };

  const modalContent = (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-md bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
        {/* Top Header Glow Bar */}
        <div className="h-2 bg-gradient-to-r from-[#1A56A4] via-[#176B3A] to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 sm:p-9 space-y-6">

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Signed In Successfully</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Welcome to CivicTrack Municipal Portal
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* BRAND HEADER */}
              <div className="text-center space-y-3 pt-1">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#EA580C] to-[#F97316] rounded-2xl flex items-center justify-center mx-auto shadow-lg text-white">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sign in to CivicTrack
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Municipal Infrastructure Grievance & Accountability System
                  </p>
                </div>
              </div>

              {/* ERROR NOTICE */}
              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
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
                  className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
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
                  <span className="font-extrabold text-slate-800 dark:text-white">
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

  return createPortal(modalContent, document.body);
}
