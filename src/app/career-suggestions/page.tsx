'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CheckCircle, ShieldCheck, Star } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const plans = [
    {
        id: 'verdict',
        title: 'Career Verdict',
        price: 49,
        originalPrice: 99,
        description: 'Get your single best career match and a concise explanation of why it fits you.',
        features: [
            'Top Career Recommendation',
            'Personalized Match Score',
            'Concise Career Fit Assessment (2-3 paragraphs)',
            'Personality Alignment Summary'
        ],
        cta: 'Get Your Verdict',
    },
    {
        id: 'clarity',
        title: 'Career Clarity Report',
        price: 99,
        originalPrice: 199,
        isPopular: true,
        description: 'Understand your options with a deep dive into your top 3 matches and personality.',
        features: [
            'Everything in Career Verdict',
            'Top 3 Career Recommendations',
            'In-depth Personality & Strengths Analysis',
            'Astrological & Numerological Insights',
            'General Career Demand Outlook'
        ],
        cta: 'Get Clarity Report',
    },
    {
        id: 'blueprint',
        title: 'Complete Career Blueprint',
        price: 199,
        originalPrice: 399,
        description: 'The ultimate guide. A full 10-year, step-by-step plan to achieve your top career choice.',
        features: [
            'Everything in Career Clarity Report',
            'Detailed 10-Year Career Roadmap',
            'Year-by-Year Role & Salary Progression',
            'Specific Education & Skills Path',
            '20-Year Future Trends & Outlook'
        ],
        cta: 'Get Full Blueprint',
    }
];

function isValidJSONObject(str: string): boolean {
  if (!str) return false;
  try {
    const obj = JSON.parse(str);
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  } catch (e) {
    return false;
  }
}

export default function PlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [topCareerName, setTopCareerName] = useState<string>('Your Top Career');
  
  // Timer state
  const OFFER_DURATION = 60 * 1000; // 60 seconds
  const [timeLeft, setTimeLeft] = useState(OFFER_DURATION);
  const offerEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            fetchTopCareer(currentUser);
        } else {
            toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
            router.replace('/login');
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    const storedEndTime = localStorage.getItem('margdarshak_offer_end_time');
    if (storedEndTime) {
      offerEndTimeRef.current = Number(storedEndTime);
    } else {
      const newEndTime = Date.now() + OFFER_DURATION;
      offerEndTimeRef.current = newEndTime;
      localStorage.setItem('margdarshak_offer_end_time', String(newEndTime));
    }

    const interval = setInterval(() => {
      const remaining = (offerEndTimeRef.current ?? 0) - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const fetchTopCareer = async (currentUser: User) => {
    setIsLoading(true);
    setGenerationError(null);
    
    // This is the only AI call made before payment, just to get the names of the careers.
    try {
        const userTraitsString = localStorage.getItem('margdarshak_user_traits');
        const personalizedAnswersString = localStorage.getItem('margdarshak_personalized_answers');
  
        if (!isValidJSONObject(userTraitsString) || !isValidJSONObject(personalizedAnswersString)) {
            toast({ title: 'Incomplete Journey', description: 'Some of your data is missing. Redirecting...', variant: 'destructive' });
            router.push('/personalized-questions');
            return;
        }
        
        const input: CareerSuggestionInput = {
          traits: JSON.parse(userTraitsString),
          personalizedAnswers: JSON.parse(personalizedAnswersString),
        };
  
        const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);
  
        if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length > 0) {
          const topCareer = suggestionsOutput.careers.sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore))[0];
          setTopCareerName(topCareer.name);
          
          // Save suggestions to Firestore to avoid re-generating them later.
          if (db) {
            const journeyId = localStorage.getItem('margdarshak_current_journey_id') || `journey_${Date.now()}`;
            const journeyDocRef = doc(db, 'users', currentUser.uid, 'journeys', journeyId);
            await setDoc(journeyDocRef, { allCareerSuggestions: suggestionsOutput.careers, lastUpdated: new Date() }, { merge: true });
          }

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

  const handleSelectPlan = (planId: string, price: number) => {
    localStorage.setItem('margdarshak_selected_plan', JSON.stringify({ id: planId, price: price }));
    router.push('/payment');
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const isOfferActive = timeLeft > 0;

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
          <LoadingSpinner size={48} />
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Analyzing your profile to find your top career matches...</p>
        </div>
    );
  }

  return (
    <div className="py-8">
        <div className="text-center mb-8">
            <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-3">Your Personalized Career Plans</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Based on your profile, your top career match appears to be <strong className="text-primary">{topCareerName}</strong>.
                Choose a plan below to unlock your detailed report.
            </p>
        </div>

        {isOfferActive && (
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-primary/10 border border-primary rounded-lg text-center">
                <h2 className="text-2xl font-bold text-primary">Special Launch Offer!</h2>
                <p className="text-muted-foreground">The prices below are valid for a limited time.</p>
                <div className="text-4xl font-bold text-destructive mt-2">{formatTime(timeLeft)}</div>
                <p className="text-sm text-destructive">Offer expires in...</p>
            </div>
        )}

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
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 ${plan.isPopular ? 'border-primary ring-2 ring-primary' : ''}`}
                >
                    {plan.isPopular && <div className="bg-primary text-primary-foreground text-sm font-bold text-center py-1 rounded-t-lg flex items-center justify-center"><Star className="h-4 w-4 mr-1"/> Most Popular</div>}
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="flex items-baseline justify-center gap-2 mt-4">
                            <span className={`text-4xl font-extrabold ${!isOfferActive ? 'text-muted-foreground' : ''}`}>
                                ₹{isOfferActive ? plan.price : plan.originalPrice}
                            </span>
                            {isOfferActive && <span className="text-xl font-medium text-muted-foreground line-through">₹{plan.originalPrice}</span>}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full text-lg py-6"
                            onClick={() => handleSelectPlan(plan.id, isOfferActive ? plan.price : plan.originalPrice)}
                            variant={plan.isPopular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                        </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>
        )}
    </div>
  );
}
