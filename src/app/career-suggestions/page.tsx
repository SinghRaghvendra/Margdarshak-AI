
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, Briefcase, Lightbulb, Loader2, Percent, Sparkles, Milestone } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { suggestCareers, type CareerSuggestionInput, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const storedUserTraits = localStorage.getItem('margdarshak_user_traits');
        const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');

        if (!storedUserTraits || !storedPersonalizedAnswers) {
          toast({ title: 'Missing assessment data', description: 'Redirecting to previous step.', variant: 'destructive' });
          router.replace('/personalized-questions');
          return;
        }
        
        const parsedPersonalizedAnswers = JSON.parse(storedPersonalizedAnswers);
        const input: CareerSuggestionInput = {
          traits: storedUserTraits,
          personalizedAnswers: parsedPersonalizedAnswers,
        };
        
        toast({ title: 'Generating Top 10 Career Suggestions', description: 'Please wait, this may take a moment...' });
        const suggestionsOutput: CareerSuggestionOutput = await suggestCareers(input);
        
        if (suggestionsOutput && suggestionsOutput.careers && suggestionsOutput.careers.length > 0) {
          setAllSuggestions(suggestionsOutput.careers);
          localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify(suggestionsOutput.careers));

          const storedSelections = localStorage.getItem('margdarshak_selected_careers_list');
          if (storedSelections) {
            setSelectedCareers(JSON.parse(storedSelections));
          }
        } else {
          toast({ title: 'Could not generate suggestions', description: 'Please try the previous steps again.', variant: 'destructive'});
          setAllSuggestions([]);
          localStorage.removeItem('margdarshak_all_career_suggestions');
        }
      } catch (error) {
        console.error('Error fetching career suggestions:', error);
        toast({ title: 'Error Generating Suggestions', description: 'Could not generate career suggestions. Please try again.', variant: 'destructive' });
        setAllSuggestions([]);
        localStorage.removeItem('margdarshak_all_career_suggestions');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Prerequisite data checks
    if (localStorage.getItem('margdarshak_payment_successful') !== 'true') {
        toast({ title: 'Payment Required', description: 'Please complete payment to view suggestions.', variant: 'destructive' });
        router.replace('/payment');
        setPageLoading(false);
        return;
    }
    if (!localStorage.getItem('margdarshak_user_info')) {
        toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        setPageLoading(false);
        return;
    }
    const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');
    if (!storedPersonalizedAnswers) {
        toast({ title: 'Personalized answers missing', description: 'Redirecting.', variant: 'destructive' });
        router.replace('/personalized-questions');
        setPageLoading(false);
        return;
    }

    setPageLoading(false);
    fetchSuggestions();

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

  const handleProceedToRoadmap = () => {
    if (selectedCareers.length !== MAX_SELECTIONS) {
      toast({ title: `Please select ${MAX_SELECTIONS} careers`, description: `You have selected ${selectedCareers.length}.`, variant: 'destructive'});
      return;
    }
    try {
      localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify(selectedCareers));
      toast({ title: 'Selections Saved', description: 'Proceeding to your detailed reports.' });
      router.push('/roadmap');
    } catch (error) {
      toast({ title: 'Error saving selection', description: 'Could not save your selections. Please try again.', variant: 'destructive'});
    }
  };

  if (pageLoading) {
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
          <p className="ml-4 mt-4 text-lg text-muted-foreground">Generating your top 10 suggestions...</p>
        </div>
      )}

      {!isLoading && (!allSuggestions || allSuggestions.length === 0) && (
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold mb-4">No Career Suggestions Available</h1>
          <p className="text-muted-foreground mb-6">We couldn't generate career suggestions. You can try adjusting your answers.</p>
          <Button onClick={() => router.push('/personalized-questions')}>Review Answers</Button>
        </div>
      )}

      {!isLoading && allSuggestions && allSuggestions.length > 0 && (
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
              onClick={handleProceedToRoadmap} 
              className="text-lg py-6 px-10"
              disabled={selectedCareers.length !== MAX_SELECTIONS}
            >
              Continue to Detailed Roadmaps <Milestone className="ml-2 h-5 w-5" />
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
