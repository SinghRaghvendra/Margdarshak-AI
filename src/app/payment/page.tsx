
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioTower } from 'lucide-react'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateRoadmap, type GenerateRoadmapOutput, type GenerateRoadmapInput } from '@/ai/flows/detailed-roadmap';
import { useToast } from '@/hooks/use-toast';
import {differenceInYears, parseISO} from 'date-fns';

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

// Re-define PersonalizedAnswersSchema or ensure it can be imported
// For simplicity here, assuming it's structured as expected by the flow.
// In a real app, this would be imported from a shared types definition.
interface PersonalizedAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}


export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [roadmapGenData, setRoadmapGenData] = useState<GenerateRoadmapInput | null>(null);


  useEffect(() => {
    try {
      const career = localStorage.getItem('margdarshak_selected_career');
      const traits = localStorage.getItem('margdarshak_user_traits');
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      const storedBirthDetails = localStorage.getItem('margdarshak_birth_details');
      const astroReview = localStorage.getItem('margdarshak_career_insights_astro');
      const numeroReview = localStorage.getItem('margdarshak_career_insights_numero');
      const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');

      let userName: string | null = null;
      let userCountry: string | null = null;
      let dateOfBirth: string | null = null;
      let timeOfBirth: string | null = null;
      let placeOfBirth: string | null = null;
      let age: number | null = null;
      let personalizedAnswers: PersonalizedAnswers | null = null;

      if (storedUserInfo) {
        const userInfoParsed: UserInfo = JSON.parse(storedUserInfo);
        userName = userInfoParsed.name;
        userCountry = userInfoParsed.country;
      }
      
      if (storedBirthDetails) {
        const birthDetailsParsed: BirthDetails = JSON.parse(storedBirthDetails);
        dateOfBirth = birthDetailsParsed.dateOfBirth;
        timeOfBirth = birthDetailsParsed.timeOfBirth;
        placeOfBirth = birthDetailsParsed.placeOfBirth;
        if (dateOfBirth) {
            try {
                age = differenceInYears(new Date(), parseISO(dateOfBirth));
            } catch (e) {
                console.error("Error parsing date of birth for age calculation:", e);
                toast({title: "Error", description: "Could not calculate age from birth date.", variant: "destructive"});
                // age remains null, a check later will catch this.
            }
        }
      }

      if (storedPersonalizedAnswers) {
        personalizedAnswers = JSON.parse(storedPersonalizedAnswers);
      }

      if (
        career && 
        traits && 
        userName && 
        userCountry && 
        dateOfBirth && 
        timeOfBirth &&
        placeOfBirth &&
        age !== null &&
        personalizedAnswers &&
        astroReview && 
        numeroReview
        ) {
        setRoadmapGenData({
          careerSuggestion: career,
          userTraits: traits,
          country: userCountry,
          userName: userName,
          dateOfBirth: dateOfBirth,
          timeOfBirth: timeOfBirth,
          placeOfBirth: placeOfBirth,
          age: age,
          personalizedAnswers: personalizedAnswers,
          astrologicalReview: astroReview, // Still passing, AI can reference it
          numerologicalReview: numeroReview, // Still passing, AI can reference it
        });
      } else {
        let missingInfo = [];
        if (!career) missingInfo.push('selected career');
        if (!traits) missingInfo.push('user traits');
        if (!userName) missingInfo.push('user name');
        if (!userCountry) missingInfo.push('user country');
        if (!dateOfBirth) missingInfo.push('date of birth');
        if (!timeOfBirth) missingInfo.push('time of birth');
        if (!placeOfBirth) missingInfo.push('place of birth');
        if (age === null) missingInfo.push('valid age (from DOB)');
        if (!personalizedAnswers) missingInfo.push('personalized answers');
        if (!astroReview) missingInfo.push('astrological review'); // Though new ones will be generated
        if (!numeroReview) missingInfo.push('numerological review'); // Though new ones will be generated
        
        toast({ 
          title: 'Missing Information for Report', 
          description: `The following are missing: ${missingInfo.join(', ')}. Please complete all steps. Redirecting...`, 
          variant: 'destructive',
          duration: 7000,
        });
        
        // Determine redirect based on missing info
        if (!career) router.replace('/career-suggestions');
        else if (!traits) router.replace('/psychometric-test');
        else if (!dateOfBirth || !timeOfBirth || !placeOfBirth || age === null) router.replace('/birth-details');
        else if (!personalizedAnswers) router.replace('/personalized-questions');
        else if (!astroReview || !numeroReview) router.replace('/career-insights');
        else if (!userName || !userCountry) router.replace('/signup');
        else router.replace('/signup'); // Fallback
        return;
      }
    } catch (error) {
      console.error("Error loading data for payment page:", error);
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
        toast({ title: 'Generating Detailed Report', description: 'This may take a moment, please wait...' });
        const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap(roadmapGenData);
        localStorage.setItem('margdarshak_roadmap_markdown', roadmapOutput.roadmapMarkdown);
        toast({ title: 'Payment Successful & Report Generated!', description: 'Proceeding to view your detailed roadmap...' });
        router.push('/roadmap');
      } catch (error) {
        console.error('Error generating roadmap:', error);
        toast({ title: 'Error Generating Roadmap', description: 'Could not generate roadmap. Please try again or contact support.', variant: 'destructive', duration: 7000 });
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
            Get your detailed career report for <span className="font-semibold text-primary">{roadmapGenData.careerSuggestion}</span>, tailored for {roadmapGenData.country}.
            <br/>This includes personal insights, age-specific 10-year roadmap, and localized salary information.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-2">Report Fee: <span className="font-bold text-2xl">₹99</span></p>
          <p className="text-sm text-muted-foreground mb-6">
            Proceed with UPI payment to unlock your comprehensive report. You'll be able to download it as a PDF.
          </p>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Button onClick={handlePayment} className="w-full text-lg py-6">
              <RadioTower className="mr-2 h-5 w-5" />
              Pay ₹99 via UPI & Generate Report
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```