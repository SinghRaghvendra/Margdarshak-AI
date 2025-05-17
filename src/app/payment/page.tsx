
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Download, Map, RadioTower } from 'lucide-react'; // Using RadioTower for UPI
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateRoadmap, type GenerateRoadmapOutput, type GenerateRoadmapInput } from '@/ai/flows/detailed-roadmap';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  name: string;
  email: string;
  contact: string;
  country: string;
}

interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // State to hold all necessary data for roadmap generation
  const [roadmapGenData, setRoadmapGenData] = useState<GenerateRoadmapInput | null>(null);


  useEffect(() => {
    try {
      const career = localStorage.getItem('margdarshak_selected_career');
      const traits = localStorage.getItem('margdarshak_user_traits');
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      const storedBirthDetails = localStorage.getItem('margdarshak_birth_details');
      const astroReview = localStorage.getItem('margdarshak_career_insights_astro');
      const numeroReview = localStorage.getItem('margdarshak_career_insights_numero');

      let userName: string | null = null;
      let userCountry: string | null = null;
      let dateOfBirth: string | null = null;

      if (storedUserInfo) {
        const userInfoParsed: UserInfo = JSON.parse(storedUserInfo);
        userName = userInfoParsed.name;
        userCountry = userInfoParsed.country;
      }
      
      if (storedBirthDetails) {
        const birthDetailsParsed: BirthDetails = JSON.parse(storedBirthDetails);
        dateOfBirth = birthDetailsParsed.dateOfBirth;
      }

      if (career && traits && userName && userCountry && dateOfBirth && astroReview && numeroReview) {
        setRoadmapGenData({
          careerSuggestion: career,
          userTraits: traits,
          country: userCountry,
          userName: userName,
          dateOfBirth: dateOfBirth,
          astrologicalReview: astroReview,
          numerologicalReview: numeroReview,
        });
      } else {
        let missingInfo = [];
        if (!career) missingInfo.push('selected career');
        if (!traits) missingInfo.push('user traits');
        if (!userName) missingInfo.push('user name');
        if (!userCountry) missingInfo.push('user country');
        if (!dateOfBirth) missingInfo.push('date of birth');
        if (!astroReview) missingInfo.push('astrological review');
        if (!numeroReview) missingInfo.push('numerological review');
        
        toast({ 
          title: 'Missing Information for Report', 
          description: `The following are missing: ${missingInfo.join(', ')}. Please go back and complete all steps. Redirecting...`, 
          variant: 'destructive',
          duration: 5000,
        });
        
        // Determine redirect based on missing info
        if (!career) router.replace('/career-suggestions');
        else if (!traits) router.replace('/psychometric-test');
        else if (!dateOfBirth) router.replace('/birth-details');
        else if (!astroReview || !numeroReview) router.replace('/career-insights');
        else if (!userName || !userCountry) router.replace('/signup');
        else router.replace('/signup'); // Fallback
      }
    } catch (error) {
      toast({ title: 'Error loading data', description: 'Please try again from an earlier step.', variant: 'destructive'});
      router.replace('/career-suggestions'); // Fallback
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);

  const handlePayment = async () => {
    if (!roadmapGenData) {
      toast({ title: 'Error', description: 'Required data for roadmap generation is missing.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    toast({ title: 'UPI Payment Processing', description: 'Simulating UPI payment...' });

    setTimeout(async () => {
      try {
        const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap(roadmapGenData);
        localStorage.setItem('margdarshak_roadmap_markdown', roadmapOutput.roadmapMarkdown);
        toast({ title: 'Payment Successful!', description: 'Generating your detailed roadmap...' });
        router.push('/roadmap');
      } catch (error) {
        console.error('Error generating roadmap:', error);
        toast({ title: 'Error Generating Roadmap', description: 'Could not generate roadmap. Please try again.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }, 2000); 
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (!roadmapGenData) { 
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Required Information Missing</h1>
        <p className="text-muted-foreground mb-6">Some information needed for the report is missing. Please ensure all previous steps are completed.</p>
        <Button onClick={() => router.push('/signup')}>Start Over</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <RadioTower className="h-12 w-12 text-primary mx-auto mb-4" /> {/* Icon for UPI */}
          <CardTitle className="text-3xl font-bold">Pay via UPI</CardTitle>
          <CardDescription>
            Get your detailed 5-year career roadmap for <span className="font-semibold text-primary">{roadmapGenData.careerSuggestion}</span>, tailored for {roadmapGenData.country}.
            <br/>This includes personal insights and localized salary information.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-2">Report Fee: <span className="font-bold text-2xl">₹99</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            Proceed with UPI payment to unlock your comprehensive report. It includes personal details, astrological & numerological insights, year-by-year guidance, expected salary ranges (localized for {roadmapGenData.country} with currency), and suggested courses.
            You'll be able to download it as a PDF.
          </p>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Button onClick={handlePayment} className="w-full text-lg py-6">
              <RadioTower className="mr-2 h-5 w-5" />
              Pay ₹99 via UPI & Generate Roadmap
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
