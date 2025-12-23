
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CheckCircle, ShieldCheck, Star, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  const { user } = useUser();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CareerSuggestionOutput['careers']>([]);

  useEffect(() => {
    if (!user || !db) return;

    const checkPaymentAndGenerate = async (currentUser: User) => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data()?.paymentSuccessful) {
          toast({ title: 'Payment Required', description: 'Please select a plan to generate career suggestions.', variant: 'destructive'});
          router.replace('/pricing');
          return;
        }
        
        // Payment is confirmed. Now, safely get data and generate suggestions.
        const userData = userDoc.data();
        let userTraits = userData.userTraits;
        let personalizedAnswers = userData.personalizedAnswers;

        // Fallback to local storage only if DB data is somehow missing (which it shouldn't be)
        if (!userTraits || !personalizedAnswers) {
            const userTraitsString = localStorage.getItem('margdarshak_user_traits');
            const personalizedAnswersString = localStorage.getItem('margdarshak_personalized_answers');
            if (isValidJSONObject(userTraitsString) && isValidJSONObject(personalizedAnswersString)) {
                userTraits = JSON.parse(userTraitsString);
                personalizedAnswers = JSON.parse(personalizedAnswersString);
            } else {
                 throw new Error("Critical user data for suggestions is missing from both database and local storage.");
            }
        }
        
        const input: CareerSuggestionInput = {
            traits: userTraits,
            personalizedAnswers: personalizedAnswers,
        };
        
        await fetchTopCareers(currentUser, input);

      } catch (error: any) {
        toast({ title: 'Error Loading Page', description: error.message, variant: 'destructive' });
        setGenerationError(`An error occurred: ${error.message}`);
        setIsLoading(false);
      }
    };

    checkPaymentAndGenerate(user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db, router, toast]);


  const fetchTopCareers = async (currentUser: User, input: CareerSuggestionInput) => {
    setIsLoading(true);
    setGenerationError(null);
    
    try {
        const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);
  
        if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length > 0) {
          const sortedSuggestions = suggestionsOutput.careers.sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore));
          setSuggestions(sortedSuggestions);
          
          const journeyId = localStorage.getItem('margdarshak_current_journey_id') || `journey_${Date.now()}`;
          const journeyDocRef = doc(db, 'users', currentUser.uid, 'journeys', journeyId);
          await setDoc(journeyDocRef, { allCareerSuggestions: sortedSuggestions, lastUpdated: new Date() }, { merge: true });

          // Also save to local storage for the next step.
          localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(sortedSuggestions));

        } else {
          setGenerationError('The AI could not generate any career suggestions. Please try again.');
        }
      } catch (error: any) {
        toast({ title: 'Error Getting Suggestions', description: error.message, variant: 'destructive' });
        setGenerationError(`An error occurred: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
  };

  const handleSelectCareer = (careerName: string) => {
    if (!suggestions.length) return;
    
    // We already saved all suggestions to local storage when they were fetched.
    localStorage.setItem('margdarshak_selected_career', careerName);
    
    toast({ title: 'Career Selected!', description: `Generating report for ${careerName}...` });
    router.push('/roadmap');
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
          <LoadingSpinner size={48} />
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Finalizing your top career matches...</p>
        </div>
    );
  }

  return (
    <div className="py-8">
        <div className="text-center mb-8">
            <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-3">Your Top Career Matches</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Based on your unique profile, here are the top 3 careers where you have the highest potential to succeed. Select one to generate your detailed report.
            </p>
        </div>

        {generationError && (
             <div className="max-w-2xl mx-auto">
                <Alert variant="destructive">
                    <AlertTitle>Suggestion Generation Failed</AlertTitle>
                    <AlertDescription>{generationError}</AlertDescription>
                </Alert>
             </div>
        )}
      
        {!generationError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {suggestions.map((career) => (
                <Card 
                  key={career.name} 
                  className="flex flex-col shadow-lg hover:shadow-2xl hover:border-primary transition-all duration-300 cursor-pointer group"
                  onClick={() => handleSelectCareer(career.name)}
                >
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{career.name}</CardTitle>
                        <CardDescription className="font-semibold text-primary">{career.matchScore} Match</CardDescription>
                         <p className="text-sm text-muted-foreground pt-2">{career.personalityProfile}</p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground text-center italic">"{career.rationale}"</p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full text-lg py-6"
                        >
                          Select & Generate Report
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
        )}
    </div>
  );
}
