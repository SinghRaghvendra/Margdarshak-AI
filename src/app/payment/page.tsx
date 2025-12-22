'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, ListChecks, ArrowLeft } from 'lucide-react'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SelectedPlan {
    id: string;
    price: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
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
  }, [auth, router, toast]);

  const initializePage = (currentUser: User) => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        throw new Error("User info missing.");
      }

      const storedPlan = localStorage.getItem('margdarshak_selected_plan');
      if (storedPlan) {
        setSelectedPlan(JSON.parse(storedPlan));
      } else {
        throw new Error("No plan selected.");
      }
    } catch (error: any) {
      toast({ title: 'Data Missing', description: `${error.message} Redirecting to plans page.`, variant: 'destructive'});
      router.replace('/career-suggestions'); // This is now the plans page
    } finally {
      setPageLoading(false);
    }
  }


  const handlePayment = async () => {
    if (!user || !db || !selectedPlan) {
        toast({ title: 'Session Error', description: 'User or plan details are missing. Please try again.', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    toast({ title: 'Initializing Payment', description: 'Please wait...' });

    try {
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedPlan.price }),
      });
      
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Councel',
        description: `Career Report Plan: ${selectedPlan.id}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          toast({ title: 'Verifying Payment', description: 'Please do not close this page.' });
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
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { 
                  paymentSuccessful: true,
                  purchasedPlan: selectedPlan.id,
                  lastPaymentId: response.razorpay_payment_id 
                }, { merge: true });

                toast({ title: 'Payment Successful!', description: 'Proceeding to generate your report...' });
                router.push('/roadmap');
            } else {
                throw new Error(verificationData.error || 'Payment verification failed.');
            }

          } catch (verifyError: any) {
             toast({ title: 'Verification Failed', description: verifyError.message, variant: 'destructive', duration: 8000});
             setIsProcessing(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.contact,
        },
        theme: {
          color: '#FDD835'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        toast({
          title: 'Payment Failed',
          description: `${response.error.description}`,
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
  
  if (pageLoading || !user || !selectedPlan) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="flex justify-center items-center py-8">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold">Confirm Your Purchase</CardTitle>
            <CardDescription>
              Hi {userInfo.name}, you are one step away from unlocking your personalized career report.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6 p-4 border rounded-md bg-secondary/50">
              <h4 className="text-lg font-semibold mb-2 flex items-center justify-center">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" />
                  Selected Plan
              </h4>
              <p className="font-bold text-xl capitalize">{selectedPlan.id} Report</p>
            </div>
            <p className="text-lg mb-2">Total Amount Due: <span className="font-bold text-2xl">₹{selectedPlan.price}</span></p>
            
            <Button onClick={handlePayment} className="w-full text-lg py-6 mt-4" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
              Pay ₹{selectedPlan.price} Securely
            </Button>
            
            <Button variant="link" className="mt-4 text-muted-foreground" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Change Plan
            </Button>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
