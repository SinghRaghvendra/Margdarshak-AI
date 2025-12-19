
'use client';

import { FirebaseClientProvider } from '@/firebase/provider';
import React, { useState, useEffect } from 'react';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // On the server, or before the first client render, you might want to return null 
    // or a loading skeleton if the children depend heavily on client-side providers.
    return null;
  }

  return (
    <FirebaseClientProvider>
      {children}
    </FirebaseClientProvider>
  );
}
