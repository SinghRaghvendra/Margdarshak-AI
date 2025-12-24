
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';

/**
 * This page now acts as a strict entry point for the user journey.
 * Its only job is to ensure the user is authenticated and then
 * redirect them to the start of the journey (/birth-details) to review their information.
 */
export default function WelcomeGuestPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    // Prevent routing logic from running multiple times
    if (authLoading || hasRouted) {
      return;
    }

    if (user) {
      // If the user is authenticated, always redirect them to the start of the journey.
      setHasRouted(true);
      toast({ title: "Continuing Journey", description: "Let's review your details to get started." });
      router.replace('/birth-details');
    } else {
      // If the user is not authenticated, send them to the login page.
      setHasRouted(true);
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue your journey.',
      });
      router.replace('/login');
    }

  }, [user, authLoading, router, hasRouted, toast]);

  // Display a loading spinner while the authentication check and redirection are in progress.
  return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
}
