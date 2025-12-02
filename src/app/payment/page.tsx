
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, ListChecks } from 'lucide-react'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const REPORT_AMOUNT_INR = 99; // in INR

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({ name: 'Guest', email: '', contact: '' });
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (!auth) return;
     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        initializePage(currentUser);
      } else {
        toast({ title: 'Authentication Error', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const initializePage = (currentUser: User) => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        const parsedInfo = JSON.parse(storedUserInfo);
        setUserInfo({
          name: parsedInfo.name || 'Guest',
          email: parsedInfo.email || '',
          contact: parsedInfo.contact || ''
        });
      } else {
        toast({ title: 'User info not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        return;
      }

      const storedSelection = localStorage.getItem('margdarshak_selected_career');
      if (storedSelection) {
        setSelectedCareer(storedSelection);
      } else {
        toast({ title: 'No career selected', description: 'Please select a career first. Redirecting.', variant: 'destructive' });
        router.replace('/career-suggestions');
        return;
      }

      // Verify all prerequisite data for report generation is present before allowing payment
      const prerequisites = [
        'margdarshak_user_traits',
        'margdarshak_birth_details',
        'margdarshak_personalized_answers',
        'margdarshak_user_info'
      ];
      const missingPrerequisites = prerequisites.filter(key => !localStorage.getItem(key));

      if (missingPrerequisites.length > 0) {
        toast({
          title: 'Missing Information for Report',
          description: `The following are missing: ${missingPrerequisites.join(', ').replace(/margdarshak_/g, '')}. Please complete all steps. Redirecting...`,
          variant: 'destructive',
          duration: 7000,
        });
        if (missingPrerequisites.includes('margdarshak_personalized_answers')) router.replace('/personalized-questions');
        else if (missingPrerequisites.includes('margdarshak_user_traits')) router.replace('/psychometric-test');
        else if (missingPrerequisites.includes('margdarshak_birth_details')) router.replace('/birth-details');
        else router.replace('/signup');
        return;
      }

    } catch (error) {
      console.error("Error loading data for payment page:", error);
      toast({ title: 'Error loading page data', description: 'Please try again from an earlier step.', variant: 'destructive'});
      router.replace('/career-suggestions');
    } finally {
      setPageLoading(false);
    }
  }


  const handlePayment = async () => {
    if (!user || !db) {
        toast({ title: 'User not authenticated', description: 'Please log in again.', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    toast({ title: 'Initializing Payment', description: 'Please wait...' });

    try {
      // 1. Create Order on backend
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: REPORT_AMOUNT_INR }), // amount in INR
      });
      
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Councel',
        description: 'Career Report Generation',
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          toast({ title: 'Verifying Payment', description: 'This may take a moment, please do not close this page.' });
          try {
            const verificationResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verificationData = await verificationResponse.json();
            
            if (verificationData.success) {
                // Save payment success state to both localStorage and Firestore
                localStorage.setItem('margdarshak_payment_successful', 'true');
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { 
                  paymentSuccessful: true, 
                  lastPaymentId: response.razorpay_payment_id 
                }, { merge: true });

                toast({ title: 'Payment Successful!', description: 'Proceeding to generate your report...' });
                router.push('/roadmap'); // Directly go to roadmap to generate the report
            } else {
                throw new Error(verificationData.error || 'Payment verification failed.');
            }

          } catch (verifyError: any) {
             toast({ title: 'Payment Verification Failed', description: verifyError.message || 'An error occurred during verification. Please contact support.', variant: 'destructive', duration: 8000});
             setIsProcessing(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.contact,
        },
        theme: {
          color: '#FDD835' // This is the primary color from your theme
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        toast({
          title: 'Payment Failed',
          description: `${response.error.description} (Reason: ${response.error.reason})`,
          variant: 'destructive',
          duration: 8000,
        });
        setIsProcessing(false);
      });

    } catch (error: any) {
      toast({ title: 'Payment Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };
  
  if (pageLoading || !user) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (!selectedCareer) { 
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Career Selection Incomplete</h1>
        <p className="text-muted-foreground mb-6">Please select a career on the previous page to proceed.</p>
        <Button onClick={() => router.push('/career-suggestions')}>Select a Career</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Unlock Your Career Report</CardTitle>
          <CardDescription>
            Hi {userInfo.name}, you're one step away from your detailed report. Pay the one-time fee to generate your roadmap and see your full list of career matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="text-lg font-semibold mb-2 flex items-center justify-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Selected Career for Detailed Report:
            </h4>
            <p className="font-bold text-xl">{selectedCareer}</p>
          </div>
          <p className="text-lg mb-2">Total Report Fee: <span className="font-bold text-2xl">₹{REPORT_AMOUNT_INR}</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            This one-time payment unlocks a detailed report for your selected career and reveals your top 5 career matches with scores.
          </p>
          
          <Button onClick={handlePayment} className="w-full text-lg py-6" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
            Pay ₹{REPORT_AMOUNT_INR} & Access Reports
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
