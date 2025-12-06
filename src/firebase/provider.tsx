'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Define the shape of the Firebase context value
interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

// Create the context with a null default value
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

/**
 * The main provider component.
 * It ensures Firebase is only initialized on the client-side.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // useMemo ensures this logic runs only once per component lifecycle.
  const firebaseServices = useMemo(() => {
    // Crucially, check if we are in a browser environment.
    if (typeof window !== 'undefined') {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      return { app, auth, db };
    }
    // On the server, return null for all services.
    return { app: null, auth: null, db: null };
  }, []);

  return (
    <FirebaseContext.Provider value={firebaseServices}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to safely access the Firebase app instance.
export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebaseApp must be used within a FirebaseClientProvider');
  }
  // This hook can now be called in components that might be server-rendered,
  // but it will return null on the server.
  return context.app;
}

// Custom hook to safely access the Firebase Auth instance.
export function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseClientProvider');
  }
  if (context.auth === null && typeof window !== 'undefined') {
    // This case would indicate an issue, but is unlikely with the provider logic.
    throw new Error('Auth not initialized on the client. Check FirebaseClientProvider.');
  }
  return context.auth;
}

// Custom hook to safely access the Firestore instance.
export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirestore must be used within a FirebaseClientProvider');
  }
   if (context.db === null && typeof window !== 'undefined') {
    throw new Error('Firestore not initialized on the client. Check FirebaseClientProvider.');
  }
  return context.db;
}
