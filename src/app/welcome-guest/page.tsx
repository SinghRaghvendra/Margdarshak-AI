
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * This page now acts as a Smart Linear Router.
 * Its only job is to ensure the user is authenticated and then
 * redirect them to the correct next step in their journey based on

 * their progress stored in Firestore.
 */
export default function WelcomeGuestPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (authLoading || routing || !db) {
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue your journey.',
        variant: 'destructive',
      });
      router.replace('/login');
      setRouting(true);
      return;
    }

    const routeUser = async (currentUser: User) => {
      setRouting(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (!userData.birthDetailsCompleted) {
            router.replace('/birth-details');
          } else if (!userData.testCompleted) {
            router.replace('/psychometric-test');
          } else if (!userData.personalizedAnswersCompleted) {
            router.replace('/personalized-questions');
          } else if (!userData.paymentSuccessful) {
            // All steps before payment are done, send to pricing.
            router.replace('/pricing');
          } else {
            // Payment is done, this is where the journey continues to suggestions.
            router.replace('/career-suggestions');
          }
        } else {
          // If no user document, they are a new user. Start them at the beginning.
          toast({ title: 'Welcome!', description: "Let's start your journey." });
          router.replace('/birth-details');
        }
      } catch (error) {
        console.error("Error routing user:", error);
        toast({
          title: 'Error Loading Profile',
          description: 'Could not determine your progress. Starting from the beginning.',
          variant: 'destructive'
        });
        router.replace('/birth-details');
      }
    };

    routeUser(user);

  }, [user, db, authLoading, router, routing, toast]);

  return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
}
