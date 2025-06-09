
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
import { Edit3, ArrowRight } from 'lucide-react';

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
  const [userName, setUserName] = useState<string | null>(null);

  const form = useForm<PersonalizedAnswersSchemaValues>({
    resolver: zodResolver(personalizedAnswersSchema),
    defaultValues: personalizedQuestions.reduce((acc, q) => {
      acc[q.id as keyof PersonalizedAnswersSchemaValues] = '';
      return acc;
    }, {} as PersonalizedAnswersSchemaValues),
  });

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        setUserName(userInfo.name || 'Guest');
      } else {
        toast({ title: 'User info not found', description: 'Redirecting to signup.', variant: 'destructive' });
        router.replace('/signup');
        return;
      }
      
      const storedUserTraits = localStorage.getItem('margdarshak_user_traits');
      if (!storedUserTraits) {
        toast({ title: 'Psychometric test data not found', description: 'Please complete the psychometric test first.', variant: 'destructive' });
        router.replace('/psychometric-test');
        return;
      }

      const storedAnswers = localStorage.getItem('margdarshak_personalized_answers');
      if (storedAnswers) {
        form.reset(JSON.parse(storedAnswers));
      }
    } catch (error) {
      toast({ title: 'Error loading page data', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setPageLoading(false);
    }
  }, [router, toast, form]);

  const onSubmit = async (data: PersonalizedAnswersSchemaValues) => {
    setIsLoading(true);
    toast({ title: 'Saving Your Answers', description: 'Getting ready to suggest careers...' });
    try {
      localStorage.setItem('margdarshak_personalized_answers', JSON.stringify(data));
      // Clear any old career suggestions or selected career from single-select flow
      localStorage.removeItem('margdarshak_career_suggestions'); // Old key for AI output
      localStorage.removeItem('margdarshak_selected_career'); // Old key for single selected career
      localStorage.removeItem('margdarshak_selected_careers_list'); // New key for multiple selected careers
      localStorage.removeItem('margdarshak_career_insights_astro');
      localStorage.removeItem('margdarshak_career_insights_numero');
      localStorage.removeItem('margdarshak_payment_successful');
      // Clear cached roadmaps
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_roadmap_')) {
          localStorage.removeItem(key);
        }
      });

      router.push('/career-suggestions');
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
            Hi {userName || 'there'}! Your insights here will help us tailor career suggestions. Please answer thoughtfully.
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
                    Continue to Career Suggestions <ArrowRight className="ml-2 h-5 w-5" />
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
