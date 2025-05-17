'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { psychometricTestQuestions, type Question } from './questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardList, Lightbulb } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { suggestCareers, type CareerSuggestionOutput } from '@/ai/flows/career-suggestion';
import { useToast } from '@/hooks/use-toast';

const TOTAL_QUESTIONS = psychometricTestQuestions.length;

export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{name: string} | null>(null);

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        toast({ title: 'User data not found', description: 'Redirecting to signup.', variant: 'destructive'});
        router.replace('/signup');
      }
    } catch (error) {
        toast({ title: 'Error loading user data', description: 'Please try signing up again.', variant: 'destructive'});
        router.replace('/signup');
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
    
    setIsLoading(true);
    // For now, "traits" is a mock string. In a real app, this would be derived from answers.
    const mockUserTraits = "User is analytical, creative, enjoys problem-solving, and prefers collaborative environments. They are detail-oriented and interested in technology and innovation.";
    
    try {
      localStorage.setItem('margdarshak_user_traits', mockUserTraits);
      const suggestion: CareerSuggestionOutput = await suggestCareers({ traits: mockUserTraits });
      localStorage.setItem('margdarshak_selected_career', suggestion.career);
      // Remove the old array of suggestions if it exists, as it's no longer used in this flow
      localStorage.removeItem('margdarshak_career_suggestions');
      toast({ title: 'Test Submitted!', description: 'Generating your career suggestion and proceeding to payment...' });
      router.push('/payment'); // Navigate directly to payment page
    } catch (error) {
      console.error('Error suggesting career:', error);
      toast({ title: 'Error', description: 'Could not generate career suggestion. Please try again.', variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
  if (!userInfo) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!currentQuestion) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">End of test. Processing...</div>;
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
          <CardDescription>Hi {userInfo.name}, answer these questions to help us understand your traits and suggest suitable careers.</CardDescription>
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
            <Button onClick={handleSubmit} className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!answers[currentQuestion.id]}>
              <Lightbulb className="mr-2 h-5 w-5" />
              Get Final Career Suggestion
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
