
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, ListChecks } from 'lucide-react'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedCareersList, setSelectedCareersList] = useState<string[]>([]);
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

      const storedSelections = localStorage.getItem('margdarshak_selected_careers_list');
      if (storedSelections) {
        const parsedSelections: string[] = JSON.parse(storedSelections);
        if (parsedSelections.length === 3) {
          setSelectedCareersList(parsedSelections);
        } else {
          toast({ title: 'Invalid career selection', description: 'Please select 3 careers. Redirecting.', variant: 'destructive' });
          router.replace('/career-suggestions');
          return;
        }
      } else {
        toast({ title: 'No careers selected', description: 'Redirecting to select careers.', variant: 'destructive' });
        router.replace('/career-suggestions');
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
      router.replace('/career-suggestions');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    toast({ title: 'Payment Processing', description: 'Simulating payment...' });

    // Simulate payment delay
    setTimeout(async () => {
      try {
        // On successful payment, we don't generate the roadmap here anymore.
        // We just navigate to the roadmap page where the user can generate reports one by one.
        localStorage.setItem('margdarshak_payment_successful', 'true'); // Flag payment success
        
        // Clear any single roadmap markdown from previous flows if it exists
        localStorage.removeItem('margdarshak_roadmap_markdown');

        toast({ title: 'Payment Successful!', description: 'Proceeding to view your selected career roadmaps...' });
        router.push('/roadmap');
      } catch (error) {
        console.error('Error during payment/redirect:', error);
        toast({ title: 'Error after payment', description: 'Could not proceed to roadmaps. Please try again or contact support.', variant: 'destructive', duration: 7000 });
        localStorage.removeItem('margdarshak_payment_successful');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000); 
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (selectedCareersList.length !== 3) { 
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Career Selection Incomplete</h1>
        <p className="text-muted-foreground mb-6">Please select 3 careers on the previous page to proceed.</p>
        <Button onClick={() => router.push('/career-suggestions')}>Select Careers</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Unlock Your Career Reports</CardTitle>
          <CardDescription>
            Hi {userName}, you've selected 3 careers to explore. Pay the one-time fee to generate detailed reports for each.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6 p-4 border rounded-md bg-secondary/50">
            <h4 className="text-lg font-semibold mb-2 flex items-center justify-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Selected Careers for Detailed Reports:
            </h4>
            <ul className="list-decimal list-inside text-left text-muted-foreground pl-4">
              {selectedCareersList.map(career => <li key={career}>{career}</li>)}
            </ul>
          </div>
          <p className="text-lg mb-2">Total Report Fee: <span className="font-bold text-2xl">₹99</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            This one-time payment allows you to generate and download comprehensive reports for all three selected careers.
          </p>
          {isProcessingPayment ? (
            <div className="flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-2 text-muted-foreground">Processing payment...</p>
            </div>
          ) : (
            <Button onClick={handlePayment} className="w-full text-lg py-6">
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ₹99 & Access Reports
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
