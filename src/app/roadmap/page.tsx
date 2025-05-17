'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinned, Milestone } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

// Helper to format roadmap text
const prompt = ai.definePrompt({
      name: 'generateRoadmapPrompt',
      input: {schema: GenerateRoadmapInputSchema}, // Assuming you add a country field to this schema
      output: {schema: GenerateRoadmapOutputSchema},
      prompt: `You are an expert career counselor. Generate a detailed 5-year career roadmap for the following career suggestion, considering the user traits and focusing on career prospects and salary expectations in the user's country. Include expected salary and suggested courses for each year.\n\nCareer Suggestion: {{{careerSuggestion}}}\nUser Traits: {{{userTraits}}}\nCountry: {{{country}}}`, // Added Country field
    });


const formatRoadmapText = (text: string) => {
  return text.split('\n').map((paragraph, index) => {
    if (paragraph.startsWith('Year ') || paragraph.startsWith('## Year')) {
      return (
        <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-primary">
          {paragraph.replace('## ', '')}
        </h3>
      );
    }
    if (paragraph.startsWith('### ')) {
       return (
        <h4 key={index} className="text-lg font-medium mt-3 mb-1 text-accent-foreground">
          {paragraph.replace('### ', '')}
        </h4>
      );
    }
    if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
      return (
        <li key={index} className="ml-4 list-disc text-muted-foreground">
          {paragraph.substring(2)}
        </li>
      );
    }
    return (
      <p key={index} className="mb-2 text-foreground/90">
        {paragraph}
      </p>
    );
  });
};


export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRoadmap = localStorage.getItem('margdarshak_roadmap');
      const career = localStorage.getItem('margdarshak_selected_career');

      if (storedRoadmap && career) {
        setRoadmap(storedRoadmap);
        setSelectedCareer(career);
      } else {
        toast({ title: 'Roadmap not found', description: 'Redirecting to payment.', variant: 'destructive'});
        router.replace(career ? '/payment' : '/career-suggestions');
      }
    } catch (error) {
       toast({ title: 'Error loading roadmap', description: 'Please try generating it again.', variant: 'destructive'});
       router.replace('/payment');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!roadmap || !selectedCareer) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Roadmap Not Available</h1>
        <p className="text-muted-foreground mb-6">We couldn't find your career roadmap.</p>
        <Button onClick={() => router.push('/payment')}>Generate Roadmap</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your 5-Year Career Roadmap</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Path to success as a <span className="font-semibold text-primary">{selectedCareer}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
          {formatRoadmapText(roadmap)}
        </CardContent>
         <CardContent className="mt-6 text-center">
            <Button onClick={() => router.push('/signup')} variant="outline">
              <Milestone className="mr-2 h-5 w-5" />
              Start a New Journey
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
