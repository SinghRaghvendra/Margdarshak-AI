
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Lightbulb } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function CareerSuggestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSuggestions = localStorage.getItem('margdarshak_career_suggestions');
      if (storedSuggestions) {
        setSuggestions(JSON.parse(storedSuggestions));
      } else {
        toast({ title: 'No suggestions found', description: 'Redirecting to test.', variant: 'destructive'});
        router.replace('/psychometric-test');
      }
    } catch (error) {
      toast({ title: 'Error loading suggestions', description: 'Please try the test again.', variant: 'destructive'});
      router.replace('/psychometric-test');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleSelectCareer = (career: string) => {
    try {
      localStorage.setItem('margdarshak_selected_career', career);
      toast({ title: `Selected: ${career}`, description: 'Proceed to get personalized insights.' });
      router.push('/career-insights'); // Changed from /payment
    } catch (error) {
      toast({ title: 'Error selecting career', description: 'Could not save your selection. Please try again.', variant: 'destructive'});
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">No Career Suggestions Available</h1>
        <p className="text-muted-foreground mb-6">We couldn't generate career suggestions for you at this time.</p>
        <Button onClick={() => router.push('/psychometric-test')}>Retake Test</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-3">Your Career Suggestions</h1>
        <p className="text-xl text-muted-foreground">Based on your psychometric test, here are some career paths that might suit you.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {suggestions.map((career, index) => (
          <Card key={index} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-accent/30 rounded-full mb-3">
                <Briefcase className="h-10 w-10 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">{career}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center">
                Explore personalized insights and a detailed 5-year roadmap for a career as a {career.toLowerCase()}.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSelectCareer(career)} className="w-full text-md py-5">
                Get Personalized Insights
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
