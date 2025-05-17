
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Cake, UserCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const birthDetailsFormSchema = z.object({
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }),
  placeOfBirth: z.string().min(2, { message: 'Place of birth must be at least 2 characters.' }).describe('City and Country, e.g., New Delhi, India'),
  timeOfBirth: z.string().min(3, { message: 'Time of birth is required (e.g., 10:30 AM or 14:45).' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*(AM|PM))?$/i, { message: 'Invalid time format. Use HH:MM or HH:MM AM/PM.'}),
});

type BirthDetailsFormValues = z.infer<typeof birthDetailsFormSchema>;

interface StoredBirthDetailsForInsights extends BirthDetailsFormValues {
  dateOfBirth: string; // Store as string in localStorage
}

export default function BirthDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const form = useForm<BirthDetailsFormValues>({
    resolver: zodResolver(birthDetailsFormSchema),
    defaultValues: {
      placeOfBirth: '',
      timeOfBirth: '',
    },
  });

 useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        setUserName(userInfo.name || 'Guest');
      } else {
        // Should ideally not happen if flow is followed from signup
        toast({ title: 'User info not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        return;
      }

      const storedDetails = localStorage.getItem('margdarshak_birth_details');
      if (storedDetails) {
        const parsedDetails: StoredBirthDetailsForInsights = JSON.parse(storedDetails);
        form.reset({
          dateOfBirth: new Date(parsedDetails.dateOfBirth), // Convert string back to Date
          placeOfBirth: parsedDetails.placeOfBirth,
          timeOfBirth: parsedDetails.timeOfBirth,
        });
      }
    } catch (error) {
      toast({ title: 'Error loading data', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setPageLoading(false);
    }
  }, [router, toast, form]);


  async function onSubmit(data: BirthDetailsFormValues) {
    toast({ title: 'Saving Birth Details', description: 'Proceeding to the next step...' });
    
    const detailsToStore: StoredBirthDetailsForInsights = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'), // Store date as string
    };

    try {
      localStorage.setItem('margdarshak_birth_details', JSON.stringify(detailsToStore));
      router.push('/psychometric-test');
    } catch (error) {
      console.error('Error saving birth details:', error);
      toast({ title: 'Error Saving Details', description: 'Could not save birth details. Please try again.', variant: 'destructive' });
    }
  }
  
  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Cake className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Your Birth Details</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Hi {userName || 'there'}! Please provide your birth information. This will be used later for personalized astrological and numerological insights.
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
              <Button type="submit" className="w-full text-lg py-6">
                Continue to Psychometric Test <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
