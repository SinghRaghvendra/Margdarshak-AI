
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CheckCircle, ShieldCheck, Star, Sparkles, Award } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Corrected type definition
type CareerSuggestion = CareerSuggestionOutput['careers'][number] & {
    score: number;
};

const getMatchTier = (score: number): { label: string; color: string; } => {
    if (score >= 90) return { label: 'Excellent Fit', color: 'bg-green-500' };
    if (score >= 80) return { label: 'Strong Fit', color: 'bg-yellow-500' };
    return { label: 'Moderate Fit', color: 'bg-blue-500' };
};


export default function CareerSuggestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);

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
        
        const userData = userDoc.data();
        let userTraits = userData.userTraits;
        let personalizedAnswers = userData.personalizedAnswers;

        if (!userTraits || !personalizedAnswers) {
            throw new Error("Critical user data for suggestions is missing from the database.");
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
          const suggestionsWithScore = suggestionsOutput.careers.map(c => ({
              ...c,
              score: parseFloat(c.matchScore),
          })).sort((a, b) => b.score - a.score);

          setSuggestions(suggestionsWithScore);
          
          const journeyId = localStorage.getItem('margdarshak_current_journey_id') || `journey_${Date.now()}`;
          const journeyDocRef = doc(db, 'users', currentUser.uid, 'journeys', journeyId);
          await setDoc(journeyDocRef, { allCareerSuggestions: suggestionsWithScore, lastUpdated: new Date() }, { merge: true });

          localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(suggestionsWithScore));

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
    
    localStorage.setItem('margdarshak_selected_career', careerName);
    
    toast({ title: 'Career Selected!', description: `Generating your personalized roadmap for ${careerName}...` });
    router.push('/roadmap');
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
          <LoadingSpinner size={48} />
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Analyzing your profile to find your top career matches...</p>
        </div>
    );
  }

  return (
    <div className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-3">Your Top Career Matches</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Backed by your unique personality, motivations, and working style, these careers offer the highest likelihood of long-term success and satisfaction.
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {suggestions.map((career, index) => {
                      const matchTier = getMatchTier(career.score);
                      return (
                        <Card 
                          key={career.name} 
                          className={cn(
                              "flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-2xl",
                              index === 0 ? "border-primary ring-2 ring-primary scale-105" : "border-border"
                          )}
                        >
                            {index === 0 && (
                                <div className="bg-primary text-primary-foreground text-sm font-bold text-center py-2 rounded-t-xl flex items-center justify-center gap-2">
                                    <Award className="h-5 w-5" /> Best Match
                                </div>
                            )}
                            <CardHeader className="text-center pt-6">
                                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{career.name}</CardTitle>
                                <CardDescription className="font-semibold text-lg text-muted-foreground pt-2">{career.personalityProfile}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-muted-foreground">{matchTier.label}</span>
                                        <span className="text-lg font-bold">{career.matchScore}</span>
                                    </div>
                                    <Progress value={career.score} className={cn("h-3", matchTier.color)} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-md mb-1">Why this fits you:</h4>
                                    <p className="text-sm text-muted-foreground text-left">{career.rationale}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch p-6">
                                <Button 
                                    className="w-full text-lg py-6"
                                    onClick={() => handleSelectCareer(career.name)}
                                >
                                  Generate Report Now!
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                  Includes skills, salary outlook & a 10-year roadmap.
                                </p>
                            </CardFooter>
                        </Card>
                      );
                  })}
                </div>
            )}
        </div>
    </div>
  );
}
