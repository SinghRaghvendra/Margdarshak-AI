'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuth } from './firebase/provider';

// This file is now the central point for client-side Firebase hooks.

// Hook for user authentication state
interface UserState {
  user: User | null;
  loading: boolean;
}

export function useUser(): UserState {
  const authInstance = useAuth();
  const [user, setUser] = useState<User | null>(authInstance.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authInstance]);

  return { user, loading };
}

// Re-exporting hooks from provider for a single import point.
export { useAuth, useFirestore, FirebaseClientProvider, useFirebaseApp } from './firebase/provider';
