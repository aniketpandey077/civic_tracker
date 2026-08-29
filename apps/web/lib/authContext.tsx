'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null; user?: AppUser }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null; user?: AppUser }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; user?: AppUser }>;
  signInAsDemo: (role: 'citizen' | 'admin') => Promise<{ error: string | null; user?: AppUser }>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo user saved locally
    if (typeof window !== 'undefined') {
      const savedDemo = localStorage.getItem('civic_demo_user');
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
          setLoading(false);
        } catch (e) {}
      }
    }

    // Listen for Firebase auth state changes in real-time
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const appUser: AppUser = {
          id: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen',
          photoURL: fbUser.photoURL,
        };
        setUser(appUser);
        setFirebaseUser(fbUser);
      } else {
        // If not in demo mode, clear user
        if (typeof window !== 'undefined' && !localStorage.getItem('civic_demo_user')) {
          setUser(null);
          setFirebaseUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Google 1-Click Popup Login
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen',
        photoURL: fbUser.photoURL,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      let msg = err.message || 'Google Sign-In failed';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in cancelled';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Another popup is already open';
      }
      return { error: msg };
    }
  }, []);

  // 2. Email + Password Sign In
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Citizen',
        photoURL: fbUser.photoURL,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      let msg = err.message || 'Invalid credentials';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address';
      }
      return { error: msg };
    }
  }, []);

  // 3. Email + Password Sign Up
  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const appUser: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.email?.split('@')[0] || 'Citizen',
        photoURL: null,
      };
      setUser(appUser);
      return { error: null, user: appUser };
    } catch (err: any) {
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Account already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { error: msg };
    }
  }, []);

  // 4. Instant Zero-Network-Fail Demo Login (Citizen or Admin)
  const signInAsDemo = useCallback(async (role: 'citizen' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin.lmc@punjab.gov.in' : 'citizen.demo@punjab.gov.in';
    const demoName = role === 'admin' ? 'Municipal Administrator (Punjab)' : 'Gurpreet Singh (Citizen)';
    const appUser: AppUser = {
      id: role === 'admin' ? 'demo-admin-uid-101' : 'demo-citizen-uid-202',
      email: demoEmail,
      displayName: demoName,
      photoURL: null,
    };
    setUser(appUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civic_demo_user', JSON.stringify(appUser));
    }
    return { error: null, user: appUser };
  }, []);

  // 5. Sign Out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setFirebaseUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civic_demo_user');
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    return { error: null };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signInAsDemo,
        signInWithEmail,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
