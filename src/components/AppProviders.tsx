'use client';

import { FirebaseClientProvider } from '@/firebase/provider';
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // On the server, or before the component has mounted on the client,
    // show a loading spinner to prevent hydration errors and provide feedback.
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Once mounted on the client, render the actual providers and children.
  return (
    <FirebaseClientProvider>
      {children}
    </FirebaseClientProvider>
  );
}
