'use client';

import { auth, db } from './config';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, ReactNode } from 'react';

// Context for Firebase services
interface FirebaseContextValue {
  auth: Auth;
  db: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// Provider component
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Hooks to use Firebase services
export function useAuth() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseClientProvider');
  }
  return context.auth;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseClientProvider');
  }
  return context.db;
}
