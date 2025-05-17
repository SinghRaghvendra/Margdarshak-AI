'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Map } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/detailed-roadmap';
import { useToast } from '@/hooks/use-toast';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [userTraits, setUserTraits] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    try {
      const career = localStorage.getItem('margdarshak_selected_career');
      const traits = localStorage.getItem('margdarshak_user_traits');

      if (career && traits) {
        setSelectedCareer(career);
        setUserTraits(traits);
      } else {
        toast({ title: 'Missing information', description: 'Selected career or user traits not found. Redirecting.', variant: 'destructive'});
        router.replace(career ? '/psychometric-test' : '/career-suggestions');
      }
    } catch (error) {
      toast({ title: 'Error loading data', description: 'Please try again.', variant: 'destructive'});
      router.replace('/career-suggestions');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);

  const handlePayment = async () => {
    if (!selectedCareer || !userTraits) {
      toast({ title: 'Error', description: 'Career or traits missing.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    // This is a mock payment. In a real app, integrate a payment gateway.
    toast({ title: 'Payment Processing', description: 'Simulating payment...' });

    setTimeout(async () => {
      try {
        const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap({
          careerSuggestion: selectedCareer,
          userTraits: userTraits,
        });
        localStorage.setItem('margdarshak_roadmap', roadmapOutput.roadmap);
        toast({ title: 'Payment Successful!', description: 'Generating your detailed roadmap...' });
        router.push('/roadmap');
      } catch (error) {
        console.error('Error generating roadmap:', error);
        toast({ title: 'Error', description: 'Could not generate roadmap. Please try again.', variant: 'destructive' });
        setIsLoading(false);
      }
    }, 2000); // Simulate payment processing time
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (!selectedCareer) {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">No Career Selected</h1>
        <p className="text-muted-foreground mb-6">Please select a career first.</p>
        <Button onClick={() => router.push('/career-suggestions')}>View Suggestions</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Unlock Your Roadmap</CardTitle>
          <CardDescription>
            Get a detailed 5-year career roadmap for <span className="font-semibold text-primary">{selectedCareer}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-2">Report Fee: <span className="font-bold text-2xl">₹499</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            This comprehensive report includes year-by-year guidance, expected salary ranges, and suggested courses.
          </p>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Button onClick={handlePayment} className="w-full text-lg py-6">
              <Map className="mr-2 h-5 w-5" />
              Pay and Generate Roadmap
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
