
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, Lightbulb } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/l/margdarshakAI'; // A generic payment link might be better if user details aren't passed

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string>('Guest');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || 'User');
        } else {
          // This case should ideally not be hit if signup flow is correct
          router.replace('/signup');
          return;
        }
      } else {
        setCurrentUser(null);
        setUserName('Guest');
      }

      // Check for prerequisite data. For guests, this is in localStorage.
      // For logged-in users, we assume it's in Firestore and will be used by the AI flow later.
      // The crucial check is that the local data for the *current journey* exists.
      const journeyDataExists = localStorage.getItem('margdarshak_user_traits') &&
                                localStorage.getItem('margdarshak_personalized_answers');
      
      if (!journeyDataExists) {
         toast({
          title: 'Missing Information for Report',
          description: 'Assessment data not found. Please complete all previous steps. Redirecting...',
          variant: 'destructive',
          duration: 7000,
        });
        router.replace('/personalized-questions');
        return;
      }
      
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);


  const handlePayment = () => {
    toast({ title: 'Redirecting to Payment', description: 'Opening Razorpay in a new tab...' });
    window.open(RAZORPAY_PAYMENT_LINK, '_blank');
    setPaymentInitiated(true);
  };

  const handleProceedAfterPayment = async () => {
    const key = currentUser ? `payment_successful_${currentUser.uid}` : 'margdarshak_payment_successful_guest';
    const dataToStore = { successful: true, timestamp: new Date().toISOString() };

    try {
      if (currentUser) {
        // Store payment status in Firestore for logged-in user
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { payment: dataToStore }, { merge: true });
      }
      // For both guests and logged-in users, we set a local flag for the current session
      // This avoids re-fetching from Firestore immediately and handles guest flow
      localStorage.setItem('margdarshak_payment_successful', 'true');

      toast({ title: 'Payment Confirmed!', description: 'Generating your career suggestions...' });
      router.push('/career-suggestions');

    } catch (error) {
      console.error('Error saving payment status:', error);
      toast({ title: 'Error', description: 'Could not confirm payment status. Please proceed again or contact support.', variant: 'destructive'});
    }
  };


  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">One Last Step</CardTitle>
          <CardDescription>
            Hi {userName}, you've completed the assessment! Make the one-time payment to view your Top 10 Career Suggestions and unlock your detailed reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="text-lg font-semibold mb-2 flex items-center justify-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                What you'll unlock:
            </h4>
            <ul className="list-disc list-inside text-left text-muted-foreground pl-4">
              <li>Your Top 10 AI-Powered Career Suggestions</li>
              <li>Ability to select 3 careers for in-depth analysis</li>
              <li>Comprehensive, multi-page PDF reports for your selected careers</li>
            </ul>
          </div>
          <p className="text-lg mb-2">One-Time Fee: <span className="font-bold text-2xl">₹99</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            This payment gives you full access to all generated suggestions and final reports.
          </p>

          {!paymentInitiated ? (
             <Button onClick={handlePayment} className="w-full text-lg py-6">
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ₹99 & View Suggestions
            </Button>
          ) : (
            <div className="mt-8 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md text-center">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Payment Initiated!</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1 mb-4">
                    Please complete your payment in the new tab. Once finished, click the button below to continue.
                </p>
                 <Button onClick={handleProceedAfterPayment} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white">
                    I've Paid, Show My Suggestions <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
