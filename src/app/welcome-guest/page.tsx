
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useFirebase } from '@/components/FirebaseProvider';
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
  const { user, db, authLoading } = useFirebase();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authLoading || redirecting || !db) {
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue your journey.',
        variant: 'destructive',
      });
      router.replace('/login');
      setRedirecting(true);
      return;
    }

    const routeUser = async (currentUser: User) => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If the user has paid, their primary destination is the My Reports page.
          if (userData.paymentSuccessful) {
            router.replace('/my-reports');
          } else if (!userData.birthDetailsCompleted) {
            router.replace('/birth-details');
          } else if (!userData.testCompleted) {
            router.replace('/psychometric-test');
          } else if (!userData.personalizedAnswers) {
            router.replace('/personalized-questions');
          } else {
            // Default to career suggestions if intermediate steps are complete but payment isn't.
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
      } finally {
        setRedirecting(true);
      }
    };

    routeUser(user);

  }, [user, db, authLoading, router, redirecting, toast]);

  return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
}
