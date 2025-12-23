
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Edit3, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';


const personalizedQuestions = [
  { id: 'q1', label: 'Ideal Workday', text: 'Describe your ideal workday. What kind of tasks energize you, and what kind of tasks drain you?' },
  { id: 'q2', label: 'Hobbies & Interests', text: 'What are some of your hobbies or activities you genuinely enjoy outside of work or study? What do you like about them?' },
  { id: 'q3', label: '5-Year Vision', text: 'Imagine yourself 5 years from now. What achievements, big or small, would make you feel proud and fulfilled in your professional life?' },
  { id: 'q4', label: 'Industry Interest', text: 'Are there any specific industries or types of companies that particularly interest you or you feel drawn to? Why?' },
  { id: 'q5', label: 'Career Motivations', text: 'What are your primary motivations when thinking about a career? (e.g., financial security, making an impact, continuous learning, work-life balance, creativity, leadership, etc.). Please elaborate.' },
];

const formSchemaDefinition = personalizedQuestions.reduce((acc, q) => {
  acc[q.id as keyof PersonalizedAnswersSchemaValues] = z.string().min(10, { message: 'Please provide a detailed answer (at least 10 characters).' });
  return acc;
}, {} as Record<keyof PersonalizedAnswersSchemaValues, z.ZodString>);

const personalizedAnswersSchema = z.object(formSchemaDefinition);

type PersonalizedAnswersSchemaValues = z.infer<typeof personalizedAnswersSchema>;

export default function PersonalizedQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<PersonalizedAnswersSchemaValues>({
    resolver: zodResolver(personalizedAnswersSchema),
    defaultValues: personalizedQuestions.reduce((acc, q) => {
      acc[q.id as keyof PersonalizedAnswersSchemaValues] = '';
      return acc;
    }, {} as PersonalizedAnswersSchemaValues),
  });

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
             toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive' });
             router.replace('/signup');
             return;
          }
          
          const userData = userDoc.data();

          if (!userData.birthDetailsCompleted) {
            toast({ title: 'Birth details not completed', description: 'Please complete your birth details first.', variant: 'destructive' });
            router.replace('/birth-details');
            return;
          }

          if (!userData.testCompleted && !localStorage.getItem('margdarshak_user_traits')) {
            toast({ title: 'Psychometric test not completed', description: 'Please complete the test to continue.', variant: 'destructive' });
            router.replace('/psychometric-test');
            return;
          }

          if (userData.personalizedAnswers) {
            form.reset(userData.personalizedAnswers);
            toast({ title: 'Loaded Your Saved Answers', description: 'You can review or edit your previous responses.' });
          } else {
             const storedAnswers = localStorage.getItem('margdarshak_personalized_answers');
             if (storedAnswers) {
                 form.reset(JSON.parse(storedAnswers));
             }
          }
        } catch (error) {
          console.error("Error loading page data:", error);
          toast({ title: 'Error loading page data', variant: 'destructive' });
          router.replace('/welcome-guest');
          return;
        }
      } else {
        toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, form, auth, db]);

  const onSubmit = async (data: PersonalizedAnswersSchemaValues) => {
    if (!user || !db) {
      toast({ title: 'Error', description: 'You must be logged in to save answers.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    toast({ title: 'Saving Your Answers...', description: 'Preparing your personalized plans...' });
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { personalizedAnswers: data, personalizedAnswersCompleted: true }, { merge: true });
      localStorage.setItem('margdarshak_personalized_answers', JSON.stringify(data));
      
      // Clear any data from a previous plan selection/payment flow
      localStorage.removeItem('margdarshak_selected_plan');
      
      // CORRECTED: Redirect to the pricing/plans page first.
      router.push('/pricing');
    } catch (error) {
      console.error('Error saving personalized answers:', error);
      toast({ title: 'Error Saving Answers', description: 'Could not save your answers. Please try again.', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Edit3 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">A Little More About You</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your insights here will help us tailor career suggestions. Please answer thoughtfully.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="px-6 py-4 space-y-8">
              {personalizedQuestions.map((question) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={question.id as keyof PersonalizedAnswersSchemaValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">{question.text}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your detailed answer..."
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
            <CardFooter className="flex justify-between p-6">
               <Button type="button" variant="outline" onClick={() => router.push('/psychometric-test')} disabled={isLoading}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Test
               </Button>
               <Button type="submit" className="text-lg bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    Submit Assessment <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
