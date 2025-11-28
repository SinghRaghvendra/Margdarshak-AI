
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { psychometricTestSections, type Section, type Question } from './questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '@/components/FirebaseProvider';

const TOTAL_SECTIONS = psychometricTestSections.length;
const TOTAL_QUESTIONS = psychometricTestSections.reduce((acc, s) => acc + s.questions.length, 0);

interface TestProgress {
  currentSectionIndex: number;
  currentQuestionInSectionIndex: number;
  answers: Record<string, string | number>;
}

const parseUserTraits = (traitsData: any): Record<string, string | number> => {
    const answers: Record<string, string | number> = {};
    if (!traitsData || typeof traitsData !== 'object') return answers;

    for (const sectionKey in traitsData) {
        if (typeof traitsData[sectionKey] === 'object') {
            for (const questionKey in traitsData[sectionKey]) {
                answers[questionKey] = traitsData[sectionKey][questionKey];
            }
        }
    }
    return answers;
};


export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db } = useFirebase();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionInSectionIndex, setCurrentQuestionInSectionIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!(userDoc.exists() && userDoc.data().birthDetailsCompleted)) {
              toast({ title: 'Birth details not found', description: 'Please provide your birth details first.', variant: 'destructive' });
              router.replace('/birth-details');
              return;
          }
          
          if (userDoc.exists() && userDoc.data().userTraits) {
              const finalAnswers = parseUserTraits(userDoc.data().userTraits);
              if (Object.keys(finalAnswers).length > 0) {
                  setAnswers(finalAnswers);
                  setAnsweredQuestions(new Set(Object.keys(finalAnswers))); 
                  toast({ title: 'Loaded Your Saved Answers', description: 'You can now review or edit your previous responses.' });
              }
          } else {
              const storedJourneyId = localStorage.getItem('margdarshak_current_journey_id');
              if (storedJourneyId) {
                setJourneyId(storedJourneyId);
                const journeyDocRef = doc(db, 'users', currentUser.uid, 'journeys', storedJourneyId);
                const journeyDoc = await getDoc(journeyDocRef);
    
                if (journeyDoc.exists() && journeyDoc.data().testProgress) {
                  const savedProgress: TestProgress = journeyDoc.data().testProgress;
                  const savedAnswers = savedProgress.answers || {};
                  setAnswers(savedAnswers);
                  setAnsweredQuestions(new Set(Object.keys(savedAnswers)));
                  setCurrentSectionIndex(savedProgress.currentSectionIndex || 0);
                  setCurrentQuestionInSectionIndex(savedProgress.currentQuestionInSectionIndex || 0);
                  if (Object.keys(savedAnswers).length > 0) {
                      toast({ title: 'Progress Restored', description: 'We\'ve loaded your in-progress work for this session.' });
                  }
                }
              }
          }

        } catch (error) {
          console.error("Error loading user progress:", error);
          toast({ title: 'Error Loading Progress', description: 'Could not load your saved data.', variant: 'destructive' });
        }

      } else {
        toast({ title: 'Not Authenticated', description: 'Please log in to take the test.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, auth, db]);


  const saveProgress = useCallback(async () => {
    if (!user || !journeyId || pageLoading) return;

    const progress: TestProgress = {
      currentSectionIndex,
      currentQuestionInSectionIndex,
      answers,
    };

    try {
      const journeyDocRef = doc(db, 'users', user.uid, 'journeys', journeyId);
      await updateDoc(journeyDocRef, { testProgress: progress });
      
    } catch (error) {
      console.error("Failed to save progress to Firestore", error);
    }
  }, [user, journeyId, pageLoading, currentSectionIndex, currentQuestionInSectionIndex, answers, db]);

  useEffect(() => {
    const timer = setTimeout(() => {
        saveProgress();
    }, 1000); 

    return () => clearTimeout(timer);
  }, [answers, currentSectionIndex, currentQuestionInSectionIndex, saveProgress]);

  const currentSection: Section | undefined = psychometricTestSections[currentSectionIndex];
  const currentQuestion: Question | undefined = currentSection?.questions[currentQuestionInSectionIndex];
  
  const progress = (answeredQuestions.size / TOTAL_QUESTIONS) * 100;
  
  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setAnsweredQuestions((prev) => new Set(prev).add(questionId));
  };
  
  const handleSliderChange = (questionId: string, value: number[]) => {
    handleAnswerChange(questionId, value[0]);
  };
  
  const handleNext = () => {
    if (!currentQuestion || !answeredQuestions.has(currentQuestion.id)) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }

    if (currentQuestionInSectionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex + 1);
    } else if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionInSectionIndex(0);
    } else {
      // Finished test
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionInSectionIndex > 0) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = psychometricTestSections[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionInSectionIndex(prevSection.questions.length - 1);
    }
  };

  const compileTraitsToJSON = (): Record<string, Record<string, string | number>> => {
      const traitData: Record<string, Record<string, string | number>> = {};
  
      psychometricTestSections.forEach(section => {
          const sectionId = section.id.replace('section', 's'); // e.g., s1, s2
          traitData[sectionId] = {};
          section.questions.forEach(q => {
              const answer = answers[q.id];
              if (answer !== undefined) {
                  traitData[sectionId][q.id] = answer;
              }
          });
      });
      return traitData;
  };

  const handleSubmitTest = async () => {
    if (!user) {
        toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive'});
        return;
    }

    if (answeredQuestions.size < TOTAL_QUESTIONS) {
        toast({
            title: 'Incomplete Test',
            description: `Please answer all ${TOTAL_QUESTIONS} questions before submitting. You have answered ${answeredQuestions.size}.`,
            variant: 'destructive',
            duration: 5000,
        });
        return;
    }

    setIsLoading(true);
    const userTraitsJSON = compileTraitsToJSON();

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, { 
        userTraits: userTraitsJSON,
        testCompleted: true,
      }, { merge: true });
      localStorage.setItem('margdarshak_user_traits', JSON.stringify(userTraitsJSON));
      
      if (journeyId) {
        const journeyDocRef = doc(db, 'users', user.uid, 'journeys', journeyId);
        await updateDoc(journeyDocRef, {
          userTraits: userTraitsJSON,
          testCompleted: true,
          testProgress: null, // Clear progress on completion
        });
      }

      localStorage.removeItem('margdarshak_personalized_answers');
      localStorage.removeItem('margdarshak_all_career_suggestions');
      localStorage.removeItem('margdarshak_selected_careers_list');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_roadmap_')) {
          localStorage.removeItem(key);
        }
      });

      toast({ title: 'Test Submitted!', description: 'Proceeding to personalized questions...' });
      
      router.push('/personalized-questions');

    } catch (error) {
      console.error('Error saving traits:', error);
      toast({ title: 'Error', description: 'Could not save test results. Please try again.', variant: 'destructive' });
      setIsLoading(false);
    }
  };


  if (pageLoading || !user) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  if (!currentSection || !currentQuestion) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  const questionKey = `${currentSection.id}-${currentQuestion.id}`;
  const currentQuestionNumber = psychometricTestSections.slice(0, currentSectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + currentQuestionInSectionIndex + 1;

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">Question {currentQuestionNumber} of {TOTAL_QUESTIONS}</span>
          </div>
          <CardDescription>{currentSection.focusArea}</CardDescription>
          <Progress value={progress} className="w-full mt-2 h-3" />
        </CardHeader>
        <CardContent className="space-y-6 min-h-[200px]">
          {currentQuestion.type === 'slider' && (
            <>
              <p className="text-lg font-semibold text-center mb-4">{currentQuestion.text}</p>
              <div className="flex justify-between text-sm text-muted-foreground px-2">
                <span>{currentQuestion.poles[0].emoji} {currentQuestion.poles[0].label}</span>
                <span>{currentQuestion.poles[1].emoji} {currentQuestion.poles[1].label}</span>
              </div>
              <Slider
                key={questionKey}
                defaultValue={[3]}
                value={[answers[currentQuestion.id] !== undefined ? Number(answers[currentQuestion.id]) : 3]}
                min={1} max={5} step={1}
                onValueChange={(value) => handleSliderChange(currentQuestion.id, value)}
                className="w-[90%] mx-auto"
              />
               <p className="text-center text-xs text-muted-foreground mt-1">Selected: {answers[currentQuestion.id] || 'Neutral (3)'}</p>
            </>
          )}
          {(currentQuestion.type === 'choice' || currentQuestion.type === 'scenario') && (
            <>
              {currentQuestion.type === 'scenario' && <p className="text-md italic text-muted-foreground mb-3">{currentQuestion.scenario}</p>}
              <p className="text-lg font-semibold">{currentQuestion.type === 'choice' ? currentQuestion.text : (currentQuestion as any).questionText}</p>
              {(currentQuestion as any).visualHint && <p className="text-sm text-muted-foreground italic mb-2">{(currentQuestion as any).visualHint}</p>}
              <RadioGroup
                key={questionKey}
                value={answers[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-2"
              >
                {(currentQuestion as any).options.map((option: any) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                    <Label htmlFor={`${currentQuestion.id}-${option.id}`} className="text-base flex-1 cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between space-x-3">
          <Button onClick={handlePrevious} variant="outline" disabled={isLoading || (currentSectionIndex === 0 && currentQuestionInSectionIndex === 0)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {isLoading ? (
            <LoadingSpinner />
          ) : currentQuestionNumber < TOTAL_QUESTIONS ? (
            <Button
              onClick={handleNext}
              disabled={!answeredQuestions.has(currentQuestion.id)}
              className="text-lg px-6 py-3"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitTest} className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!answeredQuestions.has(currentQuestion.id)}>
              Finish Test <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
