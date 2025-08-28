
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Cake, UserCircle, ArrowRight, MapPinIcon, ClockIcon } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';


const birthDetailsFormSchema = z.object({
  birthDay: z.string()
    .min(1, "Day is required")
    .regex(/^(0?[1-9]|[12][0-9]|3[01])$/, { message: "Day (1-31)" }),
  birthMonth: z.string()
    .min(1, "Month is required")
    .regex(/^(0?[1-9]|1[012])$/, { message: "Month (1-12)" }),
  birthYear: z.string()
    .min(4, "Year (YYYY)")
    .regex(/^(19[0-9]{2}|20[0-9]{2})$/, { message: "Year (e.g., 1900-2099)" })
    .refine(val => parseInt(val) <= new Date().getFullYear(), { message: "Year cannot be in the future." })
    .refine(val => parseInt(val) >= 1900, { message: "Year must be 1900 or later." }),
  placeOfBirth: z.string().min(2, { message: 'Place of birth must be at least 2 characters.' }),
  birthHour: z.string()
    .min(1, "Hour is required")
    .regex(/^([01]?[0-9]|2[0-3])$/, { message: "Hour (00-23)" }),
  birthMinute: z.string()
    .min(1, "Minute is required")
    .regex(/^[0-5]?[0-9]$/, { message: "Minute (00-59)" }),
}).refine(data => {
    const day = parseInt(data.birthDay);
    const month = parseInt(data.birthMonth);
    const year = parseInt(data.birthYear);
    // If any part is not a number yet, or out of typical single field range, let individual validators handle it.
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
      return true; 
    }
    try {
      const daysInMonth = new Date(year, month, 0).getDate();
      return day >= 1 && day <= daysInMonth;
    } catch (e) {
      return false; // Invalid date components
    }
}, {
    message: "The day is not valid for the selected month and year.",
    path: ["birthDay"], 
});

type BirthDetailsFormValues = z.infer<typeof birthDetailsFormSchema>;

interface StoredBirthDetailsForInsights {
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth: string; // HH:MM (24-hour)
}

export default function BirthDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<BirthDetailsFormValues>({
    resolver: zodResolver(birthDetailsFormSchema),
    defaultValues: {
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      placeOfBirth: '',
      birthHour: '',
      birthMinute: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'Guest');
            // Load saved birth details from Firestore if they exist
            if (userData.birthDetails) {
              const parsedDetails: StoredBirthDetailsForInsights = userData.birthDetails;
              const [year, month, day] = parsedDetails.dateOfBirth.split('-').map(s => s.padStart(2, '0'));
              const [hour, minute] = parsedDetails.timeOfBirth.split(':').map(s => s.padStart(2, '0'));
              
              form.reset({
                birthDay: day,
                birthMonth: month,
                birthYear: year,
                placeOfBirth: parsedDetails.placeOfBirth,
                birthHour: hour,
                birthMinute: minute,
              });
            }
          } else {
             toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive' });
             router.replace('/signup');
             return;
          }
        } catch (error) {
          toast({ title: 'Error loading data', description: 'Could not fetch your profile.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, form]);


  async function onSubmit(data: BirthDetailsFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive' });
      return;
    }
    
    const formattedDateOfBirth = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    const formattedTimeOfBirth = `${data.birthHour.padStart(2, '0')}:${data.birthMinute.padStart(2, '0')}`;

    const detailsToStore: StoredBirthDetailsForInsights = {
      dateOfBirth: formattedDateOfBirth,
      placeOfBirth: data.placeOfBirth,
      timeOfBirth: formattedTimeOfBirth,
    };

    try {
      // Save to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { birthDetails: detailsToStore }, { merge: true });
      
      // Save to localStorage as well for quick access by other components
      localStorage.setItem('margdarshak_birth_details', JSON.stringify(detailsToStore));
      
      toast({ title: 'Birth Details Saved', description: 'Proceeding to the next step...' });
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
              <div>
                <FormLabel>Date of Birth</FormLabel>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  <FormField
                    control={form.control}
                    name="birthDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="DD" {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="MM" {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="YYYY" {...field} maxLength={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />Place of Birth (City, Country)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Delhi, India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Time of Birth (24-hour format)</FormLabel>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <FormField
                    control={form.control}
                    name="birthHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="HH (00-23)" {...field} maxLength={2}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthMinute"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="MM (00-59)" {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
