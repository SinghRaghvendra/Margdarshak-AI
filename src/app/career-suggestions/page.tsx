'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, Briefcase, Lightbulb, Loader2, Percent, Sparkles, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';


interface CareerSuggestion {
  name: string;
  matchScore: string;
  personalityProfile: string;
  rationale: string;
}

const MAX_SELECTIONS = 3;

export default function CareerSuggestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allSuggestions, setAllSuggestions] = useState<CareerSuggestion[] | null>(null);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            // Prerequisite checks and fetching suggestions
            // This entire block is now inside the auth state observer
            const prerequisites = [
              'margdarshak_user_info',
              'margdarshak_birth_details',
              'margdarshak_user_traits',
              'margdarshak_personalized_answers'
            ];
            const missing = prerequisites.find(key => !localStorage.getItem(key));
            if (missing) {
              toast({ title: 'Prerequisite data missing', description: `Redirecting, as ${missing.replace('margdarshak_','')} is not found.`, variant: 'destructive' });
              let redirectPath = '/signup';
              if (missing.includes('birth_details')) redirectPath = '/birth-details';
              if (missing.includes('user_traits')) redirectPath = '/psychometric-test';
              if (missing.includes('personalized_answers')) redirectPath = '/personalized-questions';
              router.replace(redirectPath);
              return;
            }
            setPageLoading(false);
            fetchSuggestions();
        } else {
            toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
            router.replace('/login');
        }
    });

    // We define fetchSuggestions inside useEffect or useCallback to include it in dependency array if it depended on props/state
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setGenerationError(null);
      try {
        const storedUserTraits = localStorage.getItem('margdarshak_user_traits');
        const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');
        
        // These should exist due to checks above, but good practice to double check
        if (!storedUserTraits || !storedPersonalizedAnswers) return;
        
        const parsedPersonalizedAnswers = JSON.parse(storedPersonalizedAnswers);
        const input: CareerSuggestionInput = {
          traits: storedUserTraits,
          personalizedAnswers: parsedPersonalizedAnswers,
        };
        
        toast({ title: 'Generating Top Career Suggestions', description: 'Please wait, this may take a moment...' });
        const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);
        
        if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length >= MAX_SELECTIONS) {
          setAllSuggestions(suggestionsOutput.careers);
          localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(suggestionsOutput.careers));

          const storedSelections = localStorage.getItem('margdarshak_selected_careers_list');
          if (storedSelections) {
            setSelectedCareers(JSON.parse(storedSelections));
          }
        } else {
          setGenerationError(`The AI could not generate enough distinct career suggestions based on your answers. For better results, please go back and provide more detailed responses to the personalized questions.`);
          setAllSuggestions([]);
          localStorage.removeItem('margdarshak_all_career_suggestions');
        }
      } catch (error) {
        console.error('Error fetching career suggestions:', error);
        toast({ title: 'Error Generating Suggestions', description: 'Could not generate career suggestions. Please try again.', variant: 'destructive' });
        setGenerationError('An unexpected error occurred while generating suggestions. Please try the previous steps again.');
        setAllSuggestions([]);
        localStorage.removeItem('margdarshak_all_career_suggestions');
      } finally {
        setIsLoading(false);
      }
    };
    
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, toast]);

  const handleSelectCareer = (careerName: string) => {
    setSelectedCareers(prev => {
      const isSelected = prev.includes(careerName);
      if (isSelected) {
        return prev.filter(name => name !== careerName);
      } else {
        if (prev.length < MAX_SELECTIONS) {
          return [...prev, careerName];
        } else {
          toast({
            title: `Maximum ${MAX_SELECTIONS} selections allowed`,
            description: 'Please unselect one to choose another.',
            variant: 'default'
          });
          return prev;
        }
      }
    });
  };

  const handleProceedToPayment = async () => {
    if (selectedCareers.length !== MAX_SELECTIONS) {
      toast({ title: `Please select ${MAX_SELECTIONS} careers`, description: `You have selected ${selectedCareers.length}.`, variant: 'destructive'});
      return;
    }
    if (!user) {
      toast({ title: 'User not logged in', description: 'Cannot save selections.', variant: 'destructive' });
      return;
    }
    try {
      // Save to both localStorage and Firestore
      localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify(selectedCareers));

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
          selectedCareersList: selectedCareers,
          paymentSuccessful: false // Explicitly set payment status to false
      }, { merge: true });

      // Clear subsequent local data
      localStorage.removeItem('margdarshak_payment_successful');
      localStorage.removeItem('margdarshak_selected_career');
      localStorage.removeItem('margdarshak_career_insights_astro');
      localStorage.removeItem('margdarshak_career_insights_numero');
      
      toast({ title: 'Selections Saved', description: 'Proceeding to payment for your detailed reports.' });
      router.push('/payment');
    } catch (error) {
      toast({ title: 'Error saving selection', description: 'Could not save your selections. Please try again.', variant: 'destructive'});
      console.error("Error saving career selections:", error);
    }
  };

  if (pageLoading || !user) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-3">Your Top Career Suggestions</h1>
        <p className="text-xl text-muted-foreground">Based on your test and answers, here are some career paths that might suit you.</p>
        <p className="text-md text-primary mt-2">Please select your top 3 choices to generate detailed reports.</p>
      </div>
      
      {isLoading && (
        <div className="flex flex-col justify-center items-center min-h-[20rem]">
          <LoadingSpinner size={48} />
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Generating your top career suggestions...</p>
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

      {!isLoading && !generationError && allSuggestions && allSuggestions.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSuggestions.map((career, index) => (
              <Card key={index} className={`flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 ${selectedCareers.includes(career.name) ? 'ring-2 ring-primary border-primary' : 'border-border'}`}>
                <CardHeader className="items-center text-center pb-3">
                  <div className="flex justify-between items-start w-full mb-2">
                    <CardTitle className="text-xl leading-tight text-left flex-1">{career.name}</CardTitle>
                    <div className="flex items-center text-primary font-bold ml-2">
                       <Percent className="h-5 w-5 mr-1" /> 
                       <span className="text-lg">{career.matchScore.replace('%','')}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-accent/30 rounded-full mb-2 self-center">
                    <Briefcase className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <CardDescription className="text-xs text-muted-foreground min-h-[2.5em]">
                    <Sparkles className="h-3 w-3 inline-block mr-1 text-primary/80" />
                    {career.personalityProfile}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <p className="text-center text-xs text-foreground/80 mb-3 min-h-[3em]">
                    <span className="font-semibold">Rationale:</span> {career.rationale}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Label
                    htmlFor={`career-${index}`}
                    className={`w-full flex items-center justify-center p-3 rounded-md border cursor-pointer transition-colors
                                ${selectedCareers.includes(career.name) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'}`}
                  >
                    <Checkbox
                      id={`career-${index}`}
                      checked={selectedCareers.includes(career.name)}
                      onCheckedChange={() => handleSelectCareer(career.name)}
                      className="mr-2 border-background data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                      disabled={!selectedCareers.includes(career.name) && selectedCareers.length >= MAX_SELECTIONS}
                    />
                    {selectedCareers.includes(career.name) ? 'Selected' : 'Select this Career'}
                  </Label>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button 
              onClick={handleProceedToPayment} 
              className="text-lg py-6 px-10"
              disabled={selectedCareers.length !== MAX_SELECTIONS}
            >
              Proceed with {selectedCareers.length} of {MAX_SELECTIONS} selections <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {selectedCareers.length !== MAX_SELECTIONS && (
                 <p className="text-sm text-muted-foreground mt-2">Please select exactly {MAX_SELECTIONS} careers to continue.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
