'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuth } from './firebase/provider';

// This file is now simplified to only contain the useUser hook,
// which is client-side and depends on the provider.

// Hook for user authentication state
interface UserState {
  user: User | null;
  loading: boolean;
}

export function useUser(): UserState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authInstance = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authInstance]);

  return { user, loading };
}

// Re-exporting hooks from provider for a single import point if desired
export { useAuth, useFirestore, FirebaseClientProvider } from './firebase/provider';
export { app, auth, db } from './firebase/config';
