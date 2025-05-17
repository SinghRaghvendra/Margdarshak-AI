
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { psychometricTestQuestions, type Question } from './questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardList, Lightbulb, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
// Note: suggestCareers AI flow is not called here anymore. It's called on the suggestions page.
import { useToast } from '@/hooks/use-toast';

const TOTAL_QUESTIONS = psychometricTestQuestions.length;

export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false); // Kept for future use if submission becomes async
  const [userInfo, setUserInfo] = useState<{name: string} | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive'});
        router.replace('/signup');
        return;
      }
      // Check if birth details exist, if not, redirect to birth-details page
      const birthDetails = localStorage.getItem('margdarshak_birth_details');
      if (!birthDetails) {
        toast({ title: 'Birth details not found', description: 'Please provide your birth details first.', variant: 'destructive'});
        router.replace('/birth-details');
        return;
      }

    } catch (error) {
        toast({ title: 'Error loading initial data', description: 'Please try again from signup.', variant: 'destructive'});
        router.replace('/signup');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);


  const currentQuestion: Question | undefined = psychometricTestQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleNext = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
        toast({ title: 'Please select an answer for the last question', variant: 'destructive' });
        return;
    }
    if (Object.keys(answers).length !== TOTAL_QUESTIONS) {
      toast({ title: 'Please answer all questions', description: `You have answered ${Object.keys(answers).length} out of ${TOTAL_QUESTIONS}.`, variant: 'destructive' });
      return;
    }
    
    setIsLoading(true); // Keep for visual feedback even if not async
    
    // Create a summary of answers to represent "traits".
    // This is a simplified approach. A real app would have a more complex scoring logic.
    const traitSummaryParts: string[] = [];
    for (const qId in answers) {
      const question = psychometricTestQuestions.find(q => q.id === parseInt(qId));
      if (question) {
        traitSummaryParts.push(`For "${question.text}", user answered "${answers[qId]}".`);
      }
    }
    const userTraits = traitSummaryParts.join(' ');
    
    try {
      localStorage.setItem('margdarshak_user_traits', userTraits);
      // Clear any old career suggestions or selected career if re-taking test
      localStorage.removeItem('margdarshak_career_suggestions');
      localStorage.removeItem('margdarshak_selected_career');

      toast({ title: 'Test Submitted!', description: 'Proceeding to personalized questions...' });
      router.push('/personalized-questions'); 
    } catch (error) {
      console.error('Error saving traits:', error);
      toast({ title: 'Error', description: 'Could not save test results. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (pageLoading || !userInfo) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!currentQuestion) {
    // Should not happen if navigation is correct
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">Loading questions...</div>;
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Psychometric Test</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</span>
          </div>
          <CardDescription>Hi {userInfo.name}, answer these questions to help us understand your traits.</CardDescription>
          <Progress value={progress} className="w-full mt-2 h-3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold">{currentQuestion.text}</p>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswerChange}
            className="space-y-2"
          >
            {currentQuestion.options.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                <Label htmlFor={`${currentQuestion.id}-${option}`} className="text-base flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : currentQuestionIndex < TOTAL_QUESTIONS - 1 ? (
            <Button onClick={handleNext} className="text-lg px-6 py-3" disabled={!answers[currentQuestion.id]}>Next Question</Button>
          ) : (
            <Button onClick={handleSubmit} className="text-lg px-6 py-3" disabled={!answers[currentQuestion.id]}>
              Continue to Personalized Questions <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
