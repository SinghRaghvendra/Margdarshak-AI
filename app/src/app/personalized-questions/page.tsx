
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Edit3, ArrowRight } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string>('Guest');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm<PersonalizedAnswersSchemaValues>({
    resolver: zodResolver(personalizedAnswersSchema),
    defaultValues: personalizedQuestions.reduce((acc, q) => {
      acc[q.id as keyof PersonalizedAnswersSchemaValues] = '';
      return acc;
    }, {} as PersonalizedAnswersSchemaValues),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || 'User');
          if (userData.personalizedAnswers) {
            form.reset(userData.personalizedAnswers);
          }
        }
      } else {
        setCurrentUser(null);
        setUserName('Guest');
        const storedAnswers = localStorage.getItem('margdarshak_personalized_answers_guest');
        if (storedAnswers) {
          form.reset(JSON.parse(storedAnswers));
        }
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [form, router]);


  const onSubmit = async (data: PersonalizedAnswersSchemaValues) => {
    setIsLoading(true);
    toast({ title: 'Saving Your Answers', description: 'Proceeding to payment...' });

    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { personalizedAnswers: data }, { merge: true });
      } else {
        // Save to a guest-specific key in local storage
        localStorage.setItem('margdarshak_personalized_answers_guest', JSON.stringify(data));
      }
      
      // Also save to the generic key for the current guest or user session for immediate use on the next page
      localStorage.setItem('margdarshak_personalized_answers', JSON.stringify(data));

      router.push('/payment');
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
            Hi {userName}! Your insights here will help us tailor career suggestions. Please answer thoughtfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    Continue to Payment <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    