
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { ArrowRight, Briefcase, Lightbulb, Loader2, Percent, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { collection, query, where, getDocs, setDoc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';


interface CareerSuggestion {
  name: string;
  matchScore: string;
  personalityProfile: string;
  rationale: string;
}

// Helper to check if a string is a valid JSON object
function isValidJSONObject(str: string): boolean {
  if (!str) return false;
  try {
    const obj = JSON.parse(str);
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  } catch (e) {
    return false;
  }
}

export default function CareerSuggestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [allSuggestions, setAllSuggestions] = useState<CareerSuggestion[] | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPaidSuggestions, setShowPaidSuggestions] = useState(false);

  // Memoize sorted suggestions
  const sortedSuggestions = allSuggestions
    ? [...allSuggestions].sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore))
    : [];

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            fetchSuggestions();
        } else {
            toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
            router.replace('/login');
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);
  
  const fetchSuggestions = async () => {
    setIsLoading(true);
    setGenerationError(null);
    try {
      const userTraitsString = localStorage.getItem('margdarshak_user_traits');
      const personalizedAnswersString = localStorage.getItem('margdarshak_personalized_answers');

      if (!isValidJSONObject(userTraitsString)) {
          toast({ title: 'Outdated or Missing Test Data', description: 'Your psychometric test data is missing or in an old format. Please retake the test to continue.', variant: 'destructive', duration: 8000 });
          router.push('/psychometric-test');
          return;
      }

      if (!isValidJSONObject(personalizedAnswersString)) {
          toast({ title: 'Incomplete Information', description: 'Please complete the personalized questions first.', variant: 'destructive', duration: 6000 });
          router.push('/personalized-questions');
          return;
      }
      
      const input: CareerSuggestionInput = {
        traits: JSON.parse(userTraitsString),
        personalizedAnswers: JSON.parse(personalizedAnswersString),
      };

      toast({ title: 'Generating Your Career Matches', description: 'This may take a few moments. Please wait...' });
      const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);

      if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length > 0) {
        setAllSuggestions(suggestionsOutput.careers);
        localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(suggestionsOutput.careers));
      } else {
        setGenerationError('The AI could not generate any career suggestions at this time. This may be due to a temporary issue or specific safety filters being triggered by your answers. Please try adjusting your answers or try again later.');
        setAllSuggestions([]);
      }
    } catch (error: any) {
      console.error('Error fetching career suggestions:', error);
      toast({ title: 'Error Generating Suggestions', description: error.message || 'An unexpected error occurred.', variant: 'destructive', duration: 7000 });
      setGenerationError(`An unexpected error occurred while generating suggestions: ${error.message}`);
      setAllSuggestions([]);
    } finally {
      setIsLoading(false);
      setPageLoading(false);
    }
  };

  const handleSelectCareer = (careerName: string) => {
    setSelectedCareer(careerName);
  };

  const handleProceed = async () => {
    if (!selectedCareer) {
        toast({ title: `Please select a career`, description: `You must select one option to continue.`, variant: 'destructive'});
        return;
    }
    if (!user || !db) {
      toast({ title: 'User not logged in', description: 'Cannot save selections.', variant: 'destructive' });
      return;
    }

    try {
      localStorage.setItem('margdarshak_selected_career', selectedCareer);

      const reportsQuery = query(
          collection(db, 'generatedReports'),
          where('userId', '==', user.uid),
          where('careerName', '==', selectedCareer)
      );
      const reportSnapshot = await getDocs(reportsQuery);

      if (!reportSnapshot.empty) {
          toast({ title: 'Report Found', description: 'Redirecting to your previously generated report.' });
          router.push('/roadmap');
          return;
      }
      
      // If report doesn't exist, user MUST pay to generate a new one.
      toast({ title: 'New Report Required', description: 'Proceeding to payment to unlock this report.' });
      router.push('/payment');

    } catch (error) {
      toast({ title: 'Error processing selection', description: 'Could not proceed. Please try again.', variant: 'destructive'});
      console.error("Error during proceed action:", error);
    }
  };
  
  const renderCareerCard = (career: CareerSuggestion, index: number) => (
    <div key={index} className="h-full">
      <Label htmlFor={`career-${index}`} className="h-full cursor-pointer">
        <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full ${selectedCareer === career.name ? 'ring-2 ring-primary border-primary' : 'border-border'}`}>
            <CardHeader className="flex-row items-start justify-between gap-4 p-4 bg-card-foreground/5">
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-xl leading-tight">{career.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground flex items-center">
                        <Sparkles className="h-3 w-3 inline-block mr-1 text-primary/80" />
                        {career.personalityProfile}
                    </CardDescription>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent text-accent-foreground p-2">
                        <ShieldCheck className="h-5 w-5 mr-1"/>
                        <span className="text-lg font-bold">{parseFloat(career.matchScore).toFixed(2)}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                 <p className="text-sm text-foreground/80">
                    <span className="font-semibold">Rationale:</span> {career.rationale}
                </p>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50">
                 <div className="flex items-center space-x-2 w-full justify-center">
                    <RadioGroupItem value={career.name} id={`career-${index}`} />
                    <Label htmlFor={`career-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Select this Career
                    </Label>
                </div>
            </CardFooter>
        </Card>
      </Label>
    </div>
  );


  if (pageLoading || !user) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="py-8">
       <div className="text-center mb-8">
            <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-3">Your Top Career Matches</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Based on your test, here are your top 3 career matches. Select one and pay a one-time fee to unlock a detailed report.</p>
        </div>
      
      {isLoading && (
        <div className="flex flex-col justify-center items-center min-h-[20rem]">
          <LoadingSpinner size={48} />
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Generating your career suggestions...</p>
        </div>
      )}

      {!isLoading && generationError && (
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Suggestion Generation Failed</AlertTitle>
            <AlertDescription className="mb-4">
              {generationError}
            </AlertDescription>
            <Button onClick={() => router.push('/personalized-questions')} variant="secondary">
              Review Your Answers
            </Button>
          </Alert>
        </div>
      )}

      {!isLoading && !generationError && sortedSuggestions.length > 0 && (
          <RadioGroup value={selectedCareer || ''} onValueChange={handleSelectCareer}>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-2xl mx-auto">
              {sortedSuggestions.slice(0, 3).map((career, index) =>
                renderCareerCard(career, index)
              )}
            </div>
          </RadioGroup>
      )}

      {!isLoading && !generationError && sortedSuggestions.length > 0 && (
          <div className="mt-10 text-center">
            <Button 
              onClick={handleProceed} 
              className="text-lg py-6 px-10"
              disabled={!selectedCareer}
            >
              Proceed to Payment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!selectedCareer && (
                 <p className="text-sm text-muted-foreground mt-2">Please select one career to continue.</p>
            )}
          </div>
      )}
    </div>
  );
}
