
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Lightbulb, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';

interface CareerSuggestion {
  name: string;
  rationale: string;
}

export default function CareerSuggestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CareerSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true); // For initial data checks

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const storedUserTraits = localStorage.getItem('margdarshak_user_traits');
        const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');

        if (!storedUserTraits) {
          toast({ title: 'Psychometric test data not found', description: 'Redirecting to psychometric test.', variant: 'destructive' });
          router.replace('/psychometric-test');
          return;
        }
        if (!storedPersonalizedAnswers) {
          toast({ title: 'Personalized answers not found', description: 'Redirecting to provide answers.', variant: 'destructive' });
          router.replace('/personalized-questions');
          return;
        }
        
        const parsedPersonalizedAnswers = JSON.parse(storedPersonalizedAnswers);

        const input: CareerSuggestionInput = {
          traits: storedUserTraits,
          personalizedAnswers: parsedPersonalizedAnswers,
        };
        
        toast({ title: 'Generating Career Suggestions', description: 'Please wait, this may take a moment...' });
        const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);
        
        if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length > 0) {
          setSuggestions(suggestionsOutput.careers);
          localStorage.setItem('margdarshak_career_suggestions', JSON.stringify(suggestionsOutput.careers));
        } else {
          toast({ title: 'Could not generate suggestions', description: 'Please try the previous steps again.', variant: 'destructive'});
          setSuggestions([]); // Set to empty array to show "No suggestions" message
        }
      } catch (error) {
        console.error('Error fetching career suggestions:', error);
        toast({ title: 'Error Generating Suggestions', description: 'Could not generate career suggestions. Please try again.', variant: 'destructive' });
        setSuggestions([]); // Set to empty array
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check prerequisite data before fetching suggestions
    const storedUserTraits = localStorage.getItem('margdarshak_user_traits');
    const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');

    if (!localStorage.getItem('margdarshak_user_info')) {
        toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        setPageLoading(false);
        return;
    }
    if (!localStorage.getItem('margdarshak_birth_details')) {
        toast({ title: 'Birth details missing', description: 'Redirecting to provide birth details.', variant: 'destructive' });
        router.replace('/birth-details');
        setPageLoading(false);
        return;
    }
    if (!storedUserTraits) {
        toast({ title: 'Psychometric test data missing', description: 'Redirecting to psychometric test.', variant: 'destructive' });
        router.replace('/psychometric-test');
        setPageLoading(false);
        return;
    }
    if (!storedPersonalizedAnswers) {
        toast({ title: 'Personalized answers missing', description: 'Redirecting to personalized questions.', variant: 'destructive' });
        router.replace('/personalized-questions');
        setPageLoading(false);
        return;
    }

    setPageLoading(false); // All checks passed, proceed to fetch suggestions
    fetchSuggestions();

  }, [router, toast]);

  const handleSelectCareer = (careerName: string) => {
    try {
      localStorage.setItem('margdarshak_selected_career', careerName);
      toast({ title: `Selected: ${careerName}`, description: 'Proceed to get personalized insights.' });
      router.push('/career-insights');
    } catch (error) {
      toast({ title: 'Error selecting career', description: 'Could not save your selection. Please try again.', variant: 'destructive'});
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-3">Your Career Suggestions</h1>
        <p className="text-xl text-muted-foreground">Based on your test and answers, here are some career paths that might suit you.</p>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center min-h-[20rem]">
          <LoadingSpinner size={48} />
          <p className="ml-4 text-lg text-muted-foreground">Generating your suggestions...</p>
        </div>
      )}

      {!isLoading && (!suggestions || suggestions.length === 0) && (
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold mb-4">No Career Suggestions Available</h1>
          <p className="text-muted-foreground mb-6">We couldn't generate career suggestions for you at this time. You can try adjusting your answers.</p>
          <Button onClick={() => router.push('/personalized-questions')}>Review Answers</Button>
        </div>
      )}

      {!isLoading && suggestions && suggestions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8">
          {suggestions.map((career, index) => (
            <Card key={index} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-accent/30 rounded-full mb-3">
                  <Briefcase className="h-10 w-10 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">{career.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-center text-sm">
                  <span className="font-semibold text-foreground/80">Why this might be a fit:</span> {career.rationale}
                </CardDescription>
                 <p className="text-center text-xs text-muted-foreground mt-3">
                  Explore personalized astrological/numerological insights and a detailed 5-year roadmap for this career.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSelectCareer(career.name)} className="w-full text-md py-5">
                  Get Personalized Insights
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

