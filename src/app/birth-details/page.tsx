
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Cake, ArrowRight, MapPinIcon } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/components/FirebaseProvider';

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

interface StoredBirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth: string; // HH:MM (24-hour)
}

export default function BirthDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db } = useFirebase();
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

  const ensureJourneyExists = async (currentUser: User) => {
    const existingJourneyId = localStorage.getItem('margdarshak_current_journey_id');
    
    // If a journey ID already exists in this session, do nothing.
    if (existingJourneyId) {
      console.log(`Reusing existing journey: ${existingJourneyId}`);
      return;
    }
    
    // Otherwise, create a new one.
    const journeyId = `journey_${Date.now()}`;
    const journeyDocRef = doc(db, 'users', currentUser.uid, 'journeys', journeyId);
    
    try {
      await setDoc(journeyDocRef, {
        journeyId: journeyId,
        startedAt: new Date().toISOString(),
        status: 'initiated'
      });
      localStorage.setItem('margdarshak_current_journey_id', journeyId);
      console.log(`Created new journey: ${journeyId}`);
    } catch (error) {
       console.error("Error creating new journey:", error);
       toast({ title: 'Journey Creation Failed', description: 'Could not start a new guidance journey. Please try again.', variant: 'destructive'});
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      
      setUser(currentUser);
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserName(userData.name || 'Guest');
          
          if (userData.birthDetails) {
            const { dateOfBirth, placeOfBirth, timeOfBirth } = userData.birthDetails;
            const [year, month, day] = dateOfBirth.split('-').map((s: string) => s.padStart(2, '0'));
            const [hour, minute] = timeOfBirth.split(':').map((s: string) => s.padStart(2, '0'));
            form.reset({
              birthDay: day,
              birthMonth: month,
              birthYear: year,
              placeOfBirth,
              birthHour: hour,
              birthMinute: minute,
            });
            toast({ title: 'Welcome Back!', description: 'Your previous details have been loaded.' });
          }
        } else {
          const localUserString = localStorage.getItem('margdarshak_user_info');
          if (localUserString) {
            const localUser = JSON.parse(localUserString);
            setUserName(localUser.name || 'Guest');
          } else {
            setUserName('Guest');
          }
        }
        await ensureJourneyExists(currentUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({ title: 'Error', description: 'Could not fetch your profile data. Please check your connection.', variant: 'destructive'});
      } finally {
        setPageLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast, auth, db, form]);


  async function onSubmit(data: BirthDetailsFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You are not logged in. Please refresh and try again.', variant: 'destructive' });
      return;
    }

    const formattedDateOfBirth = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    const formattedTimeOfBirth = `${data.birthHour.padStart(2, '0')}:${data.birthMinute.padStart(2, '0')}`;

    const birthDetailsToStore: StoredBirthDetails = {
      dateOfBirth: formattedDateOfBirth,
      placeOfBirth: data.placeOfBirth,
      timeOfBirth: formattedTimeOfBirth,
    };
    
    const localUserString = localStorage.getItem('margdarshak_user_info');
    const localUserInfo = localUserString ? JSON.parse(localUserString) : {};

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        ...localUserInfo,
        uid: user.uid,
        birthDetails: birthDetailsToStore,
        birthDetailsCompleted: true,
      }, { merge: true });

      localStorage.setItem('margdarshak_birth_details', JSON.stringify(birthDetailsToStore));
      
      toast({ title: 'Birth Details Saved', description: 'Your information has been securely saved.' });
      router.push('/psychometric-test');
    } catch (error: any) {
      console.error('🚨 Firestore write failed:', error);
      toast({ title: 'Error Saving Details', description: error.message || 'Could not save details to the database. Please check your connection and try again.', variant: 'destructive' });
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
            Hi {userName || 'there'}! Please provide your birth information for personalized insights.
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

              <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoadingSpinner /> : (
                  <>Continue to Psychometric Test <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
