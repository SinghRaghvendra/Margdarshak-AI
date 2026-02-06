
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyPaymentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const razorpay_payment_id = searchParams.get('razorpay_payment_id');
    const razorpay_order_id = searchParams.get('razorpay_order_id');
    const razorpay_signature = searchParams.get('razorpay_signature');

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      setError('Payment details are missing. Unable to verify.');
      setStatus('failed');
      return;
    }

    const verifyAndProcessPayment = async () => {
      try {
        // Step 1: Verify the signature with our backend
        const verificationResponse = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          }),
        });

        const verificationData = await verificationResponse.json();
        if (!verificationData.success) {
          throw new Error(verificationData.error || 'Payment signature verification failed.');
        }
        toast({ title: 'Payment Verified', description: 'Saving your purchase details...' });

        // Step 2: Get user and plan info from localStorage
        const user = auth?.currentUser;
        const userInfoString = localStorage.getItem('margdarshak_user_info');
        const planString = localStorage.getItem('margdarshak_selected_plan');
        const coupon = localStorage.getItem('margdarshak_coupon_used') || null;
        const finalAmount = localStorage.getItem('margdarshak_final_amount');


        if (!user || !db || !userInfoString || !planString || !finalAmount) {
          throw new Error('Your session has expired. Please try the purchase again.');
        }

        const userInfo = JSON.parse(userInfoString);
        const plan = JSON.parse(planString);

        // Step 3: Create the payment document in Firestore
        const paymentDocRef = await addDoc(collection(db, 'payments'), {
          userId: user.uid,
          userName: userInfo.name,
          planId: plan.id,
          amountPaid: parseFloat(finalAmount),
          originalAmount: plan.price,
          couponUsed: coupon,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'SUCCESS',
          createdAt: serverTimestamp(),
          reportId: null,
        });

        // Step 4: Save the payment ID and navigate
        localStorage.setItem('margdarshak_payment_id_for_report', paymentDocRef.id);
        
        // Clean up temporary items
        localStorage.removeItem('margdarshak_coupon_used');
        localStorage.removeItem('margdarshak_final_amount');

        setStatus('success');
        toast({ title: 'Purchase Successful!', description: 'Redirecting to your career suggestions...' });

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/career-suggestions');
        }, 2000);

      } catch (err: any) {
        setError(err.message);
        setStatus('failed');
        toast({ title: 'Verification Failed', description: err.message, variant: 'destructive' });
      }
    };

    verifyAndProcessPayment();
  }, [searchParams, router, toast, auth, db]);

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <CardHeader>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait, do not close this window...</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingSpinner size={48} />
            </CardContent>
          </>
        )}
        {status === 'success' && (
          <>
            <CardHeader>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-500">Payment Successful!</CardTitle>
                <CardDescription>Your purchase has been confirmed. Redirecting...</CardDescription>
            </CardHeader>
            <CardContent>
               <LoadingSpinner size={48} />
            </CardContent>
          </>
        )}
        {status === 'failed' && (
          <>
            <CardHeader>
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Payment Failed</CardTitle>
              <CardDescription>{error || 'An unknown error occurred.'}</CardDescription>
            </CardHeader>
            <CardContent>
               <Button onClick={() => router.push('/pricing')}>Try Again</Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}


export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>}>
            <VerifyPaymentComponent />
        </Suspense>
    )
}
