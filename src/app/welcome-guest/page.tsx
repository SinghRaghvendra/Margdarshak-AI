
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowRight, RotateCw, Play, CreditCard, BookUser } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type ProgressState = 'none' | 'birth_details_pending' | 'test_pending' | 'test_partial' | 'personalized_questions_pending' | 'selection_pending' | 'payment_pending' | 'paid';

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
            
            // Determine progress state from Firestore
            if (userData.paymentSuccessful) {
                setProgressState('paid');
            } else if (userData.selectedCareersList && Array.isArray(userData.selectedCareersList) && userData.selectedCareersList.length > 0) {
                setProgressState('payment_pending');
            } else if (userData.allCareerSuggestions) {
                 setProgressState('selection_pending');
            } else if (userData.personalizedAnswers) {
                // This state indicates suggestions need to be generated next
                setProgressState('selection_pending');
            } else if (userData.testCompleted) {
                setProgressState('personalized_questions_pending'); // If test is done, next step is personalized Qs
            } else if (userData.testProgress && userData.testProgress.answers && Object.keys(userData.testProgress.answers).length > 0) {
              setProgressState('test_partial');
            } else if (userData.birthDetails) {
              setProgressState('test_pending');
            } else {
              setProgressState('birth_details_pending');
            }

             // Sync firestore data to localstorage for other components that might need it
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
             if (userData.allCareerSuggestions) localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(userData.allCareerSuggestions));
             if (userData.selectedCareersList) localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify(userData.selectedCareersList));
             if (userData.paymentSuccessful) localStorage.setItem('margdarshak_payment_successful', 'true');

          } else {
             toast({ title: 'User data not found', description: 'Could not retrieve your profile. Please sign up again.', variant: 'destructive' });
             router.replace('/signup');
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
        case 'payment_pending':
            router.push('/payment');
            break;
        case 'selection_pending':
             router.push('/career-suggestions');
            break;
        case 'personalized_questions_pending':
            router.push('/personalized-questions');
            break;
        case 'test_partial':
        case 'test_pending':
            router.push('/psychometric-test');
            break;
        case 'birth_details_pending':
        default:
            router.push('/birth-details');
    }
  };

  const handleStartFresh = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'No user is logged in.', variant: 'destructive' });
      return;
    }
    setPageLoading(true);
    toast({ title: 'Clearing Progress...', description: 'Please wait.' });
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        testProgress: null,
        userTraits: null,
        testCompleted: false,
        personalizedAnswers: null,
        allCareerSuggestions: null,
        selectedCareersList: null,
        paymentSuccessful: false,
        birthDetails: null, // Also clear birth details to start completely fresh
      }, { merge: true });

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
       setPageLoading(false);
    }
  };

  const renderContent = () => {
    let description, ctaText, ctaIcon;

    switch (progressState) {
      case 'paid':
        description = "Welcome back! You can view your previously generated reports or start a new assessment.";
        ctaText = "View My Reports";
        ctaIcon = <BookUser className="mr-2 h-5 w-5" />;
        break;
      case 'payment_pending':
        description = "You're just one step away! You've completed the assessment and selected your careers. Let's checkout.";
        ctaText = "Proceed to Checkout";
        ctaIcon = <CreditCard className="mr-2 h-5 w-5" />;
        break;
      case 'selection_pending':
        description = "You've finished your answers! Let's review your AI-generated career suggestions and pick your top choices.";
        ctaText = "View Career Suggestions";
        ctaIcon = <Play className="mr-2 h-5 w-5" />;
        break;
      case 'personalized_questions_pending':
        description = "You've finished the test! Let's continue by answering a few personalized questions to refine your results.";
        ctaText = "Answer Personalized Questions";
        ctaIcon = <Play className="mr-2 h-5 w-5" />;
        break;
      case 'test_partial':
        description = "You're partway through the psychometric test. Let's pick up where you left off.";
        ctaText = "Continue Test";
        ctaIcon = <Play className="mr-2 h-5 w-5" />;
        break;
      case 'test_pending':
        description = "You've provided your birth details. The next step is the psychometric test.";
        ctaText = "Start Psychometric Test";
        ctaIcon = <Play className="mr-2 h-5 w-5" />;
        break;
      case 'birth_details_pending':
      default:
        description = "Let's start your journey by gathering some basic information to personalize your experience.";
        ctaText = "Start Your Journey";
        ctaIcon = <ArrowRight className="mr-2 h-5 w-5" />;
        break;
    }

    return (
        <>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={handleContinue} className="w-full text-lg py-6">
              {ctaIcon} {progressState === 'birth_details_pending' ? ctaText : 'Continue Where You Left Off'}
            </Button>
            <Button onClick={handleStartFresh} variant="outline" className="w-full text-lg py-6">
              <RotateCw className="mr-2 h-5 w-5" /> Start Fresh Assessment
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
