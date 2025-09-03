
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowRight, RotateCw, Play, CreditCard } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type ProgressState = 'none' | 'partial_test' | 'test_complete_no_selection' | 'selection_complete_no_payment' | 'paid';

export default function WelcomeGuestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState('Guest');
  const [progressState, setProgressState] = useState<ProgressState>('none');
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
            
            // Determine progress state
            if (userData.paymentSuccessful) {
                setProgressState('paid');
            } else if (userData.selectedCareersList && userData.selectedCareersList.length === 3) {
                setProgressState('selection_complete_no_payment');
                localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify(userData.selectedCareersList));
            } else if (userData.testCompleted) {
                setProgressState('test_complete_no_selection');
            } else if (userData.testProgress && userData.testProgress.answers && Object.keys(userData.testProgress.answers).length > 0) {
              setProgressState('partial_test');
            } else {
              setProgressState('none');
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
            
            // Sync other essential data if it exists
             if (userData.birthDetails) localStorage.setItem('margdarshak_birth_details', JSON.stringify(userData.birthDetails));
             if (userData.userTraits) localStorage.setItem('margdarshak_user_traits', userData.userTraits);
             if (userData.personalizedAnswers) localStorage.setItem('margdarshak_personalized_answers', JSON.stringify(userData.personalizedAnswers));


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
    switch (progressState) {
        case 'paid':
            router.push('/my-reports');
            break;
        case 'selection_complete_no_payment':
            router.push('/payment');
            break;
        case 'test_complete_no_selection':
            router.push('/personalized-questions');
            break;
        case 'partial_test':
            router.push('/psychometric-test');
            break;
        default:
            router.push('/birth-details');
    }
  };

  const handleStartFresh = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'No user is logged in.', variant: 'destructive' });
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        testProgress: null,
        userTraits: null,
        testCompleted: false,
        personalizedAnswers: null,
        selectedCareersList: null,
        paymentSuccessful: null,
        // Reset other fields as necessary
      });

       // Clear all local storage journey data, keeping user info
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

  const renderContent = () => {
    if (progressState === 'none') {
        return (
             <Button onClick={() => router.push('/birth-details')} className="w-full max-w-sm mx-auto text-lg py-6">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        )
    }

    let description = "It looks like you have progress saved. What would you like to do?";
    let ctaText = "Continue Where You Left Off";
    let ctaIcon = <Play className="mr-2 h-5 w-5" />;

    if (progressState === 'selection_complete_no_payment') {
        description = "You're just one step away! You've completed the assessment and selected your careers. Let's checkout.";
        ctaText = "Proceed to Checkout";
        ctaIcon = <CreditCard className="mr-2 h-5 w-5" />
    } else if (progressState === 'paid') {
        description = "Welcome back! You can view your previously generated reports or start a new assessment."
        ctaText = "View My Reports"
    }

    return (
        <>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleContinue} className="w-full text-lg py-6">
              {ctaIcon} {ctaText}
            </Button>
            <Button onClick={handleStartFresh} variant="outline" className="w-full text-lg py-6">
              <RotateCw className="mr-2 h-5 w-5" /> Start Fresh AI Councel Career Guide
            </Button>
          </div>
        </>
    );
  }

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
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
