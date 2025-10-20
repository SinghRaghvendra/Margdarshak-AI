
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { psychometricTestSections, optionalRatingQuestions, type Section, type Question, type RatingQuestion } from './questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

const TOTAL_SECTIONS = psychometricTestSections.length;

interface TestProgress {
  currentSectionIndex: number;
  currentQuestionInSectionIndex: number;
  answers: Record<string, string | number>;
  optionalAnswers: Record<string, number>;
  showOptionalIntro: boolean;
  takingOptionalTest: boolean;
  currentOptionalQuestionIndex: number;
}

export default function PsychometricTestPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionInSectionIndex, setCurrentQuestionInSectionIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [optionalAnswers, setOptionalAnswers] = useState<Record<string, number>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [showOptionalIntro, setShowOptionalIntro] = useState(false);
  const [currentOptionalQuestionIndex, setCurrentOptionalQuestionIndex] = useState(0);
  const [takingOptionalTest, setTakingOptionalTest] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // User is logged in, now load their data
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().testProgress) {
            const savedProgress: TestProgress = userDoc.data().testProgress;
            // Add checks to ensure savedProgress is not null/malformed
            if (savedProgress) {
                setCurrentSectionIndex(savedProgress.currentSectionIndex || 0);
                setCurrentQuestionInSectionIndex(savedProgress.currentQuestionInSectionIndex || 0);
                setAnswers(savedProgress.answers || {});
                setOptionalAnswers(savedProgress.optionalAnswers || {});
                setShowOptionalIntro(savedProgress.showOptionalIntro || false);
                setTakingOptionalTest(savedProgress.takingOptionalTest || false);
                setCurrentOptionalQuestionIndex(savedProgress.currentOptionalQuestionIndex || 0);
                if (savedProgress.answers && Object.keys(savedProgress.answers).length > 0) {
                    toast({ title: 'Progress Restored', description: 'Welcome back! We\'ve loaded your saved progress.' });
                }
            }
          }
        
          const birthDetailsStored = localStorage.getItem('margdarshak_birth_details');
          if (!birthDetailsStored) {
              const userInfo = userDoc.exists() ? userDoc.data() : null;
              if (userInfo && userInfo.birthDetails) {
                  localStorage.setItem('margdarshak_birth_details', JSON.stringify(userInfo.birthDetails));
              } else {
                  toast({ title: 'Birth details not found', description: 'Please provide your birth details first.', variant: 'destructive' });
                  router.replace('/birth-details');
                  return;
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
  }, [router, toast]);


  const saveProgress = useCallback(async () => {
    if (!user || pageLoading) return;

    const progress: TestProgress = {
      currentSectionIndex,
      currentQuestionInSectionIndex,
      answers,
      optionalAnswers,
      showOptionalIntro,
      takingOptionalTest,
      currentOptionalQuestionIndex
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { testProgress: progress });
      
    } catch (error) {
      // This can fail if the document doesn't exist, so we use setDoc with merge as a fallback
      if ((error as any).code === 'not-found') {
          try {
              const userDocRef = doc(db, 'users', user.uid);
              await setDoc(userDocRef, { testProgress: progress }, { merge: true });
          } catch (setError) {
              console.error("Failed to save progress with setDoc after update failed", setError);
          }
      } else {
        console.error("Failed to save progress to Firestore", error);
        toast({ title: "Could not save progress", description: "Your progress may not be saved. Please check your internet connection.", variant: "destructive"});
      }
    }
  }, [user, pageLoading, currentSectionIndex, currentQuestionInSectionIndex, answers, optionalAnswers, showOptionalIntro, takingOptionalTest, currentOptionalQuestionIndex, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        saveProgress();
    }, 1000); // Debounce saving by 1 second

    return () => clearTimeout(timer);
  }, [answers, optionalAnswers, currentSectionIndex, currentQuestionInSectionIndex, showOptionalIntro, takingOptionalTest, currentOptionalQuestionIndex, saveProgress]);

  const currentSection: Section | undefined = psychometricTestSections[currentSectionIndex];
  const currentQuestion: Question | undefined = currentSection?.questions[currentQuestionInSectionIndex];
  const currentOptionalQuestion: RatingQuestion | undefined = optionalRatingQuestions[currentOptionalQuestionIndex];

  const progress = currentSection ? ((currentSectionIndex + (currentQuestionInSectionIndex / currentSection.questions.length)) / TOTAL_SECTIONS) * 100 : 0;
  const optionalProgress = takingOptionalTest ? ((currentOptionalQuestionIndex + 1) / optionalRatingQuestions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  
  const handleOptionalAnswerChange = (questionId: string, value: number) => {
    setOptionalAnswers((prev) => ({...prev, [questionId]: value }));
  }

  const handleSliderChange = (questionId: string, value: number[]) => {
    handleAnswerChange(questionId, value[0]);
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    return answers[currentQuestion.id] !== undefined;
  };
  
  const isCurrentOptionalQuestionAnswered = () => {
    if (!currentOptionalQuestion) return false;
    return optionalAnswers[currentOptionalQuestion.id] !== undefined;
  }

  const handleNext = () => {
    if (!currentSection || !currentQuestion || !isCurrentQuestionAnswered()) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }

    if (currentQuestionInSectionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex + 1);
    } else if (currentSectionIndex < TOTAL_SECTIONS - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionInSectionIndex(0);
    } else {
      setShowOptionalIntro(true);
    }
  };

  const handlePrevious = () => {
    setTakingOptionalTest(false);
    setShowOptionalIntro(false);
    if (currentQuestionInSectionIndex > 0) {
      setCurrentQuestionInSectionIndex(currentQuestionInSectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = psychometricTestSections[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionInSectionIndex(prevSection.questions.length - 1);
    }
  };
  
  const handleNextOptional = () => {
    if (!currentOptionalQuestion || !isCurrentOptionalQuestionAnswered()) {
        toast({ title: 'Please select an answer', variant: 'destructive'});
        return;
    }
    if (currentOptionalQuestionIndex < optionalRatingQuestions.length - 1) {
        setCurrentOptionalQuestionIndex(prev => prev + 1);
    } else {
        handleSubmitTest(); 
    }
  };

  const handlePreviousOptional = () => {
    if (currentOptionalQuestionIndex > 0) {
        setCurrentOptionalQuestionIndex(prev => prev - 1);
    } else {
        setTakingOptionalTest(false);
        setShowOptionalIntro(true);
    }
  };

  const startOptionalTest = () => {
    setTakingOptionalTest(true);
    setShowOptionalIntro(false);
  };

  const compileTraitsToString = (): string => {
    let traitSummary = "";

    psychometricTestSections.forEach(section => {
      traitSummary += `[Section: ${section.title}]\\n`;
      section.questions.forEach(q => {
        const answer = answers[q.id];
        if (answer !== undefined) {
          let answerText = `Answer: ${answer}`;
          if (q.type === 'slider') {
            answerText = `Value: ${answer} (Poles: ${q.poles[0].label} to ${q.poles[1].label})`;
          } else if (q.type === 'choice' || q.type === 'scenario') {
            const chosenOption = q.options.find(opt => opt.id === answer);
            answerText = `Selected: "${chosenOption?.text || answer}"`;
          }
          traitSummary += `  [Q: ${q.text || (q as any).scenario + ' - ' + (q as any).questionText}] ${answerText}\\n`;
        }
      });
    });

    if (Object.keys(optionalAnswers).length > 0) {
        traitSummary += "\\n[Optional Questions Insights]\\n";
        optionalRatingQuestions.forEach(oq => {
            const answer = optionalAnswers[oq.id];
            if (answer !== undefined) {
                traitSummary += `  [Q: ${oq.text}] Rating: ${answer}/5\\n`;
            }
        });
    }
    return traitSummary.trim();
  };

  const handleSubmitTest = async (skipOptional = false) => {
    if (!user) {
        toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive'});
        return;
    }
    if (!skipOptional && takingOptionalTest && !isCurrentOptionalQuestionAnswered()) {
        toast({ title: 'Please answer the current optional question, or skip.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    const userTraits = compileTraitsToString();

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { 
        userTraits: userTraits,
        testCompleted: true,
      });

      localStorage.setItem('margdarshak_user_traits', userTraits);
      
      // Clear subsequent data to ensure a fresh flow from this point
      localStorage.removeItem('margdarshak_personalized_answers');
      localStorage.removeItem('margdarshak_all_career_suggestions');
      localStorage.removeItem('margdarshak_selected_careers_list');
      localStorage.removeItem('margdarshak_payment_successful');
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
    } finally {
      setIsLoading(false);
    }
  };


  if (pageLoading || !user) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (showOptionalIntro) {
    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl">Optional Questions</CardTitle>
                    <CardDescription>
                        You've completed the main part! Answer {optionalRatingQuestions.length} more optional questions for potentially higher prediction accuracy, or proceed with current results.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                     <p className="text-sm text-muted-foreground">These questions are rated on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button onClick={startOptionalTest} className="w-full sm:w-auto">Start Optional Questions</Button>
                    <Button onClick={() => handleSubmitTest(true)} variant="outline" className="w-full sm:w-auto">Skip & Submit Now</Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  if (takingOptionalTest && currentOptionalQuestion) {
    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-primary" />
                            <CardTitle className="text-2xl">Optional Questions</CardTitle>
                        </div>
                        <span className="text-sm text-muted-foreground">Question {currentOptionalQuestionIndex + 1} of {optionalRatingQuestions.length}</span>
                    </div>
                    <CardDescription>Rate the following statement from 1 (Strongly Disagree) to 5 (Strongly Agree).</CardDescription>
                    <Progress value={optionalProgress} className="w-full mt-2 h-3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg font-semibold">{currentOptionalQuestion.text}</p>
                    <RadioGroup
                        value={optionalAnswers[currentOptionalQuestion.id]?.toString() || ''}
                        onValueChange={(value) => handleOptionalAnswerChange(currentOptionalQuestion.id, parseInt(value))}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <div key={value} className="flex flex-col items-center space-y-1">
                                <RadioGroupItem value={value.toString()} id={`${currentOptionalQuestion.id}-val-${value}`} className="h-6 w-6"/>
                                <Label htmlFor={`${currentOptionalQuestion.id}-val-${value}`} className="text-sm cursor-pointer">
                                    {value === 1 && 'Strongly Disagree'}
                                    {value === 2 && 'Disagree'}
                                    {value === 3 && 'Neutral'}
                                    {value === 4 && 'Agree'}
                                    {value === 5 && 'Strongly Agree'}
                                    {!([1,2,3,4,5].includes(value)) && value.toString()}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between space-x-3">
                     <Button onClick={handlePreviousOptional} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {isLoading ? <LoadingSpinner /> : (
                        currentOptionalQuestionIndex < optionalRatingQuestions.length - 1 ? (
                            <Button onClick={handleNextOptional} className="px-6 py-3" disabled={!isCurrentOptionalQuestionAnswered()}>Next Optional</Button>
                        ) : (
                            <Button onClick={() => handleSubmitTest(false)} className="px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!isCurrentOptionalQuestionAnswered()}>
                                Submit All Answers <CheckCircle className="ml-2 h-5 w-5" />
                            </Button>
                        )
                    )}
                </CardFooter>
            </Card>
        </div>
    );
  }


  if (!currentSection || !currentQuestion) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }
  
  const questionKey = `${currentSection.id}-${currentQuestion.id}`;


  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {TOTAL_SECTIONS} - Question {currentQuestionInSectionIndex + 1} of {currentSection.questions.length}</span>
          </div>
          <CardDescription>{currentSection.focusArea} ({currentSection.questionTypeDescription})</CardDescription>
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
                defaultValue={[answers[currentQuestion.id] !== undefined ? Number(answers[currentQuestion.id]) : 3]}
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
              <p className="text-lg font-semibold">{currentQuestion.type === 'choice' ? currentQuestion.text : currentQuestion.questionText}</p>
              {currentQuestion.visualHint && <p className="text-sm text-muted-foreground italic mb-2">{currentQuestion.visualHint}</p>}
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
          <Button onClick={handlePrevious} variant="outline" disabled={currentSectionIndex === 0 && currentQuestionInSectionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {isLoading ? (
            <LoadingSpinner />
          ) : currentSectionIndex < TOTAL_SECTIONS - 1 || currentQuestionInSectionIndex < currentSection.questions.length - 1 ? (
            <Button onClick={handleNext} className="text-lg px-6 py-3" disabled={!isCurrentQuestionAnswered()}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleNext} className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600" disabled={!isCurrentQuestionAnswered()}>
              Finish Main Questions <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
