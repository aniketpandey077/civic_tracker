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
  const { signInWithEmail, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

        <div className="p-6 space-y-5">

          {/* STEP 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your email to receive a <span className="font-semibold text-slate-800">one-time login code</span>. No password required.
                </p>
              </div>

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
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A56A4] focus:ring-2 focus:ring-[#1A56A4]/20 bg-slate-50"
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
                className="w-full flex items-center justify-center space-x-2 bg-[#1A56A4] hover:bg-[#1346884] text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Sending code...' : 'Send Login Code'}</span>
              </button>

              <p className="text-center text-[11px] text-slate-400">
                By continuing, you agree to CivicTrack's usage terms. Your data is encrypted and stored securely on Supabase.
              </p>
            </form>
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
