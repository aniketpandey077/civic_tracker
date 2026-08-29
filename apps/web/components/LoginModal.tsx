'use client';

import React, { useState } from 'react';
import { Mail, KeyRound, LogIn, Loader2, CheckCircle, X, Shield } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'success';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithEmail, signInWithGoogle, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);

    const { error: err } = await signInWithEmail(email.trim().toLowerCase());
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setError(null);
    setLoading(true);

    const { error: err } = await verifyOtp(email, otp.trim());
    setLoading(false);

    if (err) {
      setError('Invalid or expired code. Please try again.');
    } else {
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('email');
        setEmail('');
        setOtp('');
      }, 1800);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('email');
      setEmail('');
      setOtp('');
      setError(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A56A4] to-[#176B3A] p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Citizen Login</h2>
              <p className="text-xs text-white/80 mt-0.5">CivicTrack — Punjab Municipal System</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* STEP 1: Auth Options (Google + Email) */}
          {step === 'email' && (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl border-2 border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A56A4]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="text-xs">
                  {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center space-x-3 text-slate-400">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or with email OTP</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A56A4] focus:ring-2 focus:ring-[#1A56A4]/20 bg-slate-50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center space-x-2 bg-[#1A56A4] hover:bg-[#134688] text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-xs shadow-sm active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{loading ? 'Sending code...' : 'Send Login Code'}</span>
                </button>
              </form>

              <p className="text-center text-[10px] text-slate-400 leading-tight">
                Secure citizen authentication protected by Supabase Encryption.
              </p>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                📧 Code sent to <strong>{email}</strong>. Check your inbox (and spam folder).
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-[0.3em] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A56A4] focus:ring-2 focus:ring-[#1A56A4]/20 bg-slate-50 text-center text-lg"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center space-x-2 bg-[#176B3A] hover:bg-[#145730] text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(null); setOtp(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Logged In!</h3>
                <p className="text-sm text-slate-500 mt-1">Welcome to CivicTrack Punjab 🌾</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
