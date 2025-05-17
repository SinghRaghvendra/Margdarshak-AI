
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wand2, ArrowRight, Loader2, UserCircle, CalendarDays, MapPin, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateCareerInsights, type CareerInsightsInput, type CareerInsightsOutput } from '@/ai/flows/career-insights-flow';
import { format, parseISO } from 'date-fns';

interface StoredBirthData {
  dateOfBirth: string; // "YYYY-MM-DD"
  placeOfBirth: string;
  timeOfBirth: string;
}

export default function CareerInsightsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [birthDetails, setBirthDetails] = useState<StoredBirthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [insights, setInsights] = useState<CareerInsightsOutput | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadDataAndFetchInsights = async () => {
      let career: string | null = null;
      let storedBd: StoredBirthData | null = null;
      let userInfo: { name?: string } | null = null;

      try {
        const storedUserInfo = localStorage.getItem('margdarshak_user_info');
         if (storedUserInfo) {
          userInfo = JSON.parse(storedUserInfo);
          setUserName(userInfo?.name || 'Guest');
        } else {
          toast({ title: 'User info not found', description: 'Redirecting to signup.', variant: 'destructive' });
          router.replace('/signup');
          return;
        }

        career = localStorage.getItem('margdarshak_selected_career');
        if (!career) {
          toast({ title: 'No career selected', description: 'Redirecting to choose a career.', variant: 'destructive' });
          router.replace('/career-suggestions');
          return;
        }
        setSelectedCareer(career);

        const rawBirthDetails = localStorage.getItem('margdarshak_birth_details');
        if (rawBirthDetails) {
          storedBd = JSON.parse(rawBirthDetails) as StoredBirthData;
          setBirthDetails(storedBd);
        } else {
          toast({ title: 'Birth details not found', description: 'Please provide your birth details first.', variant: 'destructive' });
          router.replace('/birth-details');
          return;
        }

        // Automatically fetch insights if all data is present
        if (career && storedBd) {
          setIsLoading(true);
          setInsights(null); // Clear previous insights
          // Clear localStorage for insights before fetching new ones
          localStorage.removeItem('margdarshak_career_insights_astro');
          localStorage.removeItem('margdarshak_career_insights_numero');

          toast({ title: 'Generating Insights', description: 'Please wait while we prepare your personalized insights...' });
          
          const inputForAI: CareerInsightsInput = {
            selectedCareer: career,
            dateOfBirth: storedBd.dateOfBirth, // Already in YYYY-MM-DD
            placeOfBirth: storedBd.placeOfBirth,
            timeOfBirth: storedBd.timeOfBirth,
          };

          try {
            const result = await generateCareerInsights(inputForAI);
            setInsights(result);
            // Save insights to localStorage
            localStorage.setItem('margdarshak_career_insights_astro', result.astrologicalReview);
            localStorage.setItem('margdarshak_career_insights_numero', result.numerologicalReview);
            toast({ title: 'Insights Generated!', description: 'Review your astrological and numerological insights below.' });
          } catch (error) {
            console.error('Error generating insights:', error);
            toast({ title: 'Error Generating Insights', description: 'Could not generate insights. Please try again.', variant: 'destructive' });
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        toast({ title: 'Error loading page data', description: 'Please try again.', variant: 'destructive' });
        if (!career) router.replace('/career-suggestions');
        else if (!storedBd) router.replace('/birth-details');
        else router.replace('/signup');
      } finally {
        setPageLoading(false);
      }
    };

    loadDataAndFetchInsights();
  }, [router, toast]);

  const handleProceedToPayment = () => {
    if (!selectedCareer) {
        toast({ title: 'Error', description: 'Selected career is missing.', variant: 'destructive'});
        return;
    }
    if (!localStorage.getItem('margdarshak_career_insights_astro') || !localStorage.getItem('margdarshak_career_insights_numero')) {
      toast({ title: 'Insights not saved', description: 'Please wait for insights to generate or try again.', variant: 'destructive'});
      return;
    }
    router.push('/payment');
  };
  
  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!selectedCareer || !birthDetails) {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Information Missing</h1>
        <p className="text-muted-foreground mb-6">Required career selection or birth details are not available.</p>
        <Button onClick={() => router.push(!selectedCareer ? '/career-suggestions' : '/birth-details')}>
          {!selectedCareer ? 'Choose Career' : 'Enter Birth Details'}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Personalized Career Insights</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Astrological and numerological perspectives for your chosen path: <span className="font-semibold text-primary">{selectedCareer}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
            <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
                <h3 className="text-lg font-semibold mb-2 flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" />For: {userName}</h3>
                <p className="text-sm text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary/80" />Date of Birth: {birthDetails.dateOfBirth ? format(parseISO(birthDetails.dateOfBirth), 'PPP') : 'N/A'}</p>
                <p className="text-sm text-muted-foreground flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary/80" />Place of Birth: {birthDetails.placeOfBirth}</p>
                <p className="text-sm text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4 text-primary/80" />Time of Birth: {birthDetails.timeOfBirth}</p>
            </div>
          
          {isLoading && !insights && (
            <div className="mt-4 flex flex-col items-center justify-center">
              <LoadingSpinner size={48} />
              <p className="mt-2 text-muted-foreground">Generating your insights...</p>
            </div>
          )}

          {!isLoading && !insights && !pageLoading && ( 
             <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Could not load insights at this time. You can try proceeding or refresh.</p>
             </div>
          )}

          {insights && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-primary flex items-center mb-2"><Sparkles className="mr-2 h-5 w-5" />Astrological Review</h3>
                <ReactMarkdown
                  className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-foreground/90"
                  components={{
                    p: ({node, ...props}) => <p className="mb-3" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                  }}
                >
                  {insights.astrologicalReview}
                </ReactMarkdown>
              </div>
              <hr className="my-4 border-border" />
              <div>
                <h3 className="text-xl font-semibold text-primary flex items-center mb-2"><Wand2 className="mr-2 h-5 w-5" />Numerological Review</h3>
                 <ReactMarkdown
                  className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-foreground/90"
                  components={{
                    p: ({node, ...props}) => <p className="mb-3" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                  }}
                >
                  {insights.numerologicalReview}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
            <Button onClick={handleProceedToPayment} className="text-lg py-5" disabled={isLoading || !insights}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Proceed to Roadmap Payment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
