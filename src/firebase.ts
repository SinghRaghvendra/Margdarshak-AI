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
  // Initialize state based on whether auth is available.
  const [user, setUser] = useState<User | null>(() => authInstance?.currentUser ?? null);
  const [loading, setLoading] = useState(authInstance === null); // Start loading if auth isn't ready.

  useEffect(() => {
    // Only subscribe if auth is initialized (on the client).
    if (authInstance) {
      setLoading(true);
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If on the server, we are not loading and there is no user.
      setLoading(false);
      setUser(null);
    }
  }, [authInstance]);

  return { user, loading };
}

// Re-exporting hooks from provider for a single import point.
export { useAuth, useFirestore, FirebaseClientProvider, useFirebaseApp } from './firebase/provider';
