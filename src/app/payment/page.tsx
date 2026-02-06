
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, ListChecks, ArrowLeft, Tag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { doc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  
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
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        throw new Error("User info missing.");
      }

      const storedPlan = localStorage.getItem('margdarshak_selected_plan');
      if (storedPlan) {
        const plan = JSON.parse(storedPlan) as SelectedPlan;
        setSelectedPlan(plan);
        setFinalAmount(plan.price);
      } else {
        throw new Error("No plan selected.");
      }
    } catch (error: any) {
      toast({ title: 'Data Missing', description: `${error.message} Redirecting to select a plan.`, variant: 'destructive'});
      router.replace('/pricing');
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedPlan) return;

    const originalAmount = selectedPlan.price;
    let newFinalAmount = originalAmount;
    let calculatedDiscount = 0;

    const upperCaseCoupon = coupon.toUpperCase();

    if (upperCaseCoupon === 'RAGHVENDRA100') {
      newFinalAmount = 1;
      calculatedDiscount = originalAmount - 1;
    } else if (upperCaseCoupon === 'AICOUNCEL25') {
      calculatedDiscount = originalAmount * 0.25;
      newFinalAmount = originalAmount - calculatedDiscount;
    } else {
      newFinalAmount = originalAmount;
      calculatedDiscount = 0;
    }

    setDiscount(calculatedDiscount);
    setFinalAmount(newFinalAmount);
  }, [coupon, selectedPlan]);

  const handlePayment = async () => {
    if (!user || !db || !selectedPlan) {
        toast({ title: 'Session Error', description: 'User or plan details are missing. Please try again.', variant: 'destructive' });
        return;
    }
    
    // Test coupon to bypass payment gateway
    if (coupon.toUpperCase() === 'RAGHVENDRATESTTEST') {
        setIsProcessing(true);
        toast({ title: 'Processing Test Coupon...', description: 'Bypassing payment gateway for testing.' });
        try {
            await addDoc(collection(db, 'payments'), {
                userId: user.uid,
                userName: userInfo.name,
                planId: selectedPlan.id,
                amountPaid: 0,
                originalAmount: selectedPlan.price,
                couponUsed: coupon,
                razorpayOrderId: `test_order_${Date.now()}`,
                razorpayPaymentId: `test_payment_${Date.now()}`,
                status: 'SUCCESS',
                createdAt: serverTimestamp(),
                reportId: null,
            });
            toast({ title: 'Test Payment Successful!', description: 'Proceeding to your career suggestions...' });
            router.push('/career-suggestions');
        } catch (error: any) {
            toast({ title: 'Test Coupon Failed', description: error.message || 'Could not process the test coupon.', variant: 'destructive' });
            setIsProcessing(false);
        }
        return; // Stop execution here for the test coupon
    }
    
    setIsProcessing(true);
    toast({ title: 'Initializing Payment', description: 'Please wait...' });

    try {
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: selectedPlan.price,
            coupon: coupon 
        }),
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
            
            if (verificationData.success && db) {
                // Create a permanent payment record in Firestore
                await addDoc(collection(db, 'payments'), {
                    userId: user.uid,
                    userName: userInfo.name,
                    planId: selectedPlan.id,
                    amountPaid: finalAmount,
                    originalAmount: selectedPlan.price,
                    couponUsed: coupon || null,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    status: 'SUCCESS',
                    createdAt: serverTimestamp(),
                    reportId: null, // This will be filled when a report is generated
                });
                
                toast({ title: 'Payment Successful!', description: 'Proceeding to your career suggestions...' });
                router.push('/career-suggestions');
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

            <div className="mb-6 space-y-2 text-left">
              <Label htmlFor="coupon-code" className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                Coupon Code (Optional)
              </Label>
              <Input
                id="coupon-code"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
            </div>
            
             <div className="my-6 p-4 border rounded-lg bg-secondary/50 text-left space-y-3">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Original Price:</span>
                <span className="font-medium">₹{selectedPlan.price.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-xl border-t border-dashed pt-3 mt-3">
                <span>Net Payable Amount:</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <Button onClick={handlePayment} className="w-full text-lg py-6 mt-4" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
              Pay Securely
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
