
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, Lightbulb } from 'lucide-react'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/rjxEWZu1';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string>('Guest');

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        setUserName(JSON.parse(storedUserInfo).name || 'Guest');
      } else {
        toast({ title: 'User info not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        return;
      }
      
      // Verify all prerequisite data for report generation is present before allowing payment
      const prerequisites = [
        'margdarshak_user_traits',
        'margdarshak_birth_details', // Contains DOB, POB, TOB
        'margdarshak_personalized_answers',
        'margdarshak_user_info' // Contains country, name
      ];
      const missingPrerequisites = prerequisites.filter(key => !localStorage.getItem(key));

      if (missingPrerequisites.length > 0) {
        toast({
          title: 'Missing Information for Report',
          description: `The following are missing: ${missingPrerequisites.join(', ').replace(/margdarshak_/g, '')}. Please complete all steps. Redirecting...`,
          variant: 'destructive',
          duration: 7000,
        });
        // Attempt to redirect to a sensible previous step
        if (missingPrerequisites.includes('margdarshak_personalized_answers')) router.replace('/personalized-questions');
        else if (missingPrerequisites.includes('margdarshak_user_traits')) router.replace('/psychometric-test');
        else if (missingPrerequisites.includes('margdarshak_birth_details')) router.replace('/birth-details');
        else router.replace('/signup');
        return;
      }

    } catch (error) {
      console.error("Error loading data for payment page:", error);
      toast({ title: 'Error loading page data', description: 'Please try again from an earlier step.', variant: 'destructive'});
      router.replace('/personalized-questions');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);

  const handlePayment = () => {
    toast({ title: 'Redirecting to Payment', description: 'Opening Razorpay in a new tab...' });
    window.open(RAZORPAY_PAYMENT_LINK, '_blank');
    setPaymentInitiated(true);
  };
  
  const handleProceedAfterPayment = () => {
    localStorage.setItem('margdarshak_payment_successful', 'true');
    toast({ title: 'Payment Confirmed!', description: 'Generating your career suggestions...' });
    router.push('/career-suggestions');
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
