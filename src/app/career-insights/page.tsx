
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateCareerInsights, type CareerInsightsOutput } from '@/ai/flows/career-insights-flow';

const insightsFormSchema = z.object({
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }),
  placeOfBirth: z.string().min(2, { message: 'Place of birth must be at least 2 characters.' }),
  timeOfBirth: z.string().min(3, { message: 'Time of birth is required (e.g., 10:30 AM or 14:45).' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*(AM|PM))?$/i, { message: 'Invalid time format. Use HH:MM or HH:MM AM/PM.'}),
});

type InsightsFormValues = z.infer<typeof insightsFormSchema>;

interface StoredBirthDetails extends InsightsFormValues {
  dateOfBirth: string; // Store as string in localStorage
}

export default function CareerInsightsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [insights, setInsights] = useState<CareerInsightsOutput | null>(null);

  const form = useForm<InsightsFormValues>({
    resolver: zodResolver(insightsFormSchema),
    defaultValues: {
      placeOfBirth: '',
      timeOfBirth: '',
    },
  });

  useEffect(() => {
    try {
      const career = localStorage.getItem('margdarshak_selected_career');
      if (career) {
        setSelectedCareer(career);
        const storedDetails = localStorage.getItem('margdarshak_birth_details');
        if (storedDetails) {
          const parsedDetails: StoredBirthDetails = JSON.parse(storedDetails);
          form.reset({
            dateOfBirth: new Date(parsedDetails.dateOfBirth),
            placeOfBirth: parsedDetails.placeOfBirth,
            timeOfBirth: parsedDetails.timeOfBirth,
          });
        }
      } else {
        toast({ title: 'No career selected', description: 'Redirecting to suggestions.', variant: 'destructive' });
        router.replace('/career-suggestions');
      }
    } catch (error) {
      toast({ title: 'Error loading data', description: 'Please try again.', variant: 'destructive' });
      router.replace('/career-suggestions');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast, form]);

  async function onSubmit(data: InsightsFormValues) {
    if (!selectedCareer) {
      toast({ title: 'Selected career not found', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setInsights(null); // Clear previous insights
    toast({ title: 'Generating Insights', description: 'Please wait while we prepare your personalized insights...' });

    const birthDetailsToStore: StoredBirthDetails = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    };
    localStorage.setItem('margdarshak_birth_details', JSON.stringify(birthDetailsToStore));

    try {
      const result = await generateCareerInsights({
        selectedCareer: selectedCareer,
        dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
        placeOfBirth: data.placeOfBirth,
        timeOfBirth: data.timeOfBirth,
      });
      setInsights(result);
      toast({ title: 'Insights Generated!', description: 'Review your astrological and numerological insights below.' });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({ title: 'Error Generating Insights', description: 'Could not generate insights. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleProceedToPayment = () => {
    router.push('/payment');
  };
  
  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!selectedCareer) {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">No Career Selected</h1>
        <p className="text-muted-foreground mb-6">Please select a career first to get insights.</p>
        <Button onClick={() => router.push('/career-suggestions')}>View Suggestions</Button>
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
            Unlock deeper understanding for your chosen path: <span className="font-semibold text-primary">{selectedCareer}</span>. <br/> Enter your birth details for astrological and numerological perspectives.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Birth (City, Country)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Delhi, India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Birth</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10:30 AM or 14:45" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter time in HH:MM AM/PM or 24-hour format.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Generating Insights...' : 'Get My Insights'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && !insights && (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size={48} />
        </div>
      )}

      {insights && (
        <Card className="w-full max-w-2xl mx-auto shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Your Career Insights for {selectedCareer}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none px-6 py-4 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-primary flex items-center"><Sparkles className="mr-2 h-5 w-5" />Astrological Review</h3>
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="mb-3 text-foreground/90" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                }}
              >
                {insights.astrologicalReview}
              </ReactMarkdown>
            </div>
            <hr className="my-4 border-border" />
            <div>
              <h3 className="text-xl font-semibold text-primary flex items-center"><Wand2 className="mr-2 h-5 w-5" />Numerological Review</h3>
               <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="mb-3 text-foreground/90" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                }}
              >
                {insights.numerologicalReview}
              </ReactMarkdown>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleProceedToPayment} className="text-lg py-5">
              Proceed to Roadmap Payment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
