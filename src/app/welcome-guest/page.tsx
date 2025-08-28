
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowRight, RotateCw, Play } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function WelcomeGuestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState('Guest');
  const [hasProgress, setHasProgress] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'Guest');
            // Check for progress in Firestore
            if (userData.testProgress && Object.keys(userData.testProgress.answers).length > 0) {
              setHasProgress(true);
            }
             // Sync firestore data to localstorage for other components if needed
            localStorage.setItem('margdarshak_user_info', JSON.stringify({
              uid: currentUser.uid,
              name: userData.name,
              email: userData.email,
              contact: userData.contact,
              country: userData.country,
              language: userData.language,
            }));

          } else {
             toast({ title: 'User data not found', description: 'Could not retrieve your profile.', variant: 'destructive' });
             router.replace('/login');
             return;
          }
        } catch (error) {
           toast({ title: 'Error', description: 'Could not fetch user data.', variant: 'destructive' });
           console.error("Error fetching user doc:", error);
           router.replace('/login');
           return;
        }
      } else {
        toast({ title: 'Not logged in', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);
  
  const handleContinue = () => {
    router.push('/psychometric-test');
  };

  const handleStartFresh = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'No user is logged in.', variant: 'destructive' });
      return;
    }
    
    // Clear progress from Firestore
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        testProgress: null,
        userTraits: null,
        testCompleted: false,
        personalizedAnswers: null,
        careerSuggestions: null,
        selectedCareers: null,
        paymentStatus: null,
      }, { merge: true });

       // Clear all local storage journey data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_') && key !== 'margdarshak_user_info') {
          localStorage.removeItem(key);
        }
      });
      
      toast({ title: 'Starting Fresh!', description: 'Your previous assessment progress has been cleared.'});
      router.push('/birth-details');

    } catch (error) {
       toast({ title: 'Error', description: 'Could not clear your progress. Please try again.', variant: 'destructive' });
       console.error("Error clearing progress:", error);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg mx-auto shadow-xl text-center">
        <CardHeader>
          <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome, {userName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            We're excited to help you on your personalized career discovery journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasProgress ? (
            <>
              <p className="text-muted-foreground">It looks like you have progress saved. What would you like to do?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleContinue} className="w-full text-lg py-6">
                  <Play className="mr-2 h-5 w-5" /> Continue Where You Left Off
                </Button>
                <Button onClick={handleStartFresh} variant="outline" className="w-full text-lg py-6">
                  <RotateCw className="mr-2 h-5 w-5" /> Start Fresh Assessment
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={() => router.push('/birth-details')} className="w-full max-w-sm mx-auto text-lg py-6">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
