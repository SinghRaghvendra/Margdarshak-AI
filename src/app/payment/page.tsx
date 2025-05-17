
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Map } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/detailed-roadmap';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  name: string;
  email: string;
  contact: string;
  country: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [userTraits, setUserTraits] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    try {
      const career = localStorage.getItem('margdarshak_selected_career');
      const traits = localStorage.getItem('margdarshak_user_traits');
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      let country: string | null = null;

      if (storedUserInfo) {
        const userInfoParsed: UserInfo = JSON.parse(storedUserInfo);
        country = userInfoParsed.country;
      }

      if (career && traits && country) {
        setSelectedCareer(career);
        setUserTraits(traits);
        setUserCountry(country);
      } else {
        let missingInfo = [];
        if (!career) missingInfo.push('selected career');
        if (!traits) missingInfo.push('user traits');
        if (!country) missingInfo.push('user country');
        
        toast({ 
          title: 'Missing information', 
          description: `The following are missing: ${missingInfo.join(', ')}. Redirecting.`, 
          variant: 'destructive'
        });
        
        if (!career) router.replace('/career-suggestions');
        else if (!traits) router.replace('/psychometric-test');
        else if (!country) router.replace('/signup'); // If country is missing, likely from an older session or skipped signup
        else router.replace('/signup'); // Default fallback
      }
    } catch (error) {
      toast({ title: 'Error loading data', description: 'Please try again.', variant: 'destructive'});
      router.replace('/career-suggestions');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);

  const handlePayment = async () => {
    if (!selectedCareer || !userTraits || !userCountry) {
      toast({ title: 'Error', description: 'Career, traits, or country missing.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    toast({ title: 'Payment Processing', description: 'Simulating payment...' });

    setTimeout(async () => {
      try {
        const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap({
          careerSuggestion: selectedCareer,
          userTraits: userTraits,
          country: userCountry,
        });
        localStorage.setItem('margdarshak_roadmap', roadmapOutput.roadmap);
        toast({ title: 'Payment Successful!', description: 'Generating your detailed roadmap...' });
        router.push('/roadmap');
      } catch (error) {
        console.error('Error generating roadmap:', error);
        toast({ title: 'Error', description: 'Could not generate roadmap. Please try again.', variant: 'destructive' });
        setIsLoading(false);
      }
    }, 2000); 
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (!selectedCareer || !userCountry) { // Also check for userCountry
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Required Information Missing</h1>
        <p className="text-muted-foreground mb-6">Please ensure you have selected a career and provided your country information.</p>
        <Button onClick={() => router.push(!selectedCareer ? '/career-suggestions' : '/signup')}>
          {!selectedCareer ? 'View Suggestions' : 'Update Info'}
        </Button>
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
            Get a detailed 5-year career roadmap for <span className="font-semibold text-primary">{selectedCareer}</span>, tailored for {userCountry}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-2">Report Fee: <span className="font-bold text-2xl">₹99</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            This comprehensive report includes year-by-year guidance, expected salary ranges (localized for {userCountry}), and suggested courses.
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
